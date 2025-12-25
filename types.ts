
export interface UserPreferences {
  pastBooks: string;
  bookCount: string;
  primaryGenre: string;
  secondaryGenre: string;
  moviesShows: string;
  pace: string;
  mood: string;
  complexity: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  genres: string[];
  description: string;
  reason: string;
  coverUrl?: string;
}

export interface MovieRecommendation {
  title: string;
  year: string;
  type: 'Movie' | 'Series';
  genres: string[];
  description: string;
  reason: string;
  posterUrl?: string;
}

export interface DiscoveryResults {
  books: BookRecommendation[];
  movies: MovieRecommendation[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}

export interface SavedList {
  id: string;
  name: string;
  timestamp: number;
  results: DiscoveryResults;
  preferences: UserPreferences;
}

export interface RecommendationSession {
  timestamp: number;
  preferences: UserPreferences;
  results: DiscoveryResults;
}

export type Step = 'welcome' | 'history' | 'genres' | 'media' | 'mood' | 'loading' | 'results' | 'archive';
