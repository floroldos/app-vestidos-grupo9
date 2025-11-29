"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  itemName: string;
}

export function ImageGallery({ images, alt, itemName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <p className="text-slate-500">No image available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg group">
        <Image
          src={images[selectedIndex]}
          alt={`${alt} - View ${selectedIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        />
        
        {/* Image counter badge */}
        <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Navigation arrows for main image */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 transition-all ${
                index === selectedIndex
                  ? "ring-2 ring-fuchsia-600 ring-offset-2 dark:ring-offset-slate-900"
                  : "hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600 opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${index + 1} of ${itemName}`}
            >
              <Image
                src={src}
                alt={`${alt} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 200px"
              />
              {index === selectedIndex && (
                <div className="absolute inset-0 bg-fuchsia-600/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
