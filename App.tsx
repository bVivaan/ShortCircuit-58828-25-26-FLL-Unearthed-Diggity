import React, { useState, useCallback, useEffect } from 'react';
import { identifyArtifact, generateArtifactStory } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { ArtifactPreview } from './components/ArtifactPreview';
import { AnalysisResult } from './components/AnalysisResult';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FavoritesPage } from './components/FavoritesPage';
import { CivilizationsPage } from './components/CivilizationsPage';
import { HourglassIcon, ErrorIcon, BookOpenIcon, QuillIcon, MagnifyingGlassIcon, SpeakerWaveIcon, PlayIcon, PauseIcon, HeartIcon, BookmarkIcon, GlobeAltIcon } from './components/icons';

// FIX: Export SpeechState and SpeechTarget to be used by child components for type consistency.
export type SpeechState = 'idle' | 'playing' | 'paused';
export type SpeechTarget = 'analysis' | 'story' | 'civilization' | null;
type View = 'main' | 'favorites' | 'civilizations';

export type FavoriteArtifact = {
  id: string;
  imageBase64: string;
  mimeType: string;
  analysisResult: string;
  story: string | null;
};

type AppState = {
  imageFile: File | null;
  imageBase64: string | null;
  mimeType: string | null;
  analysisResult: string | null;
  story: string | null;
  isLoading: boolean;
  isGeneratingStory: boolean;
  speechState: SpeechState;
  activeSpeechTarget: SpeechTarget;
  error: string | null;
};

const initialState: AppState = {
  imageFile: null,
  imageBase64: null,
  mimeType: null,
  analysisResult: null,
  story: null,
  isLoading: false,
  isGeneratingStory: false,
  speechState: 'idle',
  activeSpeechTarget: null,
  error: null,
};

