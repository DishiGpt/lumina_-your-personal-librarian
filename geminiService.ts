
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, DiscoveryResults } from "./types";
import { SYSTEM_PROMPT } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getDiscoveryResults(
  prefs: UserPreferences,
  history: string[] = []
): Promise<DiscoveryResults> {
  const prompt = `
    User Profile:
    - Books previously read: ${prefs.pastBooks}
    - Total books read: ${prefs.bookCount}
    - Favorite Genres: ${prefs.primaryGenre}, ${prefs.secondaryGenre}
    - Movies/TV Shows liked: ${prefs.moviesShows}
    - Preferred Pace: ${prefs.pace}
    - Preferred Mood: ${prefs.mood}
    - Desired Complexity: ${prefs.complexity}

    Previous Recommendations (DO NOT REPEAT): ${history.join(", ")}

    Please provide a curated "Discovery Bundle" containing:
    1. Exactly 4 Book Recommendations.
    2. 2-3 Movie or TV Series Recommendations that share the same thematic or emotional DNA as the book recommendations and the user's tastes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT + "\nYou must also provide related movie or series recommendations that complement the books.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            books: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["title", "author", "genres", "description", "reason"],
              },
            },
            movies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  year: { type: Type.STRING },
                  type: { type: Type.STRING, description: "Either 'Movie' or 'Series'" },
                  genres: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["title", "year", "type", "genres", "description", "reason"],
              },
            },
          },
          required: ["books", "movies"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching discovery results:", error);
    throw error;
  }
}
