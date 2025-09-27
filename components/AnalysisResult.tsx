
import React from 'react';
import { ScrollIcon, SpeakerWaveIcon, PlayIcon, PauseIcon } from './icons';

type SpeechState = 'idle' | 'playing' | 'paused';

interface AnalysisResultProps {
  result: string;
  onToggleSpeech: () => void;
  speechState: SpeechState;
  isSpeechActive: boolean;
}

// A simple parser to format the response text.
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  return (
    <>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          return <h3 key={index} className="font-serif font-bold text-lg mt-4 mb-2 text-stone-800">{trimmedLine.replace(/\*\*/g, '')}</h3>;
        }
        
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          return <li key={index} className="ml-5 list-disc">{trimmedLine.substring(2)}</li>;
        }
        
        return <p key={index} className="mb-2">{trimmedLine.replace(/\*/g, '')}</p>;
      })}
    </>
  );
};


export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onToggleSpeech, speechState, isSpeechActive }) => {
  return (
    <div className="bg-stone-50/50 p-6 rounded-xl border border-stone-200 animate-fade-in shadow-inner">
      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <ScrollIcon className="w-7 h-7 text-amber-700"/>
          <h2 className="text-2xl font-bold font-serif text-amber-800">Analysis Complete</h2>
        </div>
        <button
          onClick={onToggleSpeech}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-full hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
          aria-label={
            isSpeechActive && speechState === 'playing' ? "Pause reading"
            : isSpeechActive && speechState === 'paused' ? "Resume reading"
            : "Read analysis aloud"
          }
        >
          {isSpeechActive && speechState === 'playing' ? (
            <>
              <PauseIcon className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : isSpeechActive && speechState === 'paused' ? (
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
         <FormattedText text={result} />
      </div>
    </div>
  );
};

// Add a simple fade-in animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);