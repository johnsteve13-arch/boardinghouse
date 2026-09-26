'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { BoardingHousePhoto, PhotoCategory } from '@seait-stay/types';

interface PhotoGalleryModalProps {
  photos: BoardingHousePhoto[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function PhotoGalleryModal({
  photos,
  isOpen,
  onClose,
  initialIndex = 0
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen || photos.length === 0) return null;

  const filteredPhotos = filterCategory === 'all'
    ? photos
    : photos.filter((p) => p.category === filterCategory);

  const activePhoto = filteredPhotos[currentIndex] || filteredPhotos[0] || photos[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'exterior', label: 'Exterior' },
    { id: 'room', label: 'Rooms' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'study_area', label: 'Study Area' },
    { id: 'common_area', label: 'Common Area' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 text-white">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">
            Photo {currentIndex + 1} of {filteredPhotos.length}
          </span>
        </div>

        {/* Category Filters */}
        <div className="hidden md:flex items-center space-x-1.5 bg-white/10 backdrop-blur-md p-1 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setFilterCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image View Area */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Active Photo */}
        <div className="max-w-5xl max-h-[75vh] w-full flex flex-col items-center justify-center">
          <img
            src={activePhoto.url}
            alt={activePhoto.caption || 'Boarding house photo'}
            className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
          {activePhoto.caption && (
            <p className="text-white/80 text-xs sm:text-sm mt-3 font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm text-center">
              {activePhoto.caption}
            </p>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto py-2">
        {filteredPhotos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
              idx === currentIndex
                ? 'border-emerald-500 scale-105 shadow-md'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={photo.url} alt="thumbnail" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
