import React from 'react';

type BackgroundVideoProps = {
  src: string;
  className?: string;
  poster?: string;
};

export function BackgroundVideo({
  src,
  className = '',
  poster,
}: BackgroundVideoProps) {
  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover pointer-events-none select-none ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
    >
      <source src={src} type="video/mp4" />
      {/* Fallback per browser vecchi */}
      Your browser does not support the video tag.
    </video>
  );
}
