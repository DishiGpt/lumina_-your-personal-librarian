# Lumina: AI Book & Cinematic Discovery 📚🎬

**Lumina** is an intelligent, premium discovery engine designed to bridge the gap between your favorite books and visual storytelling. By mapping your reading history, cinematic tastes, and current emotional state, Lumina curates personalized "Discovery Bundles" that include 4 book recommendations and 3 matching movie or series echoes.

---

## ✨ Features

- **Multimodal Mapping:** Considers your past books, preferred reading volume, and favorite movies/TV shows to find deep thematic matches.
- **Discovery Bundles:** Every search generates a balanced mix of 4 books and 3 cinematic recommendations (Movies or Series).
- **Rich Visuals:** Automatically fetches high-quality book covers (via Open Library) and movie posters (via iTunes API).
- **Personal Librarian AI:** Powered by Google's **Gemini 3 Flash**, providing articulate, context-aware reasoning for every suggestion.
- **The Archive:** Save your favorite discovery bundles to your personal archive. Persistent storage via LocalStorage ensures your history is never lost.
- **Premium UI:** A "Dark Academia" inspired interface built with Tailwind CSS, featuring smooth transitions and a responsive, step-based onboarding flow.

---

## 🚀 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **AI Engine:** Google Gemini API (`gemini-3-flash-preview`)
- **Icons:** Lucide React
- **Metadata APIs:**
  - [Open Library Search API](https://openlibrary.org/dev/docs/api/search) (Book Covers)
  - [iTunes Search API](https://performance-developer.apple.com/documentation/itunes-search-api) (Movie/TV Posters)

---

## 🛠️ Getting Started

### Prerequisites

- A [Google AI Studio](https://aistudio.google.com/) API Key.
- A modern browser.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/lumina-ai.git
   cd lumina-ai
   ```

2. **Setup Environment Variables:**
   Create a `.env` file in your project root or set your environment variables to include:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

3. **Install dependencies:**
   *(Note: This project uses ESM imports and is designed to run in a modern buildless or lightweight build environment. If using a standard React setup:)*
   ```bash
   npm install
   ```

4. **Run the application:**
   ```bash
   npm start
   ```

---

## 📖 How it Works

1. **Step 1: Reading History** – Input books you've recently enjoyed and your average annual reading volume.
2. **Step 2: Genre Direction** – Select your primary and secondary genre interests.
3. **Step 3: Cinematic Mapping** – List movies or TV series that resonate with you visually or narratively.
4. **Step 4: Tone & Mood** – Define the emotional "vibe" you are looking for (e.g., *Heartwarming*, *Dark & Gritty*).
5. **The Reveal** – Receive your curated bundle with posters, covers, and AI-generated insights.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- Google's **Gemini API** for the recommendation intelligence.
- **Open Library** and **Apple iTunes** for the public metadata APIs.
- The "Dark Academia" aesthetic for design inspiration.
