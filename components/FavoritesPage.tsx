import React, { useState } from 'react';
// FIX: Import shared types from App.tsx to ensure consistency and fix type errors.
import { FavoriteArtifact, SpeechState, SpeechTarget } from '../App';
import { AnalysisResult } from './AnalysisResult';
import { QuillIcon, TrashIcon, SpeakerWaveIcon, PlayIcon, PauseIcon, BookmarkIcon } from './icons';

interface FavoritesPageProps {
  favorites: FavoriteArtifact[];
  onRemove: (id: string) => void;
  onToggleSpeech: (target: 'analysis' | 'story', text: string) => void;
  speechState: SpeechState;
  activeSpeechTarget: SpeechTarget;
}

const FavoriteCard: React.FC<{
  favorite: FavoriteArtifact;
  onRemove: (id: string) => void;
  onToggleSpeech: (target: 'analysis' | 'story', text: string) => void;
  speechState: SpeechState;
  activeSpeechTarget: SpeechTarget;
}> = ({ favorite, onRemove, onToggleSpeech, speechState, activeSpeechTarget }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleToggleSpeech = (target: 'analysis' | 'story') => {
      const text = target === 'analysis' ? favorite.analysisResult : favorite.story;
      if (text) {
          onToggleSpeech(target, text);
      }
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg ring-1 ring-stone-900/10 overflow-hidden transition-all duration-300">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-6">
            <img 
              src={`data:${favorite.mimeType};base64,${favorite.imageBase64}`} 
              alt="Favorited artifact" 
              className="w-full sm:w-48 h-48 object-cover rounded-lg shadow-md border border-stone-200 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            />
          <div className="flex-1">
            <h3 
                className="text-xl font-bold font-serif text-stone-800 cursor-pointer hover:text-amber-700"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {favorite.analysisResult.split('\n')[0].replace('**', '').replace('Identification:', '').trim()}
            </h3>
            <p className="text-stone-600 mt-2 text-sm line-clamp-3">
              {favorite.analysisResult.substring(favorite.analysisResult.indexOf('\n')).trim().replace(/\*\*/g, '')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-4 py-2 text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-lg hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </button>
              <button
                onClick={() => onRemove(favorite.id)}
                className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Remove from collection"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 sm:p-6 border-t border-stone-200 animate-fade-in">
           <AnalysisResult 
              result={favorite.analysisResult}
              onToggleSpeech={() => handleToggleSpeech('analysis')}
              speechState={speechState}
              isSpeechActive={activeSpeechTarget === 'analysis'}
            />
            {favorite.story && (
                 <div className="mt-6 bg-amber-50/50 p-6 rounded-xl border border-amber-200 shadow-inner">
                    <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-amber-200">
                        <div className="flex items-center gap-3">
                        <QuillIcon className="w-6 h-6 text-amber-700 flex-shrink-0" />
                        <h3 className="text-xl font-bold font-serif text-amber-900">A Tale from the Trenches</h3>
                        </div>
                        <button
                            onClick={() => handleToggleSpeech('story')}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-full hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                            aria-label={
                                activeSpeechTarget === 'story' && speechState === 'playing' ? "Pause reading"
                                : activeSpeechTarget === 'story' && speechState === 'paused' ? "Resume reading"
                                : "Read story aloud"
                            }
                        >
                        {activeSpeechTarget === 'story' && speechState === 'playing' ? (
                            <><PauseIcon className="w-5 h-5" /><span>Pause</span></>
                        ) : activeSpeechTarget === 'story' && speechState === 'paused' ? (
                            <><PlayIcon className="w-5 h-5" /><span>Resume</span></>
                        ) : (
                            <><SpeakerWaveIcon className="w-5 h-5" /><span>Read Aloud</span></>
                        )}
                        </button>
                    </div>
                    <div className="prose prose-stone max-w-none text-stone-800">
                        {favorite.story.split('\n').filter(p => p.trim() !== '').map((paragraph, i) => {
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                return <h4 key={i} className="text-lg font-bold font-serif !mt-0 !mb-2 text-amber-800">{paragraph.replace(/\*\*/g, '')}</h4>
                            }
                            return <p key={i} className="!my-2">{paragraph.replace(/\*/g, '')}</p>
                        })}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};


export const FavoritesPage: React.FC<FavoritesPageProps> = ({ favorites, onRemove, onToggleSpeech, speechState, activeSpeechTarget }) => {
  return (
    <main className="w-full max-w-4xl animate-fade-in">
        <h2 className="text-3xl font-bold font-serif text-stone-900 text-center mb-8">My Artifact Collection</h2>
        {favorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
                {favorites.map(fav => (
                    <FavoriteCard 
                        key={fav.id} 
                        favorite={fav} 
                        onRemove={onRemove}
                        onToggleSpeech={onToggleSpeech}
                        speechState={speechState}
                        activeSpeechTarget={activeSpeechTarget}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 px-6 bg-white/50 rounded-2xl shadow-lg border border-stone-200">
                <BookmarkIcon className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold font-serif text-stone-800">Your collection is empty.</h3>
                <p className="text-stone-600 mt-2">Analyzed artifacts that you save will appear here.</p>
            </div>
        )}
    </main>
  );
};
