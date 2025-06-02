import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SoundControl from './SoundControl'
import { useClickSound, useHoverSound } from '@hooks/useAudio'

// Header Component
const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const withClickSound = useClickSound()
  const hoverProps = useHoverSound()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          <input type="text" className="search-box" placeholder="Search titles..." />
          <SoundControl className="mx-4" />
          <div className="profile" onClick={withClickSound()} {...hoverProps}>U</div>
        </div>
      </nav>
    </header>
  )
}

export default Header