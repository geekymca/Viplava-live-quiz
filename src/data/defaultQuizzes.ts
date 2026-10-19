import { Quiz, RoundConfig } from '../types.ts';

const VIPLAVA_ROUNDS: RoundConfig[] = [
  {
    id: 'rnd-general',
    type: 'general',
    name: 'General Round',
    description: 'Open to all participants. A diverse set of questions on Srila Prabhupada, ISKCON and his teachings.',
    enabled: true,
    questionCount: 4,
    timeLimitSeconds: 15,
    points: 10,
    negativePoints: 0,
  },
  {
    id: 'rnd-rapid',
    type: 'rapid_fire',
    name: 'Rapid Fire Round',
    description: 'Selected participants. Quick questions. Think fast! Test your sharpness and recall.',
    enabled: true,
    questionCount: 3,
    timeLimitSeconds: 10,
    points: 15,
    negativePoints: 2,
  },
  {
    id: 'rnd-buzzer',
    type: 'buzzer',
    name: 'Buzzer Round',
    description: 'Top participants. Real-time buzzer round with exciting questions. Speed, accuracy and presence of mind!',
    enabled: true,
    questionCount: 3,
    timeLimitSeconds: 0, // host controlled
    points: 20,
    negativePoints: 5,
  },
];

export const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'viplava-2026-main',
    title: 'Viplava 2026 – Main Quiz',
    description: 'A quiz on the life, teachings and legacy of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada and ISKCON.',
    category: 'Srila Prabhupada & ISKCON',
    coverEmoji: '🪷',
    status: 'published',
    maxParticipants: 1000,
    allowNewParticipants: true,
    lockRegistrationOnStart: true,
    fasterAnswerBonus: true,
    negativeMarking: 0,
    createdAt: Date.now(),
    rounds: VIPLAVA_ROUNDS,
    questions: [
      // --- ROUND 1: GENERAL ROUND ---
      {
        id: 'q-g1',
        roundType: 'general',
        text: 'Which year did Srila Prabhupada establish ISKCON in New York City at 26 2nd Avenue?',
        options: [
          { id: 'opt-a', text: '1965' },
          { id: 'opt-b', text: '1966' },
          { id: 'opt-c', text: '1967' },
          { id: 'opt-d', text: '1970' },
        ],
        correctOptionId: 'opt-b',
        timeLimitSeconds: 15,
        points: 10,
        explanation: 'On July 13, 1966, Srila Prabhupada officially registered the International Society for Krishna Consciousness (ISKCON) in New York City.',
        category: 'ISKCON History'
      },
      {
        id: 'q-g2',
        roundType: 'general',
        text: 'Where did Srila Prabhupada first arrive in America on September 17, 1965 aboard the Jaladuta?',
        options: [
          { id: 'opt-a', text: 'Commonwealth Pier, Boston' },
          { id: 'opt-b', text: 'Brooklyn Harbor, New York' },
          { id: 'opt-c', text: 'San Francisco Bay' },
          { id: 'opt-d', text: 'Los Angeles Pier' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 15,
        points: 10,
        explanation: 'The cargo ship Jaladuta docked at Commonwealth Pier in Boston, Massachusetts, where Srila Prabhupada wrote his immortal prayer Markine Bhagavata-Dharma.',
        category: 'Jaladuta Voyage'
      },
      {
        id: 'q-g3',
        roundType: 'general',
        text: 'Which monumental scripture is considered the foundational manual of spiritual science translated and commented on by Srila Prabhupada?',
        options: [
          { id: 'opt-a', text: 'Bhagavad-gita As It Is' },
          { id: 'opt-b', text: 'Patanjali Yoga Sutras' },
          { id: 'opt-c', text: 'Manusmriti' },
          { id: 'opt-d', text: 'Rig Veda' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 15,
        points: 10,
        explanation: 'Bhagavad-gita As It Is is the most widely distributed, respected, and authorized English commentary on the words of Lord Krishna.',
        category: 'Vedic Scriptures'
      },
      {
        id: 'q-g4',
        roundType: 'general',
        text: 'What does the acronym "ISKCON" stand for?',
        options: [
          { id: 'opt-a', text: 'International Society for Krishna Consciousness' },
          { id: 'opt-b', text: 'Indian Society for Knowledge and Consciousness' },
          { id: 'opt-c', text: 'International Sansthan of Krishna Culture' },
          { id: 'opt-d', text: 'Institution for Sanatana Krishna Consciousness' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 15,
        points: 10,
        explanation: 'Srila Prabhupada intentionally chose "International Society for Krishna Consciousness" to emphasize God Consciousness as a universal reality.',
        category: 'ISKCON Foundations'
      },

      // --- ROUND 2: RAPID FIRE ROUND ---
      {
        id: 'q-rf1',
        roundType: 'rapid_fire',
        text: 'Who was the spiritual master of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada?',
        options: [
          { id: 'opt-a', text: 'Srila Bhaktisiddhanta Sarasvati Thakura' },
          { id: 'opt-b', text: 'Srila Gaurakishora Dasa Babaji' },
          { id: 'opt-c', text: 'Srila Bhaktivinoda Thakura' },
          { id: 'opt-d', text: 'Srila Jagannatha Dasa Babaji' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 10,
        points: 15,
        explanation: 'Srila Bhaktisiddhanta Sarasvati Gosvami Maharaja initiated him in 1933 and instructed him to preach Lord Chaitanya\'s message in the English language.',
        category: 'Guru Parampara'
      },
      {
        id: 'q-rf2',
        roundType: 'rapid_fire',
        text: 'What was the birth name of Srila Prabhupada given by his loving parents in Calcutta in 1896?',
        options: [
          { id: 'opt-a', text: 'Abhay Charan De' },
          { id: 'opt-b', text: 'Gour Mohan De' },
          { id: 'opt-c', text: 'Nimai Charan Sen' },
          { id: 'opt-d', text: 'Keshava Chandra' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 10,
        points: 15,
        explanation: 'Born on Nandotsava in 1896 in Calcutta, his father Gour Mohan De named him Abhay Charan, "one who is fearless at the lotus feet of Krishna".',
        category: 'Life Biography'
      },
      {
        id: 'q-rf3',
        roundType: 'rapid_fire',
        text: 'In which holy river ghat of Mathura did Lord Krishna rest after delivering Mathura from King Kamsa?',
        options: [
          { id: 'opt-a', text: 'Vishram Ghat' },
          { id: 'opt-b', text: 'Brahmanda Ghat' },
          { id: 'opt-c', text: 'Kesi Ghat' },
          { id: 'opt-d', text: 'Manikarnika Ghat' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 10,
        points: 15,
        explanation: 'At Vishram Ghat on the Yamuna in Mathura, Lord Sri Krishna took His rest (vishram) after slaying Kamsa.',
        category: 'Mathura Dham'
      },

      // --- ROUND 3: BUZZER ROUND ---
      {
        id: 'q-bz1',
        roundType: 'buzzer',
        text: 'BUZZER: Name the historic park in New York City where Srila Prabhupada chanted the Hare Krishna Mahamantra under an American Elm tree in 1966!',
        options: [
          { id: 'opt-a', text: 'Tompkins Square Park' },
          { id: 'opt-b', text: 'Central Park' },
          { id: 'opt-c', text: 'Washington Square Park' },
          { id: 'opt-d', text: 'Battery Park' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 0,
        points: 20,
        explanation: 'On October 9, 1966, Srila Prabhupada sat beneath the Elm tree in Tompkins Square Park and led the first recorded outdoor Harinama Sankirtana in the West.',
        category: 'Historic Sankirtan'
      },
      {
        id: 'q-bz2',
        roundType: 'buzzer',
        text: 'BUZZER: At which sacred ghat in Gokul did baby Krishna open His mouth to reveal all universes and cosmic planetary systems to Mother Yashoda?',
        options: [
          { id: 'opt-a', text: 'Brahmanda Ghat' },
          { id: 'opt-b', text: 'Chira Ghat' },
          { id: 'opt-c', text: 'Raman Reti' },
          { id: 'opt-d', text: 'Kaliyahrad Ghat' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 0,
        points: 20,
        explanation: 'At Brahmanda Ghat in Gokul Mahavan, Mother Yashoda saw the entire Brahmanda (cosmic creation) in the mouth of Gopal.',
        category: 'Gokul Pastimes'
      },
      {
        id: 'q-bz3',
        roundType: 'buzzer',
        text: 'BUZZER: How many times did Srila Prabhupada circle the entire globe between 1965 and 1977 to establish over 108 temples?',
        options: [
          { id: 'opt-a', text: '14 times' },
          { id: 'opt-b', text: '7 times' },
          { id: 'opt-c', text: '21 times' },
          { id: 'opt-d', text: '5 times' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 0,
        points: 20,
        explanation: 'Despite advanced age and health challenges, Srila Prabhupada circled the globe 14 times on preaching tours, speaking with heads of state and inspiring millions.',
        category: 'Global Preaching'
      }
    ]
  },
  {
    id: 'viplava-practice-quiz',
    title: 'Practice Quiz — Viplava 2026',
    description: 'Self-paced practice quiz for devotees and students to test spiritual knowledge.',
    category: 'Practice & Self-Paced',
    coverEmoji: '📜',
    status: 'draft',
    maxParticipants: 500,
    allowNewParticipants: true,
    lockRegistrationOnStart: false,
    fasterAnswerBonus: false,
    negativeMarking: 0,
    createdAt: Date.now() - 86400000,
    rounds: VIPLAVA_ROUNDS.slice(0, 2),
    questions: [
      {
        id: 'q-p1',
        roundType: 'general',
        text: 'How many cantos comprise the full edition of the Srimad Bhagavatam translated by Srila Prabhupada?',
        options: [
          { id: 'opt-a', text: '12 Cantos' },
          { id: 'opt-b', text: '10 Cantos' },
          { id: 'opt-c', text: '18 Cantos' },
          { id: 'opt-d', text: '8 Cantos' },
        ],
        correctOptionId: 'opt-a',
        timeLimitSeconds: 15,
        points: 10,
        explanation: 'Srimad Bhagavatam (Bhagavata Purana) consists of 12 Cantos, containing 18,000 verses.',
        category: 'Srimad Bhagavatam'
      }
    ]
  },
  {
    id: 'viplava-prelims',
    title: 'Prelims — ISKCON 2026',
    description: 'Preliminary qualification round for national Viplava 2026 tournament.',
    category: 'Tournament Prelims',
    coverEmoji: '🚩',
    status: 'draft',
    maxParticipants: 1000,
    allowNewParticipants: false,
    lockRegistrationOnStart: true,
    fasterAnswerBonus: true,
    negativeMarking: 1,
    createdAt: Date.now() - 172800000,
    rounds: VIPLAVA_ROUNDS,
    questions: []
  }
];
