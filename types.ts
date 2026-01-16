export enum GameStatus {
  LOBBY = 'LOBBY',
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export enum Player {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
}

export interface Feedback {
  bulls: number; // Correct digit, correct position
  cows: number;  // Correct digit, wrong position
}

export interface Message {
  id: string;
  sender: Player;
  text: string;
  isGuess?: boolean;
  feedback?: Feedback;
  timestamp: number;
}

export interface TurnHistoryItem {
  guess: string;
  feedback: Feedback;
}