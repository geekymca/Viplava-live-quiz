import React, { useState, useEffect } from 'react';
import { ViplavaLandingPage } from './components/ViplavaLandingPage.tsx';
import { ViplavaJoinQuiz } from './components/ViplavaJoinQuiz.tsx';
import { ViplavaActiveQuiz } from './components/ViplavaActiveQuiz.tsx';
import { ViplavaAdmin } from './components/ViplavaAdmin.tsx';
import { Background3DGrid } from './three/Background3DGrid.tsx';
import { PageLoader } from './components/PageLoader.tsx';
import { socket } from './socket.ts';
import { apiClient } from './services/apiClient.ts';
import { Quiz, RoomState, Participant } from './types.ts';
import { DEFAULT_QUIZZES } from './data/defaultQuizzes.ts';
import { sounds } from './audio/soundEffects.ts';
import { Volume2, VolumeX } from 'lucide-react';

export type AppView = 'home' | 'join' | 'active_quiz' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [quizzes, setQuizzes] = useState<Quiz[]>(DEFAULT_QUIZZES);
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(socket.connected);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.isEnabled());

  const [playerResult, setPlayerResult] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    totalScore: number;
    rank: number;
    correctOptionId: string;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Fetch quizzes from central server
  useEffect(() => {
    apiClient
      .getQuizzes()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuizzes(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch remote quizzes, using defaults:', err);
      });
  }, []);

  // Socket.IO event synchronization
  useEffect(() => {
    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleRoomState = (state: RoomState) => {
      setActiveRoom(state);

      // Automatic view transition for participants when host starts the quiz
      if (
        currentParticipant &&
        (state.phase === 'question' ||
          state.phase === 'buzzer_open' ||
          state.phase === 'buzzer_locked' ||
          state.phase === 'reveal' ||
          state.phase === 'leaderboard' ||
          state.phase === 'podium')
      ) {
        setCurrentView('active_quiz');
      }

      if (state.phase === 'question') {
        sounds.playWhoosh();
        setPlayerResult(null);
      } else if (state.phase === 'reveal') {
        sounds.playDing();
      } else if (state.phase === 'podium') {
        sounds.playFanfare();
      }
    };

    const handlePlayerResult = (res: {
      isCorrect: boolean;
      pointsEarned: number;
      totalScore: number;
      rank: number;
      correctOptionId: string;
    }) => {
      setPlayerResult(res);
      if (res.isCorrect) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
    };

    const handleRoomError = (msg: string) => {
      showNotification(msg);
      setActiveRoom(null);
      setPlayerResult(null);
      setCurrentView('home');
    };

    const handleKicked = () => {
      showNotification('You have been removed from this quiz session by the host.');
      setCurrentParticipant(null);
      setActiveRoom(null);
      setCurrentView('home');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room:state', handleRoomState);
    socket.on('player:result', handlePlayerResult);
    socket.on('room:error', handleRoomError);
    socket.on('room:kicked', handleKicked);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room:state', handleRoomState);
      socket.off('player:result', handlePlayerResult);
      socket.off('room:error', handleRoomError);
      socket.off('room:kicked', handleKicked);
    };
  }, [currentParticipant]);

  // Host Actions
  const handleHostCreateRoom = (quizId: string) => {
    socket.emit('host:create_room', quizId, (res) => {
      if (!res.success) {
        showNotification(res.error || 'Failed to create room.');
      } else {
        showNotification(`Room ${res.roomCode} launched! Waiting for devotees.`);
      }
    });
  };

  const handleSaveQuiz = (newQuiz: Quiz) => {
    apiClient
      .saveQuiz(newQuiz)
      .then((saved) => {
        setQuizzes((prev) => {
          const idx = prev.findIndex((q) => q.id === saved.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = saved;
            return updated;
          }
          return [...prev, saved];
        });
        showNotification(`Saved "${saved.title}"! Ready to host in Dham.`);
      })
      .catch((err) => {
        console.error('Failed to save quiz:', err);
        setQuizzes((prev) => [...prev, newQuiz]);
      });
  };

  const handleHostStartQuiz = (roomCode: string) => {
    socket.emit('host:start_quiz', roomCode);
  };

  const handleHostNextQuestion = (roomCode: string) => {
    socket.emit('host:next_question', roomCode);
  };

  const handleHostRevealAnswer = (roomCode: string) => {
    socket.emit('host:reveal_answer', roomCode);
  };

  const handleHostOpenBuzzer = (roomCode: string) => {
    socket.emit('host:open_buzzer', roomCode);
  };

  const handleHostCloseBuzzer = (roomCode: string) => {
    socket.emit('host:close_buzzer', roomCode);
  };

  const handleHostShowLeaderboard = (roomCode: string) => {
    socket.emit('host:show_leaderboard', roomCode);
  };

  const handleHostShowPodium = (roomCode: string) => {
    socket.emit('host:show_podium', roomCode);
  };

  const handleHostResetRoom = (roomCode: string) => {
    socket.emit('host:reset_room', roomCode);
    setActiveRoom(null);
  };

  const handleHostToggleEntry = (roomCode: string, allow: boolean) => {
    socket.emit('host:toggle_entry', { roomCode, allow });
    showNotification(allow ? 'Registration unlocked for new participants' : 'Registration locked by host');
  };

  const handleHostRemoveParticipant = (roomCode: string, participantId: string) => {
    socket.emit('host:remove_participant', { roomCode, participantId });
  };

  const handleHostSimulateBots = (roomCode: string, count: number) => {
    socket.emit('host:simulate_bots', { roomCode, count });
    showNotification(`Simulated ${count} contenders in Gokul Mathura Dham arena!`);
  };

  // Participant Actions
  const handleSocketJoin = (
    data: { roomCode: string; fullName: string; institution: string; participationType: 'individual' | 'team' },
    callback: (res: { success: boolean; error?: string; state?: RoomState; participant?: Participant }) => void
  ) => {
    socket.emit('player:join_room', data, (res) => {
      if (res.success && res.participant) {
        setCurrentParticipant(res.participant);
        if (res.state) setActiveRoom(res.state);
      }
      callback(res);
    });
  };

  const handleSubmitAnswer = (roomCode: string, questionId: string, optionId: string) => {
    socket.emit('player:submit_answer', { roomCode, questionId, optionId });
  };

  const handlePressBuzzer = (roomCode: string) => {
    socket.emit('player:press_buzzer', { roomCode });
  };

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  return (
    <div className="min-h-screen bg-[#071329] text-[#FFF4D8] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#E8B957] selection:text-[#071329]">
      {/* Serene 3D Temple Grid & Floating Golden Yamuna Sparks */}
      <Background3DGrid />

      {/* Floating Devotional Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-[#101b33] border-2 border-[#E8B957] text-[#FFF4D8] text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl shadow-[#E8B957]/20 animate-fade-in flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8B957] animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* Persistent Audio Control Pill */}
      <button
        onClick={handleToggleSound}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-full bg-[#101b33]/90 hover:bg-[#1a2b4f] border border-[#E8B957]/40 text-[#E8B957] text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-2 transition-all transform hover:scale-105"
        title={soundEnabled ? 'Mute audio' : 'Enable audio'}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        <span className="text-[11px] hidden sm:inline">{soundEnabled ? 'Audio On' : 'Muted'}</span>
      </button>

      {/* App Main Viewport Router */}
      {!socketConnected ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <PageLoader
            message="Connecting to Gokul Mathura Dham Arena..."
            subtext="Synchronizing Realtime Engine on Port 3000"
          />
        </div>
      ) : currentView === 'home' ? (
        <ViplavaLandingPage
          onEnterQuiz={() => {
            sounds.playWhoosh();
            setCurrentView('join');
          }}
          onOpenAdmin={() => {
            sounds.playDing();
            setCurrentView('admin');
          }}
        />
      ) : currentView === 'join' ? (
        <ViplavaJoinQuiz
          onBack={() => {
            sounds.playWhoosh();
            setCurrentView('home');
          }}
          onJoinSuccess={(_roomCode, participant) => {
            setCurrentParticipant(participant);
          }}
          activeRoomState={activeRoom}
          onSocketJoin={handleSocketJoin}
        />
      ) : currentView === 'active_quiz' && activeRoom ? (
        <ViplavaActiveQuiz
          roomState={activeRoom}
          currentParticipant={currentParticipant}
          onSubmitAnswer={handleSubmitAnswer}
          onPressBuzzer={handlePressBuzzer}
          playerResult={playerResult}
          onExit={() => {
            sounds.playWhoosh();
            setCurrentView('home');
          }}
        />
      ) : currentView === 'admin' ? (
        <ViplavaAdmin
          quizzes={quizzes}
          onSaveQuiz={handleSaveQuiz}
          activeRoom={activeRoom}
          onLaunchRoom={handleHostCreateRoom}
          onStartQuiz={handleHostStartQuiz}
          onNextQuestion={handleHostNextQuestion}
          onRevealAnswer={handleHostRevealAnswer}
          onOpenBuzzer={handleHostOpenBuzzer}
          onCloseBuzzer={handleHostCloseBuzzer}
          onShowLeaderboard={handleHostShowLeaderboard}
          onShowPodium={handleHostShowPodium}
          onResetRoom={handleHostResetRoom}
          onToggleEntry={handleHostToggleEntry}
          onRemoveParticipant={handleHostRemoveParticipant}
          onSimulateBots={handleHostSimulateBots}
          onBackToHome={() => {
            sounds.playWhoosh();
            setCurrentView('home');
          }}
        />
      ) : (
        <ViplavaLandingPage
          onEnterQuiz={() => setCurrentView('join')}
          onOpenAdmin={() => setCurrentView('admin')}
        />
      )}
    </div>
  );
}
