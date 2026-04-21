export interface Deck {
  id: string;
  name: string;
  created_at: string;
  last_studied: string | null;
  card_count: number;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  topic: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string | null;
  created_at: string;
}

export interface StudySession {
  id: string;
  deck_id: string;
  cards_studied: number;
  easy_count: number;
  hard_count: number;
  again_count: number;
  studied_at: string;
}

export interface UserStats {
  id: string;
  date: string;
  cards_practiced: number;
  streak: number;
}
