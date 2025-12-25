
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ChevronRight, ChevronLeft, Sparkles, RefreshCw, 
  History, ExternalLink, Bookmark, LogIn, LogOut, Search, 
  Archive as ArchiveIcon, Heart, User as UserIcon, X, Film, Tv, Clapperboard
} from 'lucide-react';
import { UserPreferences, DiscoveryResults, RecommendationSession, Step, User, SavedList } from './types';
import { GENRES, PACES, MOODS, COMPLEXITIES, BOOK_COUNT_OPTIONS } from './constants';
import { getDiscoveryResults } from './geminiService';

// Fetch book cover from Open Library
const fetchBookCover = async (title: string, author: string): Promise<string | undefined> => {
  try {
    const query = encodeURIComponent(`${title} ${author}`);
    const response = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
    const data = await response.json();
    if (data.docs && data.docs[0] && data.docs[0].cover_i) {
      return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-L.jpg`;
    }
    return undefined;
  } catch (err) {
    console.error("Book cover fetch failed", err);
    return undefined;
  }
};

// Fetch movie/series poster from iTunes Search API (public and CORS friendly)
const fetchMoviePoster = async (title: string, type: string): Promise<string | undefined> => {
  try {
    const entity = type === 'Series' ? 'tvShow' : 'movie';
    const query = encodeURIComponent(title);
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=${entity}&limit=1`);
    const data = await response.json();
    if (data.results && data.results[0] && data.results[0].artworkUrl100) {
      // Get higher resolution by replacing 100x100 with 600x600
      return data.results[0].artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
    }
    return undefined;
  } catch (err) {
    console.error("Movie poster fetch failed", err);
    return undefined;
  }
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    pastBooks: '',
    bookCount: '11-50',
    primaryGenre: '',
    secondaryGenre: '',
    moviesShows: '',
    pace: 'Moderate',
    mood: 'Thought-provoking',
    complexity: 'Standard',
  });
  const [results, setResults] = useState<DiscoveryResults | null>(null);
  const [history, setHistory] = useState<RecommendationSession[]>([]);
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sHistory = localStorage.getItem('lumina_history_v3');
    const sUser = localStorage.getItem('lumina_user');
    const sSaved = localStorage.getItem('lumina_saved_v3');
    if (sHistory) setHistory(JSON.parse(sHistory));
    if (sUser) setUser(JSON.parse(sUser));
    if (sSaved) setSavedLists(JSON.parse(sSaved));
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_history_v3', JSON.stringify(history));
    localStorage.setItem('lumina_saved_v3', JSON.stringify(savedLists));
    if (user) localStorage.setItem('lumina_user', JSON.stringify(user));
    else localStorage.removeItem('lumina_user');
  }, [history, savedLists, user]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        id: '12345',
        name: 'Theodore Finch',
        email: 'theodore@library.edu',
        photoUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Finch'
      };
      setUser(mockUser);
      setIsLoading(false);
    }, 1200);
  };

  const handleLogout = () => setUser(null);

  const handleFetch = async () => {
    setIsLoading(true);
    setStep('loading');
    setError(null);

    const pastTitles = history.flatMap(h => h.results.books.map(r => r.title));

    try {
      const discovery = await getDiscoveryResults(preferences, pastTitles);
      
      const booksWithCovers = await Promise.all(discovery.books.map(async (book) => {
        const coverUrl = await fetchBookCover(book.title, book.author);
        return { ...book, coverUrl };
      }));

      const moviesWithPosters = await Promise.all(discovery.movies.map(async (media) => {
        const posterUrl = await fetchMoviePoster(media.title, media.type);
        return { ...media, posterUrl };
      }));

      const finalResults = {
        books: booksWithCovers,
        movies: moviesWithPosters
      };

      setResults(finalResults);
      
      const newSession: RecommendationSession = {
        timestamp: Date.now(),
        preferences: { ...preferences },
        results: finalResults
      };
      setHistory(prev => [newSession, ...prev].slice(0, 10));
      setStep('results');
    } catch (err) {
      setError("The archives are temporarily inaccessible.");
      setStep('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveList = () => {
    if (!user) {
      alert("Please sign in to save your discovery to the Archive.");
      return;
    }
    if (!results) return;

    const name = prompt("Name this discovery bundle:", `${preferences.primaryGenre} & Cinematic Echoes`);
    if (!name) return;

    const newList: SavedList = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      timestamp: Date.now(),
      results,
      preferences: { ...preferences }
    };

    setSavedLists(prev => [newList, ...prev]);
    alert("Bundle archived successfully.");
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('history');
    else if (step === 'history') setStep('genres');
    else if (step === 'genres') setStep('media');
    else if (step === 'media') setStep('mood');
    else if (step === 'mood') handleFetch();
  };

  const prevStep = () => {
    const steps: Step[] = ['welcome', 'history', 'genres', 'media', 'mood', 'results'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx > 0) setStep(steps[currentIdx - 1]);
  };

  const updatePref = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pb-20 px-4 sm:px-6">
      <header className="w-full max-w-6xl py-6 flex items-center justify-between border-b border-stone-200 mb-12">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setStep('welcome')}>
          <div className="bg-stone-900 text-stone-50 p-2.5 rounded-lg group-hover:bg-amber-800 transition-all duration-300">
            <BookOpen size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 leading-none">Lumina</h1>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Personal Librarian</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => setStep('archive')} className={`hidden sm:flex items-center gap-2 text-sm font-semibold transition-colors ${step === 'archive' ? 'text-amber-800' : 'text-stone-500 hover:text-stone-900'}`}>
            <ArchiveIcon size={18} /> Archive
          </button>
          
          {user ? (
            <div className="flex items-center gap-3 pl-6 border-l border-stone-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-900">{user.name}</p>
                <button onClick={handleLogout} className="text-[10px] uppercase font-bold text-stone-400 hover:text-red-500 transition-colors">Sign Out</button>
              </div>
              <img src={user.photoUrl} alt={user.name} className="w-9 h-9 rounded-full border-2 border-amber-800/20" />
            </div>
          ) : (
            <button onClick={handleGoogleLogin} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-full text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm">
              <LogIn size={16} className="text-amber-600" /> Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-6xl">
        {step === 'welcome' && (
          <div className="max-w-2xl mx-auto text-center animate-enter py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-amber-800 text-[10px] uppercase font-bold tracking-widest mb-6">
              <Sparkles size={12} /> The Ultimate Discovery Suite
            </div>
            <h2 className="serif-text text-5xl sm:text-6xl font-bold text-stone-900 mb-8 leading-tight">
              Curating your next <span className="text-amber-800 italic">literary & cinematic</span> journey.
            </h2>
            <p className="text-xl text-stone-500 mb-12 leading-relaxed max-w-xl mx-auto">
              Tell Lumina what moves you. We'll find 4 books and 3 visual counterparts, complete with artwork and personalized reasoning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={nextStep} className="w-full sm:w-auto bg-stone-900 text-stone-50 py-4 px-10 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 flex items-center justify-center gap-2 group">
                Begin Discovery <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {savedLists.length > 0 && (
                <button onClick={() => setStep('archive')} className="w-full sm:w-auto border border-stone-200 py-4 px-10 rounded-2xl font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-2 text-stone-600">
                  <ArchiveIcon size={20} /> View Archive
                </button>
              )}
            </div>
          </div>
        )}

        {(['history', 'genres', 'media', 'mood'] as Step[]).includes(step) && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-stone-100 card-shadow animate-enter">
             <div className="flex gap-2 mb-10">
                {['history', 'genres', 'media', 'mood'].map((s, idx) => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${stepsOrder(step) >= idx ? 'bg-amber-800' : 'bg-stone-100'}`} />
                ))}
             </div>

             {step === 'history' && (
               <div className="animate-enter">
                  <h3 className="serif-text text-3xl font-bold mb-4">Reading History</h3>
                  <textarea value={preferences.pastBooks} onChange={(e) => updatePref('pastBooks', e.target.value)} placeholder="E.g. The Night Circus, Sapiens..." className="w-full h-40 bg-stone-50 border-none rounded-2xl p-6 text-stone-800 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-stone-300 text-lg" />
                  <div className="mt-8">
                    <label className="block text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Annual Volume</label>
                    <div className="flex flex-wrap gap-2">
                      {BOOK_COUNT_OPTIONS.map(opt => (
                        <button key={opt} onClick={() => updatePref('bookCount', opt)} className={`px-6 py-2 rounded-full border font-bold text-sm transition-all ${preferences.bookCount === opt ? 'bg-amber-800 border-amber-800 text-white' : 'border-stone-100 text-stone-500 hover:bg-stone-50'}`}>{opt} books</button>
                      ))}
                    </div>
                  </div>
               </div>
             )}

             {step === 'genres' && (
               <div className="animate-enter">
                  <h3 className="serif-text text-3xl font-bold mb-4">Genre Direction</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Primary</label>
                      <select value={preferences.primaryGenre} onChange={(e) => updatePref('primaryGenre', e.target.value)} className="w-full bg-stone-50 border-none rounded-xl p-4 text-lg outline-none focus:ring-2 focus:ring-amber-500/20">
                        <option value="">Select Genre</option>
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Secondary</label>
                      <select value={preferences.secondaryGenre} onChange={(e) => updatePref('secondaryGenre', e.target.value)} className="w-full bg-stone-50 border-none rounded-xl p-4 text-lg outline-none focus:ring-2 focus:ring-amber-500/20">
                        <option value="">Optional</option>
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
               </div>
             )}

             {step === 'media' && (
               <div className="animate-enter">
                  <h3 className="serif-text text-3xl font-bold mb-4">Cinematic mapping</h3>
                  <p className="text-stone-500 mb-8">What visual stories stay with you?</p>
                  <textarea value={preferences.moviesShows} onChange={(e) => updatePref('moviesShows', e.target.value)} placeholder="E.g. Dark, Succession, Inception..." className="w-full h-40 bg-stone-50 border-none rounded-2xl p-6 text-stone-800 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-stone-300 text-lg" />
               </div>
             )}

             {step === 'mood' && (
               <div className="animate-enter">
                  <h3 className="serif-text text-3xl font-bold mb-8">Set the Current Tone</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {MOODS.map(m => (
                      <button key={m} onClick={() => updatePref('mood', m)} className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${preferences.mood === m ? 'border-amber-800 bg-amber-50 text-amber-900' : 'border-stone-50 hover:bg-stone-50 text-stone-600'}`}>{m}</button>
                    ))}
                  </div>
               </div>
             )}

             <div className="flex gap-4 mt-12">
               <button onClick={prevStep} className="flex-1 py-4 border border-stone-100 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all flex justify-center items-center gap-2"><ChevronLeft size={18} /> Back</button>
               <button onClick={nextStep} disabled={step === 'genres' && !preferences.primaryGenre} className="flex-[2] py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all disabled:opacity-30 flex justify-center items-center gap-2">{step === 'mood' ? 'Find Matches' : 'Continue'} <ChevronRight size={18} /></button>
             </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 animate-pulse text-center">
            <div className="relative mb-12">
              <div className="w-24 h-24 border-4 border-amber-100 border-t-amber-900 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-amber-900"><Search size={32} /></div>
            </div>
            <h2 className="serif-text text-3xl font-bold text-stone-900 mb-4">Synthesizing your profile</h2>
            <p className="text-stone-400 italic max-w-sm">Curating 4 books and 3 cinematic experiences just for you...</p>
          </div>
        )}

        {step === 'results' && results && (
          <div className="animate-enter max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
              <div>
                <h2 className="serif-text text-4xl font-bold text-stone-900 mb-2">Discovery Bundle</h2>
                <p className="text-stone-400 font-medium">A curated selection for {user?.name || 'Guest'}</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={handleFetch} className="flex-1 sm:flex-none p-3 border border-stone-200 rounded-xl hover:bg-white transition-all text-stone-500"><RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} /></button>
                <button onClick={handleSaveList} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${user ? 'bg-amber-800 text-white hover:bg-amber-900 shadow-amber-800/10' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}><ArchiveIcon size={20} /> Save Bundle</button>
              </div>
            </div>

            <section className="mb-20">
              <div className="flex items-center gap-3 mb-10 border-b border-stone-100 pb-4">
                 <div className="p-2 bg-stone-900 text-stone-50 rounded-lg"><BookOpen size={20}/></div>
                 <h3 className="serif-text text-2xl font-bold">The Reading List</h3>
                 <span className="text-xs font-bold bg-stone-100 text-stone-400 px-2 py-1 rounded ml-auto">4 BOOKS</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {results.books.map((book, idx) => (
                  <div key={idx} className="bg-white rounded-[2rem] p-6 sm:p-8 card-shadow border border-stone-100 flex flex-col sm:flex-row gap-8 hover:border-amber-100 transition-all duration-500 group">
                    <div className="w-full sm:w-40 shrink-0 aspect-[2/3] bg-stone-50 rounded-xl overflow-hidden shadow-xl transition-transform group-hover:scale-[1.02]">
                      {book.coverUrl ? <img src={book.coverUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center italic text-stone-300 bg-stone-100 text-xs p-4 text-center">Cover Unavailable</div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {book.genres.slice(0, 2).map(g => <span key={g} className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-stone-50 text-stone-400 rounded border border-stone-100">{g}</span>)}
                      </div>
                      <h4 className="serif-text text-xl font-bold text-stone-900 mb-1 group-hover:text-amber-800 transition-colors">{book.title}</h4>
                      <p className="text-stone-400 font-bold text-sm mb-4">by {book.author}</p>
                      <p className="text-stone-600 text-sm leading-relaxed italic mb-4">"{book.description}"</p>
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100/50">
                        <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">Why Lumina suggest</p>
                        <p className="text-xs text-stone-600 font-medium">{book.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-10 border-b border-stone-100 pb-4">
                 <div className="p-2 bg-amber-800 text-white rounded-lg"><Clapperboard size={20}/></div>
                 <h3 className="serif-text text-2xl font-bold">Cinematic Echoes</h3>
                 <span className="text-xs font-bold bg-stone-100 text-stone-400 px-2 py-1 rounded ml-auto">PAIRED CONTENT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.movies.map((media, idx) => (
                  <div key={idx} className="bg-white rounded-[2rem] overflow-hidden border border-stone-100 card-shadow hover:bg-stone-900 group transition-all duration-500 flex flex-col">
                    <div className="aspect-[2/3] w-full bg-stone-50 relative overflow-hidden shrink-0">
                      {media.posterUrl ? (
                        <img src={media.posterUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={media.title} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-100 italic text-stone-300">
                          {media.type === 'Movie' ? <Film size={32} /> : <Tv size={32} />}
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest">Poster Unavailable</p>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-stone-800 group-hover:bg-amber-800 group-hover:text-white transition-colors">
                         {media.type === 'Movie' ? <Film size={18} /> : <Tv size={18} />}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="serif-text text-xl font-bold text-stone-900 group-hover:text-white transition-colors leading-tight">{media.title}</h4>
                        <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-500 uppercase tracking-widest ml-2">{media.year}</span>
                      </div>
                      <p className="text-stone-500 text-xs mb-6 group-hover:text-stone-400 line-clamp-3 leading-relaxed">"{media.description}"</p>
                      <div className="mt-auto pt-4 border-t border-stone-50 group-hover:border-stone-800">
                         <p className="text-[10px] font-bold text-amber-800 group-hover:text-amber-500 uppercase tracking-widest mb-1">Visual Connection</p>
                         <p className="text-xs text-stone-400 leading-relaxed italic line-clamp-4">{media.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-20 py-12 border-t border-stone-100 flex justify-center">
               <button onClick={() => setStep('welcome')} className="px-8 py-3 text-stone-400 hover:text-stone-900 font-bold transition-all">Return to Library Entrance</button>
            </div>
          </div>
        )}

        {step === 'archive' && (
          <div className="animate-enter py-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="serif-text text-4xl font-bold">Archived Discoveries</h2>
              <button onClick={() => setStep('welcome')} className="p-2 hover:bg-white rounded-full transition-all"><X size={24} /></button>
            </div>
            {savedLists.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-stone-100">
                <ArchiveIcon size={48} className="mx-auto mb-6 text-stone-200" />
                <p className="text-stone-400 font-medium">Archive empty. Begin your first discovery to save results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedLists.map(list => (
                  <div key={list.id} onClick={() => { setResults(list.results); setStep('results'); }} className="bg-white p-6 rounded-[2rem] border border-stone-100 card-shadow hover:border-amber-200 cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-6">
                       <h3 className="serif-text text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">{list.name}</h3>
                       <div className="p-2 bg-stone-50 rounded-lg text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-800 transition-colors"><ChevronRight size={16} /></div>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex -space-x-3">
                        {list.results.books.slice(0, 2).map((b, i) => (
                          <div key={i} className="w-8 h-12 rounded bg-stone-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                            {b.coverUrl ? <img src={b.coverUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-200" />}
                          </div>
                        ))}
                      </div>
                      <div className="flex -space-x-3 border-l border-stone-100 pl-4">
                        {list.results.movies.slice(0, 2).map((m, i) => (
                          <div key={i} className="w-8 h-12 rounded bg-stone-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                            {m.posterUrl ? <img src={m.posterUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-200" />}
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
                         Complete<br/>Bundle
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{new Date(list.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 py-12 text-stone-300 text-[11px] font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-6 border-t border-stone-100 w-full max-w-4xl">
        <p>© 2024 Lumina Intelligence Discovery</p>
      </footer>
    </div>
  );
};

const stepsOrder = (s: Step) => {
  const steps = ['history', 'genres', 'media', 'mood'];
  return steps.indexOf(s);
};

export default App;
