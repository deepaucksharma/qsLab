import React from 'react';
import NetflixEpisodeCard from './NetflixEpisodeCard';

/**
 * Accessible wrapper for NetflixEpisodeCard
 * Adds ARIA attributes and keyboard navigation
 */
const AccessibleEpisodeCard = React.memo(({ 
  episode, 
  episodeNumber, 
  seasonNumber, 
  onPlay,
  isCurrentlyPlaying = false,
  ...props 
}) => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPlay?.();
    }
  };

  const ariaLabel = `${episode.title}. Season ${seasonNumber}, Episode ${episodeNumber}. ${
    episode.duration ? `Duration: ${episode.duration}. ` : ''
  }${episode.description ? `Description: ${episode.description}. ` : ''}${
    episode.progress?.percentComplete > 0 
      ? `${Math.round(episode.progress.percentComplete)}% watched. ` 
      : ''
  }${isCurrentlyPlaying ? 'Currently playing. ' : ''}${
    !episode.hasContent ? 'Coming soon. ' : 'Press Enter to play.'
  }`;

  return (
    <div
      role="article"
      aria-label={ariaLabel}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      className="focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-black rounded-lg"
    >
      <NetflixEpisodeCard
        episode={episode}
        episodeNumber={episodeNumber}
        seasonNumber={seasonNumber}
        onPlay={onPlay}
        isCurrentlyPlaying={isCurrentlyPlaying}
        {...props}
      />
    </div>
  );
});

AccessibleEpisodeCard.displayName = 'AccessibleEpisodeCard';

export default AccessibleEpisodeCard;