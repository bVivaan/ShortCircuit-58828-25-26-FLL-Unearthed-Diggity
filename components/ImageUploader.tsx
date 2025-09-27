
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageSelect(event.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const baseClasses = 'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out';
  const inactiveClasses = 'border-stone-300 bg-stone-50/50 hover:bg-stone-100/50 hover:border-amber-400';
  const activeClasses = 'border-amber-500 bg-amber-100/50 scale-105 shadow-lg';

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className={`${baseClasses} ${isDragging ? activeClasses : inactiveClasses}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
          <UploadIcon className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-amber-600' : 'text-stone-500'}`} />
          <p className="mb-2 text-sm text-stone-600">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-stone-500">PNG, JPG, or WEBP (MAX. 10MB)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      </label>
    </div>
  );
};