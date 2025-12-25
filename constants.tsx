
import React from 'react';
import { Book, Film, Heart, Brain, Zap, Clock, Star, Globe } from 'lucide-react';

export const GENRES = [
  "Fantasy", "Science Fiction", "Mystery", "Thriller", "Horror", 
  "Romance", "Historical Fiction", "Contemporary", "Non-Fiction", 
  "Biography", "History", "Philosophy", "Psychology", "Poetry"
];

export const PACES = ["Slow & Atmospheric", "Moderate", "Fast-Paced", "Breakneck"];
export const MOODS = ["Thought-provoking", "Heartwarming", "Dark & Gritty", "Inspiring", "Mysterious", "Funny"];
export const COMPLEXITIES = ["Light & Easy", "Standard", "Complex & Layered", "Dense & Academic"];

export const BOOK_COUNT_OPTIONS = ["0-10", "11-50", "51-200", "200+"];

export const SYSTEM_PROMPT = `You are a world-class book recommendation engine. 
Your goal is to provide 3-5 unique, personalized book suggestions based on a user's reading history, favorite movies/TV shows, and current mood.

Rules:
1. Diversity: Include a mix of popular bestsellers, critically acclaimed works, and hidden gems.
2. Novelty: Do not suggest common books the user likely already read if they are a heavy reader.
3. Analysis: Map the themes and tones of their favorite movies/TV shows to literary equivalents.
4. Explainability: Provide a compelling reason for each choice that explicitly references their inputs.
5. Tone: Professional, encouraging, and literate.`;
