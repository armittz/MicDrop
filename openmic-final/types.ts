
export interface UserProgress {
  streak: number;
  lastPracticeDate: string | null;
  totalTimeSpoken: number; 
  confidenceHistory: number[];
  practiceSessions: PracticeSession[];
  currentLevelId: string;
  completedPromptIds: string[];
  badges: string[];
}

export interface PracticeSession {
  id: string;
  date: string;
  prompt: string;
  transcript: string;
  duration: number;
  confidence: number;
  feedback: AIFeedback;
  audioUrl?: string; // Optional URL for local playback
}

export interface AIFeedback {
  encouragement: string;
  alternatives: string[];
  vocabulary: { word: string; definition: string; example: string }[];
  status: 'success' | 'empty' | 'too_short';
}

export interface PowerWordsRephrases {
  powerWords: string[]; // exactly 2 items
  rephrases: string[]; // exactly 2 items
}

export interface Level {
  id: string;
  title: string;
  description: string;
  prompts: SpeakingPrompt[];
}

export interface SpeakingPrompt {
  id: string;
  text: string;
  category: string;
}
