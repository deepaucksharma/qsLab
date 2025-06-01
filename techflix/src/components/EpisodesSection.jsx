import React, { useContext } from 'react'
import { Play } from 'lucide-react'
import { AppContext } from '../App'

// Episode Card Component
const EpisodeCard = ({ episode }) => {
  const { setCurrentEpisode, setIsPlayerActive } = useContext(AppContext)

  const handlePlay = () => {
    // Set the entire episode object including metadata and scenes
    setCurrentEpisode({
      metadata: episode.metadata,
      scenes: episode.scenes,
      interactiveElements: episode.interactiveElements
    })
    setIsPlayerActive(true)
  }

  // Convert duration from seconds to a readable format
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="episode-card" onClick={handlePlay}>
      <div className="episode-thumbnail">
        <div className="episode-number-overlay">{episode.metadata.episodeNumber}</div>
        <div className="play-overlay">
          <div className="play-icon">
            <Play size={24} />
          </div>
        </div>
      </div>
      <div className="episode-info">
        <div className="episode-header">
          <h3 className="episode-title">Episode {episode.metadata.episodeNumber}: {episode.metadata.title}</h3>
          <span className="episode-duration">{formatDuration(episode.metadata.duration)}</span>
        </div>
        <p className="episode-description">{episode.metadata.description}</p>
        <div className="episode-tags">
          <span className="episode-tag">{episode.metadata.level}</span>
          {episode.metadata.tags.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="episode-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Episodes Section Component
const EpisodesSection = () => {
  const { currentSeason, setCurrentSeason, seasons } = useContext(AppContext)
  const season = seasons.find(s => s.number === currentSeason)

  // Handle case when no seasons are loaded
  if (seasons.length === 0) {
    return (
      <div className="episodes-container">
        <div className="text-white text-center py-8">
          No episodes available yet. Check back soon!
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="season-selector">
        <select 
          className="season-dropdown" 
          value={currentSeason} 
          onChange={(e) => setCurrentSeason(parseInt(e.target.value))}
        >
          {seasons.map(season => (
            <option key={season.number} value={season.number}>
              {season.title}
            </option>
          ))}
        </select>
      </div>

      <div className="episodes-container" id="episodesContainer">
        <div className="episodes-grid">
          {season?.episodes.map((episode, index) => (
            <EpisodeCard 
              key={`${episode.metadata.id}-${index}`} 
              episode={episode}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default EpisodesSection