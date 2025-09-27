
import React from 'react';
import { MagnifyingGlassIcon } from './icons';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-stone-600 gap-4 py-8">
      <div className="relative w-16 h-16">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          <MagnifyingGlassIcon className="w-10 h-10 text-amber-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="flex flex-col items-center mt-2">
        <p className="text-lg font-semibold font-serif text-stone-800">Analyzing Artifact...</p>
        <p className="text-sm text-stone-500">Our digital archaeologists are on the case.</p>
      </div>
    </div>
  );
};