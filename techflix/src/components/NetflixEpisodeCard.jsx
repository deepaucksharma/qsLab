import React, { useState, useRef, useEffect } from 'react';
import { Play, Download, Check, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@hooks/useAudio';

const NetflixEpisodeCard = ({ 
  episode, 
  onPlay, 
  isCurrentEpisode = false,
  layoutMode = 'grid' // 'grid' or 'list'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const { playHover, playClick, playTransition } = useAudio();

  // Destructure episode data
  const {
    episodeNumber,
    seasonNumber,
    title,
    description,
    synopsis,
    durationDisplay,
    thumbnail,
    previewVideo,
    hasContent,
    progress = {},
    ratings = {},
    downloadAvailable,
    comingSoon,
    expectedReleaseDate,
    tags = []
  } = episode;

  // Handle hover preview
  useEffect(() => {
    if (isHovered && previewVideo && layoutMode === 'grid') {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPreview(true);
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }, 1000); // 1 second delay before showing preview
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setShowPreview(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovered, previewVideo, layoutMode]);

  // Calculate progress percentage
  const progressPercentage = progress.percentComplete || 0;
  const isWatched = progress.watched || false;

  // Grid layout card
  if (layoutMode === 'grid') {
    return (
      <div
        className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
        onMouseEnter={() => {
          setIsHovered(true);
          playHover();
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail Container */}
        <div className="relative aspect-[16/9] rounded overflow-hidden bg-gray-900">
          {/* Progress Bar */}
          {progressPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-20">
              <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Thumbnail or Gradient */}
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${
              seasonNumber === 1 ? 'from-blue-600 to-purple-700' : 'from-red-600 to-orange-700'
            }`} />
          )}

          {/* Preview Video */}
          {showPreview && previewVideo && (
            <video
              ref={videoRef}
              src={previewVideo}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
            />
          )}

          {/* Overlay on Hover */}
          <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {hasContent ? (
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await playClick();
                    onPlay(episode);
                  }}
                  className="bg-white text-black rounded-full p-3 hover:bg-gray-200 transition-colors"
                  aria-label="Play episode"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-white text-sm font-medium px-3 py-1 bg-gray-800 rounded">
                  {comingSoon ? `Coming ${new Date(expectedReleaseDate).toLocaleDateString()}` : 'Coming Soon'}
                </span>
              </div>
            )}
          </div>

          {/* Episode Number Badge */}
          <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            E{episodeNumber}
          </div>

          {/* Watched Badge */}
          {isWatched && (
            <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full">
              <Check className="w-3 h-3" />
            </div>
          )}

          {/* Volume Control for Preview */}
          {showPreview && previewVideo && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await playClick();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors z-30"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Episode Info */}
        <div className="mt-2">
          <h3 className="text-white font-medium text-sm truncate">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400 text-xs">{durationDisplay}</span>
            {ratings.userScore && (
              <span className="text-green-500 text-xs">
                {Math.round(ratings.userScore * 20)}% Match
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List layout card
  return (
    <div 
      className={`flex gap-4 p-4 rounded-lg transition-colors duration-200 cursor-pointer ${
        isCurrentEpisode ? 'bg-gray-800' : 'hover:bg-gray-800/50'
      }`}
      onClick={async () => {
        if (hasContent) {
          await playClick();
          onPlay(episode);
        }
      }}
      onMouseEnter={() => playHover()}
    >
      {/* Episode Number */}
      <div className="flex-shrink-0 text-3xl font-bold text-gray-600 w-12 text-center">
        {episodeNumber}
      </div>

      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-40 aspect-[16/9] rounded overflow-hidden bg-gray-900">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${
            seasonNumber === 1 ? 'from-blue-600 to-purple-700' : 'from-red-600 to-orange-700'
          }`} />
        )}
        
        {/* Play Icon Overlay */}
        {hasContent && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-white" fill="currentColor" />
          </div>
        )}

        {/* Progress Bar */}
        {progressPercentage > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-red-600"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {durationDisplay}
        </div>
      </div>

      {/* Episode Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white font-medium text-lg flex items-center gap-2">
              {title}
              {isWatched && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {isCurrentEpisode && (
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                  Currently Playing
                </span>
              )}
            </h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
              {synopsis || description}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {downloadAvailable && hasContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle download
                }}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Download episode"
              >
                <Download className="w-5 h-5 text-gray-400" />
              </button>
            )}
            {!hasContent && comingSoon && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(expectedReleaseDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Continue Watching */}
        {progressPercentage > 0 && progressPercentage < 95 && (
          <div className="mt-2 text-xs text-gray-400">
            Continue watching from {Math.floor((progress.timeWatched || 0) / 60)}:{String(Math.floor((progress.timeWatched || 0) % 60)).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetflixEpisodeCard;