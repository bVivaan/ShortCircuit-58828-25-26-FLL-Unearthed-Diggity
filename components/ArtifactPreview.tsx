
import React, { useState, useEffect } from 'react';
import { PapyrusManuscriptIcon, TrashIcon } from './icons';

interface ArtifactPreviewProps {
  file: File;
  onAnalyze: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ArtifactPreview: React.FC<ArtifactPreviewProps> = ({ file, onAnalyze, onReset, isLoading }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-xl border border-stone-200">
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Artifact preview" className="w-full h-auto object-cover" />
        ) : (
          <div className="w-full h-64 bg-stone-200 animate-pulse"></div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg shadow-sm hover:bg-stone-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <TrashIcon className="w-4 h-4" />
          Remove
        </button>
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-60 disabled:cursor-wait transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <PapyrusManuscriptIcon className="w-5 h-5" />
          Analyze Artifact
        </button>
      </div>
    </div>
  );
};