function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [favorites, setFavorites] = useState<FavoriteArtifact[]>([]);
  const [view, setView] = useState<View>('main');
  
  // Load favorites from localStorage on initial render
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('diggity-favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
    }
  }, []);

  // Update localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('diggity-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleVoicesChanged = () => {
        setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); 
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setState(prevState => ({ ...prevState, error: 'Please upload a valid image file.' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const imageData = base64String.split(',')[1];
      setState({
        ...initialState,
        imageFile: file,
        mimeType: file.type,
        imageBase64: imageData,
      });
    };
    reader.onerror = () => {
      setState(prevState => ({ ...prevState, error: 'Failed to read the image file.' }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyzeClick = useCallback(async () => {
    if (!state.imageBase64 || !state.mimeType) {
      setState(prevState => ({ ...prevState, error: 'No image to analyze.' }));
      return;
    }
    
    window.speechSynthesis.cancel();
    setState(prevState => ({ ...prevState, isLoading: true, error: null, analysisResult: null, story: null, speechState: 'idle', activeSpeechTarget: null }));

    try {
      const result = await identifyArtifact(state.imageBase64, state.mimeType);
      setState(prevState => ({ ...prevState, analysisResult: result, isLoading: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setState(prevState => ({ ...prevState, error: errorMessage, isLoading: false }));
    }
  }, [state.imageBase64, state.mimeType]);

  const handleGenerateStory = useCallback(async () => {
    if (!state.analysisResult) {
      setState(prevState => ({ ...prevState, error: 'Cannot generate a story without an analysis result.' }));
      return;
    }

    setState(prevState => ({ ...prevState, isGeneratingStory: true, error: null }));

    try {
      const storyResult = await generateArtifactStory(state.analysisResult);
      setState(prevState => ({ ...prevState, story: storyResult, isGeneratingStory: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while generating the story.';
      setState(prevState => ({ ...prevState, error: errorMessage, isGeneratingStory: false }));
    }
  }, [state.analysisResult]);

  const handleToggleSpeech = useCallback((target: 'analysis' | 'story' | 'civilization', textOverride?: string) => {
    const textToSpeak = textOverride || (target === 'analysis' ? state.analysisResult : state.story);

    if (!textToSpeak) return;

    if (state.activeSpeechTarget === target && !textOverride) {
      if (state.speechState === 'playing') {
        window.speechSynthesis.pause();
        setState(prevState => ({ ...prevState, speechState: 'paused' }));
      } else if (state.speechState === 'paused') {
        window.speechSynthesis.resume();
        setState(prevState => ({ ...prevState, speechState: 'playing' }));
      }
      return;
    }

    window.speechSynthesis.cancel(); 
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/\*\*/g, ''));
    
    const preferredBritishVoice = voices.find(voice => voice.name === 'Google UK English Male');
    const fallbackBritishVoice = voices.find(voice => voice.lang === 'en-GB' && !voice.localService);
    const fallbackUSVoice = voices.find(voice => voice.name === 'Google US English');
    const genericEnglishVoice = voices.find(voice => voice.lang.startsWith('en-') && !voice.localService);

    utterance.voice = preferredBritishVoice || fallbackBritishVoice || fallbackUSVoice || genericEnglishVoice || null;
    utterance.pitch = 0.8;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setState(prevState => ({ ...prevState, speechState: 'playing', activeSpeechTarget: target, error: null }));
    };
    utterance.onend = () => {
      setState(prevState => ({ ...prevState, speechState: 'idle', activeSpeechTarget: null }));
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setState(prevState => ({ ...prevState, speechState: 'idle', activeSpeechTarget: null, error: 'Could not read the text aloud.' }));
    };

    window.speechSynthesis.speak(utterance);
    
  }, [state.speechState, state.story, state.analysisResult, state.activeSpeechTarget, voices]);
  
  const handleAddToFavorites = useCallback(() => {
    if (!state.imageBase64 || !state.mimeType || !state.analysisResult) return;
    
    const newFavorite: FavoriteArtifact = {
      id: Date.now().toString(), // Simple unique ID
      imageBase64: state.imageBase64,
      mimeType: state.mimeType,
      analysisResult: state.analysisResult,
      story: state.story,
    };
    setFavorites(prevFavorites => [...prevFavorites, newFavorite]);
  }, [state.imageBase64, state.mimeType, state.analysisResult, state.story]);
  
  const handleRemoveFavorite = useCallback((id: string) => {
    setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== id));
  }, []);

  const handleReset = useCallback(() => {
    window.speechSynthesis.cancel();
    setState(initialState);
  }, []);
  
  const isCurrentArtifactFavorited = state.analysisResult 
    ? favorites.some(fav => fav.analysisResult === state.analysisResult) 
    : false;
    
  const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
  }> = ({ onClick, isActive, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 transform hover:-translate-y-0.5 ${
        isActive
          ? 'bg-amber-500 text-white'
          : 'text-amber-800 bg-amber-100 border border-amber-200 hover:bg-amber-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-stone-800 font-sans bg-parchment">
      <header className="w-full max-w-4xl text-center mb-10">
        <div className="flex items-center justify-center gap-4">
          <HourglassIcon className="h-12 w-12 text-amber-700" />
          <h1 className="text-5xl sm:text-6xl font-bold text-stone-900 tracking-tight font-serif">
            Diggity
          </h1>
          <MagnifyingGlassIcon className="h-12 w-12 text-amber-700" />
        </div>
        <p className="mt-3 text-lg text-stone-600 max-w-xl mx-auto">
          Unearth the stories of your discoveries. Just upload a photo to begin your journey through time.
        </p>
         <nav className="mt-6 flex items-center justify-center gap-2 sm:gap-4">
            <NavButton onClick={() => setView('main')} isActive={view === 'main'}>
                <MagnifyingGlassIcon className="w-5 h-5"/>
                Analyzer
            </NavButton>
            <NavButton onClick={() => setView('favorites')} isActive={view === 'favorites'}>
                <BookmarkIcon className="w-5 h-5"/>
                My Collection ({favorites.length})
            </NavButton>
             <NavButton onClick={() => setView('civilizations')} isActive={view === 'civilizations'}>
                <GlobeAltIcon className="w-5 h-5"/>
                Civilizations
            </NavButton>
        </nav>
      </header>

      {view === 'main' && (
        <main className="w-full max-w-2xl bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 ring-1 ring-stone-900/10">
          {!state.imageFile ? (
            <ImageUploader onImageSelect={handleImageSelect} />
          ) : (
            <ArtifactPreview
              file={state.imageFile}
              onAnalyze={handleAnalyzeClick}
              onReset={handleReset}
              isLoading={state.isLoading}
            />
          )}

          {state.isLoading && (
            <div className="mt-8">
              <LoadingSpinner />
            </div>
          )}

          {state.error && (
            <div className="mt-8 flex items-center gap-3 bg-red-100/50 text-red-800 p-4 rounded-xl border border-red-200">
              <ErrorIcon className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold font-serif">Request Failed</h3>
                <p>{state.error}</p>
              </div>
            </div>
          )}

          {state.analysisResult && (
            <div className="mt-8">
              <AnalysisResult 
                result={state.analysisResult}
                onToggleSpeech={() => handleToggleSpeech('analysis')}
                speechState={state.speechState}
                isSpeechActive={state.activeSpeechTarget === 'analysis'}
              />
              
              <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                  {!state.story && !state.isGeneratingStory && (
                      <button
                        onClick={handleGenerateStory}
                        disabled={state.isGeneratingStory}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-60 disabled:cursor-wait transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <BookOpenIcon className="w-5 h-5"/>
                        Tell a Funny Story
                      </button>
                  )}
                   <button
                      onClick={handleAddToFavorites}
                      disabled={isCurrentArtifactFavorited}
                      className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-lg shadow-sm hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <HeartIcon className={`w-5 h-5 ${isCurrentArtifactFavorited ? 'text-red-500' : ''}`} filled={isCurrentArtifactFavorited} />
                      {isCurrentArtifactFavorited ? 'Added to Collection' : 'Add to Collection'}
                    </button>
              </div>
            </div>
          )}

          {state.isGeneratingStory && (
            <div className="mt-8 text-center text-stone-600 animate-fade-in flex flex-col items-center justify-center gap-3">
               <BookOpenIcon className="w-6 h-6 animate-pulse text-amber-600"/>
              <p className="font-serif text-stone-800">Our AI scribe is penning a tale...</p>
            </div>
          )}

          {state.story && (
            <div className="mt-8 bg-amber-50/50 p-6 rounded-xl border border-amber-200 animate-fade-in shadow-inner">
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-3">
                    <QuillIcon className="w-6 h-6 text-amber-700 flex-shrink-0" />
                    <h3 className="text-xl font-bold font-serif text-amber-900">A Tale from the Trenches</h3>
                  </div>
                  <button
                    onClick={() => handleToggleSpeech('story')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-full hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                    aria-label={
                      state.activeSpeechTarget === 'story' && state.speechState === 'playing' ? "Pause reading"
                      : state.activeSpeechTarget === 'story' && state.speechState === 'paused' ? "Resume reading"
                      : "Read story aloud"
                    }
                  >
                    {state.activeSpeechTarget === 'story' && state.speechState === 'playing' ? (
                      <>
                        <PauseIcon className="w-5 h-5" />
                        <span>Pause</span>
                      </>
                    ) : state.activeSpeechTarget === 'story' && state.speechState === 'paused' ? (
                      <>
                        <PlayIcon className="w-5 h-5" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <SpeakerWaveIcon className="w-5 h-5" />
                        <span>Read Aloud</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="prose prose-stone max-w-none text-stone-800">
                  {state.story.split('\n').filter(p => p.trim() !== '').map((paragraph, i) => {
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return <h4 key={i} className="text-lg font-bold font-serif !mt-0 !mb-2 text-amber-800">{paragraph.replace(/\*\*/g, '')}</h4>
                      }
                      return <p key={i} className="!my-2">{paragraph.replace(/\*/g, '')}</p>
                  })}
                </div>
            </div>
          )}
        </main>
      )} 
      
      {view === 'favorites' && (
         <FavoritesPage 
            favorites={favorites} 
            onRemove={handleRemoveFavorite} 
            onToggleSpeech={handleToggleSpeech}
            speechState={state.speechState}
            activeSpeechTarget={state.activeSpeechTarget}
        />
      )}

      {view === 'civilizations' && (
        <CivilizationsPage 
          onToggleSpeech={handleToggleSpeech}
          speechState={state.speechState}
          activeSpeechTarget={state.activeSpeechTarget}
        />
      )}
    </div>
  );
}

export default App;
