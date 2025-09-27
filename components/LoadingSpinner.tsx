
import React from 'react';
import { MagnifyingGlassIcon } from './icons';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-stone-600 gap-4 py-8">
      <MagnifyingGlassIcon className="w-12 h-12 text-amber-600 animate-pulse" />
      <div className="flex flex-col items-center">
        <p className="text-lg font-semibold">Analyzing Artifact...</p>
        <p className="text-sm text-stone-500">Our digital archaeologists are on the case.</p>
      </div>
    </div>
  );
};
