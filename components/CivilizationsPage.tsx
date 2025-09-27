import React from 'react';
import { GlobeAltIcon, SpeakerWaveIcon, PlayIcon, PauseIcon, HourglassIcon } from './icons';
// FIX: Import shared types from App.tsx to ensure consistency across the application.
import { SpeechState, SpeechTarget } from '../App';

interface CivilizationsPageProps {
    onToggleSpeech: (target: 'civilization', text: string) => void;
    speechState: SpeechState;
    activeSpeechTarget: SpeechTarget;
}

const civilizations = [
    {
        name: 'Ainu',
        hello: 'Irankarapte (イランカラㇷ゚テ)',
        about: 'The Ainu are the indigenous people of northern Japan and the surrounding regions, with a rich culture deeply connected to nature, spirits (kamuy), and oral traditions.',
        accomplishments: [
            'Intricate woodcarving on tools and ceremonial items.',
            'Creation of "attus" robes from elm bark fibers.',
            'Epic oral sagas known as "Yukar".'
        ],
        unesco: 'The Ainu language is listed on UNESCO\'s Atlas of the World\'s Languages in Danger. Efforts to preserve their culture, including the Yukar sagas, are recognized as vital for intangible cultural heritage.',
        available: true
    },
    { name: 'Olmec', available: false },
    { name: 'Indus Valley Civilization', available: false },
    { name: 'Mayan', available: false },
    { name: 'Taíno (Caribbean)', available: false },
    { name: 'Wiradjuri', available: false },
    { name: 'Rapa Nui', available: false },
    { name: 'Kingdom of Kush', available: false },
];

const CivilizationCard: React.FC<{
    civ: typeof civilizations[0];
    onToggleSpeech: (text: string) => void;
    speechState: SpeechState;
    isSpeechActive: boolean;
}> = ({ civ, onToggleSpeech, speechState, isSpeechActive }) => {
    
    if (!civ.available) {
        return (
             <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 ring-1 ring-stone-900/10 flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-bold font-serif text-stone-700">{civ.name}</h3>
                <HourglassIcon className="w-8 h-8 text-amber-500 my-4" />
                <p className="text-stone-500 text-sm">More information coming soon.</p>
            </div>
        )
    }
    
    const fullText = `
        Greetings from the Ainu: ${civ.hello}.
        About the Ainu: ${civ.about}.
        Key Accomplishments: ${civ.accomplishments.join(', ')}.
        UNESCO Protection Efforts: ${civ.unesco}.
    `;

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 ring-1 ring-stone-900/10">
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-amber-200">
                <div>
                    <h3 className="text-3xl font-bold font-serif text-amber-900">{civ.name}</h3>
                    <p className="text-stone-600 mt-1 italic">"{civ.hello}"</p>
                </div>
                <button
                  onClick={() => onToggleSpeech(fullText)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-amber-800 bg-amber-100 border border-amber-200 rounded-full hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                  aria-label={
                    isSpeechActive && speechState === 'playing' ? "Pause reading"
                    : isSpeechActive && speechState === 'paused' ? "Resume reading"
                    : "Read aloud"
                  }
                >
                  {isSpeechActive && speechState === 'playing' ? (
                    <><PauseIcon className="w-5 h-5" /><span>Pause</span></>
                  ) : isSpeechActive && speechState === 'paused' ? (
                    <><PlayIcon className="w-5 h-5" /><span>Resume</span></>
                  ) : (
                    <><SpeakerWaveIcon className="w-5 h-5" /><span>Read Aloud</span></>
                  )}
                </button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h4 className="font-serif font-semibold text-lg text-stone-800">About this Civilization</h4>
                    <p className="text-stone-700">{civ.about}</p>
                </div>
                <div>
                    <h4 className="font-serif font-semibold text-lg text-stone-800">Accomplishments</h4>
                    <ul className="list-disc list-inside text-stone-700 space-y-1">
                        {civ.accomplishments.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-serif font-semibold text-lg text-stone-800">Protection Efforts (UNESCO)</h4>
                    <p className="text-stone-700">{civ.unesco}</p>
                </div>
            </div>
        </div>
    )
}

export const CivilizationsPage: React.FC<CivilizationsPageProps> = ({ onToggleSpeech, speechState, activeSpeechTarget }) => {
  return (
    <main className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-8">
            <GlobeAltIcon className="w-12 h-12 text-amber-600 mx-auto mb-2"/>
            <h2 className="text-4xl font-bold font-serif text-stone-900">Explore Civilizations</h2>
            <p className="text-stone-600 mt-2 max-w-2xl mx-auto">Discover the rich history and cultural heritage of people from around the world.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {civilizations.map(civ => (
                <CivilizationCard 
                    key={civ.name} 
                    civ={civ} 
                    onToggleSpeech={(text) => onToggleSpeech('civilization', text)}
                    speechState={speechState}
                    isSpeechActive={activeSpeechTarget === 'civilization'}
                />
            ))}
        </div>
    </main>
  );
};
