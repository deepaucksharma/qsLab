import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import SoundControl from './SoundControl'
import { useClickSound, useHoverSound } from '@hooks/useAudio'
import { ROUTES } from '../router'

// Header Component
const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const withClickSound = useClickSound()
  const hoverProps = useHoverSound()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      withClickSound()()
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('') // Clear input after search
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <a href="#" className="logo" onClick={withClickSound(() => window.location.reload())} {...hoverProps}>TechFlix</a>
        <ul className="nav-links">
          <li><Link to="/browse" onClick={withClickSound()} {...hoverProps}>Home</Link></li>
          <li><a href="#" onClick={withClickSound()} {...hoverProps}>Series</a></li>
          <li><a href="#" onClick={withClickSound()} {...hoverProps}>New & Popular</a></li>
          <li><a href="#" onClick={withClickSound()} {...hoverProps}>My List</a></li>
          <li><Link to="/tts-test" onClick={withClickSound()} {...hoverProps} className="text-yellow-400">TTS Lab</Link></li>
        </ul>
        <div className="nav-right">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              type="text" 
              className="search-box pr-10" 
              placeholder="Search titles..." 
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search episodes and series"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label="Submit search"
            >
              <Search size={18} />
            </button>
          </form>
          <SoundControl className="mx-4" />
          <div className="profile" onClick={withClickSound()} {...hoverProps}>U</div>
        </div>
      </nav>
    </header>
  )
}

export default Header