import React, { useState, useEffect, useRef, useContext } from 'react'
import { Play, Info } from 'lucide-react'
import { AppContext } from '../App'
import { SERIES_DATA } from '../data/seriesData'

// Hero Preview Animation Component
const HeroPreviewVisualization = ({ time }) => {
  const nodeCount = 10
  const centerX = 50
  const centerY = 50
  const radius = 30

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1a1a2e" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        <circle
          cx={centerX}
          cy={centerY}
          r="8"
          fill="#E50914"
          className="animate-pulse"
        />
        
        {[...Array(nodeCount)].map((_, i) => {
          const angle = (i / nodeCount) * Math.PI * 2 + time * 0.5
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          const secondaryAngle = angle * 2 + time
          const sx = x + Math.cos(secondaryAngle) * 10
          const sy = y + Math.sin(secondaryAngle) * 10
          
          return (
            <g key={i}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="#3B82F6"
                strokeWidth="0.5"
                opacity="0.3"
              />
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                opacity={0.5 + Math.sin(time + i) * 0.3}
              />
              <circle
                cx={sx}
                cy={sy}
                r="2"
                fill="#F59E0B"
                opacity={0.3 + Math.sin(time * 2 + i) * 0.2}
              />
            </g>
          )
        })}
        
        <circle
          cx={centerX}
          cy={centerY}
          r={20 + (time % 3) * 10}
          fill="none"
          stroke="#E50914"
          strokeWidth="0.5"
          opacity={1 - (time % 3) / 3}
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={15 + ((time + 1) % 3) * 10}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="0.3"
          opacity={1 - ((time + 1) % 3) / 3}
        />
        
        {[...Array(5)].map((_, i) => {
          const floatY = 20 + (time * 10 + i * 20) % 60
          const floatX = 20 + i * 15
          return (
            <g key={`float-${i}`} opacity={0.4}>
              <rect
                x={floatX}
                y={floatY}
                width="8"
                height="3"
                fill="#10B981"
                rx="1"
              />
            </g>
          )
        })}
        
        <text x="50" y="90" textAnchor="middle" fill="white" fontSize="6" opacity="0.5">
          KAFKA SHARE GROUPS
        </text>
      </svg>
    </div>
  )
}

const HeroSection = () => {
  const { setCurrentEpisode, setIsPlayerActive } = useContext(AppContext)
  const [time, setTime] = useState(0)
  const episodesContainerRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.1)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handlePlayFirstEpisode = () => {
    const firstEpisode = SERIES_DATA.seasons[0].episodes[0]
    if (firstEpisode.hasContent) {
      setCurrentEpisode(firstEpisode.episodeData)
      setIsPlayerActive(true)
    }
  }

  const scrollToEpisodes = () => {
    window.scrollTo({
      top: document.getElementById('episodesContainer').offsetTop - 100,
      behavior: 'smooth'
    })
  }

  return (
    <section className="hero">
      <div className="hero-preview">
        <HeroPreviewVisualization time={time} />
      </div>
      <div className="hero-background"></div>
      <div className="hero-content">
        <h1 className="hero-title">Tech Insights</h1>
        <div className="hero-meta">
          <span className="hero-rating">98% Match</span>
          <span>2024</span>
          <span>TV-14</span>
          <span>2 Seasons</span>
        </div>
        <p className="hero-description">
          Dive deep into cutting-edge technology concepts through interactive visualizations and real-world scenarios.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handlePlayFirstEpisode}>
            <Play size={20} />
            Play S1:E1
          </button>
          <button className="btn btn-secondary" onClick={scrollToEpisodes}>
            <Info size={20} />
            More Info
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection