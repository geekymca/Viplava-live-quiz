import { Server, Socket } from 'socket.io';
import { GameStore, RoomInternal } from '../state/store.ts';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  Participant,
} from '../../src/types.ts';

export function registerSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  const store = GameStore.getInstance();

  function startQuestionTimer(room: RoomInternal) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    if (room.botAnswerTimeouts) {
      room.botAnswerTimeouts.forEach((t) => clearTimeout(t));
      room.botAnswerTimeouts = [];
    }

    const enabledRounds = room.quiz.rounds.filter((r) => r.enabled);
    const roundConfig = enabledRounds[room.currentRoundIndex] || enabledRounds[0];
    const duration = roundConfig?.timeLimitSeconds || 15;

    room.timeRemaining = duration;
    room.questionStartedAt = Date.now();
    room.answers.clear();

    const currentQ = room.quiz.questions[room.currentQuestionIndex];
    if (roundConfig?.type === 'buzzer') {
      room.buzzerState = {
        isOpen: true,
        winnerId: null,
        winnerName: null,
      };
    } else {
      room.buzzerState = {
        isOpen: false,
        winnerId: null,
        winnerName: null,
      };
    }

    // Bot contenders simulation
    const botPlayers = Array.from(room.players.values()).filter((p) => (p as { isBot?: boolean }).isBot);
    room.botAnswerTimeouts = [];

    botPlayers.forEach((bot) => {
      const delay = Math.floor(1000 + Math.random() * (duration * 1000 * 0.75));
      const t = setTimeout(() => {
        if (room.phase !== 'question') return;

        if (roundConfig?.type === 'buzzer') {
          if (room.buzzerState.isOpen && !room.buzzerState.winnerId && Math.random() > 0.6) {
            room.buzzerState = {
              isOpen: false,
              winnerId: bot.id,
              winnerName: bot.fullName,
              timestamp: Date.now(),
            };
            io.to(room.roomCode).emit('room:buzzer_pressed', {
              winnerId: bot.id,
              winnerName: bot.fullName,
              timestamp: Date.now(),
            });
            io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));
          }
          return;
        }

        if (currentQ && currentQ.options.length > 0) {
          const isCorrectAnswer = Math.random() < 0.75;
          const chosenOption = isCorrectAnswer
            ? currentQ.options.find((o) => o.id === currentQ.correctOptionId) || currentQ.options[0]
            : currentQ.options[Math.floor(Math.random() * currentQ.options.length)];

          const points = isCorrectAnswer ? roundConfig.points : -roundConfig.negativePoints;
          bot.score = Math.max(0, bot.score + points);
          if (isCorrectAnswer) bot.streak = (bot.streak || 0) + 1;
          else bot.streak = 0;

          bot.lastAnswer = {
            questionId: currentQ.id,
            optionId: chosenOption.id,
            isCorrect: isCorrectAnswer,
            pointsEarned: points,
            responseTimeMs: delay,
          };

          room.answers.set(bot.id, { optionId: chosenOption.id, responseTimeMs: delay });
          store.recalculateLeaderboard(room);
          io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));
        }
      }, delay);

      room.botAnswerTimeouts?.push(t);
    });

    io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));

    room.timerInterval = setInterval(() => {
      if (room.timeRemaining === undefined) return;
      room.timeRemaining -= 1;

      if (room.timeRemaining <= 0) {
        clearInterval(room.timerInterval!);
        room.timerInterval = null;
        revealAnswerPhase(room);
      } else {
        io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    }, 1000);
  }

  function revealAnswerPhase(room: RoomInternal) {
    if (room.timerInterval) clearInterval(room.timerInterval);
    if (room.botAnswerTimeouts) {
      room.botAnswerTimeouts.forEach((t) => clearTimeout(t));
      room.botAnswerTimeouts = [];
    }

    room.phase = 'reveal';
    const currentQ = room.quiz.questions[room.currentQuestionIndex];

    // Compute answer stats
    const optionCounts: Record<string, number> = {};
    if (currentQ) {
      currentQ.options.forEach((opt) => {
        optionCounts[opt.id] = 0;
      });
      room.answers.forEach((ans) => {
        if (optionCounts[ans.optionId] !== undefined) {
          optionCounts[ans.optionId]++;
        }
      });
    }

    io.to(room.roomCode).emit('room:answer_stats', {
      totalAnswered: room.answers.size,
      totalPlayers: room.players.size,
      optionCounts,
    });

    io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));
    store.persistSnapshot(room, `revealed_q_${room.currentQuestionIndex}`);

    setTimeout(() => {
      if (room.phase !== 'reveal') return;
      room.phase = 'leaderboard';
      store.recalculateLeaderboard(room);
      io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));
      store.persistSnapshot(room, `leaderboard_q_${room.currentQuestionIndex}`);
    }, 3500);
  }

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    // Host Creates Room
    socket.on('host:create_room', (quizId, callback) => {
      const quiz = store.quizzes.find((q) => q.id === quizId) || store.quizzes[0];
      if (!quiz) {
        return callback({ success: false, error: 'Quiz not found' });
      }

      const roomCode = store.generateRoomCode();
      const room: RoomInternal = {
        roomCode,
        quiz,
        hostSocketId: socket.id,
        phase: 'lobby',
        currentRoundIndex: 0,
        currentQuestionIndex: 0,
        players: new Map(),
        answers: new Map(),
        buzzerState: { isOpen: false, winnerId: null, winnerName: null },
        leaderboard: [],
        allowNewParticipants: true,
        lastSavedAt: Date.now(),
      };

      store.rooms.set(roomCode, room);
      socket.join(roomCode);
      store.persistSnapshot(room, 'created');

      callback({
        success: true,
        roomCode,
      });
    });

    // Player Joins Room
    socket.on('player:join_room', (data, callback) => {
      const roomCode = (data.roomCode || '').toUpperCase().trim();
      const room = store.rooms.get(roomCode);

      if (!room) {
        return callback({
          success: false,
          error: 'Room code not found. Please verify with your quiz master.',
        });
      }

      if (!room.allowNewParticipants) {
        return callback({
          success: false,
          error: 'Registration is currently locked by the quiz host.',
        });
      }

      if (room.players.size >= (room.quiz.maxParticipants || 1000)) {
        return callback({
          success: false,
          error: 'Room capacity reached (1,000 contenders maximum).',
        });
      }

      const duplicate = Array.from(room.players.values()).find(
        (p) => p.fullName.toLowerCase() === data.fullName.trim().toLowerCase()
      );
      if (duplicate) {
        return callback({
          success: false,
          error: 'A participant with this full name has already registered in this room.',
        });
      }

      const avatars = ['🪷', '🦚', '🕉️', '✨', '🌟', '🚩', '📜', '🔔', '🌿'];
      const assignedAvatar = avatars[room.players.size % avatars.length];

      const participant: Participant = {
        id: socket.id,
        fullName: data.fullName.trim(),
        institution: data.institution.trim(),
        participationType: data.participationType || 'individual',
        avatar: assignedAvatar,
        status: 'ready',
        score: 0,
        streak: 0,
        rank: room.players.size + 1,
        prevRank: room.players.size + 1,
        device: 'Mobile (Web)',
        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      room.players.set(socket.id, participant);
      socket.join(roomCode);

      store.recalculateLeaderboard(room);

      io.to(roomCode).emit('room:player_joined', participant);
      io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      store.persistSnapshot(room, 'player_joined');

      callback({
        success: true,
        state: store.getPublicRoomState(room),
        participant,
      });
    });

    // Player Ready Status
    socket.on('player:set_ready', ({ roomCode, ready }) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (!room) return;
      const player = room.players.get(socket.id);
      if (player) {
        player.status = ready ? 'ready' : 'connected';
        io.to(roomCode).emit('room:player_updated', player);
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    // Player Submits Answer
    socket.on('player:submit_answer', ({ roomCode, questionId, optionId }) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (!room || room.phase !== 'question') return;

      const player = room.players.get(socket.id);
      if (!player) return;

      if (room.answers.has(socket.id)) return;

      const currentQ = room.quiz.questions[room.currentQuestionIndex];
      if (!currentQ || currentQ.id !== questionId) return;

      const elapsed = room.questionStartedAt ? Date.now() - room.questionStartedAt : 2000;
      const isCorrect = optionId === currentQ.correctOptionId;

      const enabledRounds = room.quiz.rounds.filter((r) => r.enabled);
      const currentRound = enabledRounds[room.currentRoundIndex] || enabledRounds[0];

      let pointsEarned = 0;
      if (isCorrect) {
        const basePoints = currentRound?.points || 10;
        let speedBonus = 0;
        if (room.quiz.fasterAnswerBonus) {
          const roundDuration = (currentRound?.timeLimitSeconds || 15) * 1000;
          const ratio = Math.max(0, 1 - elapsed / roundDuration);
          speedBonus = Math.round(ratio * 5);
        }
        pointsEarned = basePoints + speedBonus;
        player.score += pointsEarned;
        player.streak = (player.streak || 0) + 1;
      } else {
        const penalty = currentRound?.negativePoints || 0;
        player.score = Math.max(0, player.score - penalty);
        player.streak = 0;
        pointsEarned = -penalty;
      }

      player.lastAnswer = {
        questionId: currentQ.id,
        optionId,
        isCorrect,
        pointsEarned,
        responseTimeMs: elapsed,
      };

      room.answers.set(socket.id, {
        optionId,
        responseTimeMs: elapsed,
      });

      store.recalculateLeaderboard(room);

      socket.emit('player:result', {
        isCorrect,
        pointsEarned,
        totalScore: player.score,
        rank: player.rank,
        correctOptionId: currentQ.correctOptionId,
      });

      io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));

      if (room.answers.size >= room.players.size && room.players.size > 0) {
        revealAnswerPhase(room);
      }
    });

    // Player Hits Buzzer
    socket.on('player:press_buzzer', ({ roomCode }) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (!room || room.phase !== 'question') return;

      if (!room.buzzerState.isOpen || room.buzzerState.winnerId) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      room.buzzerState = {
        isOpen: false,
        winnerId: socket.id,
        winnerName: player.fullName,
        timestamp: Date.now(),
      };

      const enabledRounds = room.quiz.rounds.filter((r) => r.enabled);
      const currentRound = enabledRounds[room.currentRoundIndex];
      const buzzerBonus = currentRound?.points || 25;
      player.score += buzzerBonus;
      player.streak = (player.streak || 0) + 1;

      store.recalculateLeaderboard(room);

      io.to(room.roomCode).emit('room:buzzer_pressed', {
        winnerId: socket.id,
        winnerName: player.fullName,
        timestamp: Date.now(),
      });

      io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));
      store.persistSnapshot(room, `buzzer_won_by_${player.fullName}`);
    });

    // Host Starts Quiz
    socket.on('host:start_quiz', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (!room) return;

      room.phase = 'countdown';
      room.currentRoundIndex = 0;
      room.currentQuestionIndex = 0;
      io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      store.persistSnapshot(room, 'started_countdown');

      setTimeout(() => {
        if (!store.rooms.has(roomCode)) return;
        room.phase = 'question';
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
        startQuestionTimer(room);
        store.persistSnapshot(room, 'started_q_0');
      }, 4000);
    });

    // Host Advances Question
    socket.on('host:next_question', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (!room) return;

      if (room.currentQuestionIndex + 1 < room.quiz.questions.length) {
        room.currentQuestionIndex += 1;
        const currentQ = room.quiz.questions[room.currentQuestionIndex];
        const enabledRounds = room.quiz.rounds.filter((r) => r.enabled);
        const roundIdx = enabledRounds.findIndex((r) => r.type === currentQ.roundType);
        if (roundIdx >= 0) room.currentRoundIndex = roundIdx;

        room.phase = 'question';
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
        startQuestionTimer(room);
        store.persistSnapshot(room, `advanced_to_q_${room.currentQuestionIndex}`);
      } else {
        room.phase = 'podium';
        if (room.timerInterval) clearInterval(room.timerInterval);
        store.recalculateLeaderboard(room);
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
        store.persistSnapshot(room, 'podium_finished');
      }
    });

    // Host Reveals Answer Manually
    socket.on('host:reveal_answer', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room && room.phase === 'question') {
        revealAnswerPhase(room);
      }
    });

    // Host Opens/Closes Buzzer
    socket.on('host:open_buzzer', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room) {
        room.buzzerState = { isOpen: true, winnerId: null, winnerName: null };
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    socket.on('host:close_buzzer', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room) {
        room.buzzerState.isOpen = false;
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    socket.on('host:award_buzzer', ({ roomCode, isCorrect }) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (!room || !room.buzzerState.winnerId) return;

      const player = room.players.get(room.buzzerState.winnerId);
      if (player) {
        const enabledRounds = room.quiz.rounds.filter((r) => r.enabled);
        const round = enabledRounds[room.currentRoundIndex];
        const delta = isCorrect ? (round?.points || 20) : -(round?.negativePoints || 10);
        player.score = Math.max(0, player.score + delta);
        store.recalculateLeaderboard(room);
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    // Host Controls: Show Leaderboard / Podium
    socket.on('host:show_leaderboard', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room) {
        room.phase = 'leaderboard';
        store.recalculateLeaderboard(room);
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    socket.on('host:show_podium', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room) {
        room.phase = 'podium';
        store.recalculateLeaderboard(room);
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    socket.on('host:reset_room', (roomCode) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        room.phase = 'lobby';
        room.currentRoundIndex = 0;
        room.currentQuestionIndex = 0;
        room.players.forEach((p) => {
          p.score = 0;
          p.streak = 0;
        });
        store.recalculateLeaderboard(room);
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    socket.on('host:toggle_entry', ({ roomCode, allow }) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room) {
        room.allowNewParticipants = allow;
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    socket.on('host:remove_participant', ({ roomCode, participantId }) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (room) {
        room.players.delete(participantId);
        store.recalculateLeaderboard(room);
        io.to(roomCode).emit('room:player_left', {
          id: participantId,
          participantsCount: room.players.size,
        });
        io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      }
    });

    // Host Simulates Contenders
    socket.on('host:simulate_bots', ({ roomCode, count }) => {
      const room = store.rooms.get(roomCode.toUpperCase());
      if (!room) return;

      const names = [
        'Aarav Sharma', 'Meera Singh', 'Rohan Gupta', 'Ananya Patel', 'Priya Sharma',
        'Sneha Iyer', 'Kunal Das', 'Ritika Malhotra', 'Arjun Mehta', 'Dev Verma',
        'Ishaan Roy', 'Tanvi Joshi', 'Gaurav Rao', 'Diya Chawla', 'Kabir Sen'
      ];
      const institutions = ['Delhi University', 'Hindu College', 'IIT Delhi', 'St. Xavier’s', 'Lady Shri Ram College', 'Kirori Mal College'];

      const actualCount = Math.min(count, 1000 - room.players.size);
      for (let i = 0; i < actualCount; i++) {
        const bId = `bot_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
        const name = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(10 + Math.random() * 89)}`;
        const inst = institutions[Math.floor(Math.random() * institutions.length)];

        const botPlayer: Participant & { isBot: boolean } = {
          id: bId,
          fullName: name,
          institution: inst,
          participationType: 'individual',
          status: 'ready',
          score: room.currentQuestionIndex > 0 ? Math.floor(Math.random() * (room.currentQuestionIndex * 15)) : 0,
          streak: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0,
          rank: room.players.size + 1,
          prevRank: room.players.size + 1,
          device: 'Mobile (Android)',
          joinedAt: '10:25 AM',
          isBot: true,
        };

        room.players.set(bId, botPlayer);
      }

      store.recalculateLeaderboard(room);
      io.to(roomCode).emit('room:state', store.getPublicRoomState(room));
      store.persistSnapshot(room, `simulated_${actualCount}_participants`);
    });

    socket.on('disconnect', () => {
      store.rooms.forEach((room) => {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          store.recalculateLeaderboard(room);
          io.to(room.roomCode).emit('room:player_left', {
            id: socket.id,
            participantsCount: room.players.size,
          });
          io.to(room.roomCode).emit('room:state', store.getPublicRoomState(room));
        }
      });
    });
  });
}
