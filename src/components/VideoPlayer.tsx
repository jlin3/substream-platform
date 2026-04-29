'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  url: string;
  poster?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({ url, poster, autoPlay }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const ytPrefix = 'youtube:';
  const isYouTubePrefix = url.startsWith(ytPrefix);
  const isYouTube = isYouTubePrefix || url.includes('youtube.com') || url.includes('youtu.be');

  if (isYouTube && !playing) {
    return (
      <div
        className="relative w-full aspect-video bg-surface-200 rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => setPlaying(true)}
      >
        {poster && (
          <img src={poster} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-brand-500/90 flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (isYouTube) {
    const videoId = isYouTubePrefix
      ? url.slice(ytPrefix.length)
      : url.includes('youtu.be')
        ? url.split('/').pop()
        : new URL(url).searchParams.get('v');
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      src={url}
      poster={poster}
      controls
      autoPlay={autoPlay}
      className="w-full aspect-video bg-surface-200 rounded-lg"
    />
  );
}
