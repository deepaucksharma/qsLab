import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import SoundControl from './SoundControl'
import { useClickSound, useHoverSound } from '@hooks/useAudio'
import { ROUTES } from '../router'

// Header Component
const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    withClickSound()()
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleMobileNavClick = (callback) => {
    return () => {
      closeMobileMenu()
      if (callback) callback()
      withClickSound()()
    }
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <Link to="/browse" className="logo" onClick={withClickSound()} {...hoverProps}>TechFlix</Link>
        
        {/* Desktop Navigation */}
        <ul className="nav-links hidden md:flex">
          <li><Link to="/browse" onClick={withClickSound()} {...hoverProps}>Home</Link></li>
          <li><a href="#" onClick={withClickSound()} {...hoverProps}>Series</a></li>
          <li><a href="#" onClick={withClickSound()} {...hoverProps}>New & Popular</a></li>
          <li><a href="#" onClick={withClickSound()} {...hoverProps}>My List</a></li>
          <li><Link to="/tts-test" onClick={withClickSound()} {...hoverProps} className="text-yellow-400">TTS Lab</Link></li>
        </ul>
        
        {/* Desktop Right Section */}
        <div className="nav-right hidden md:flex">
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto p-2 text-white hover:text-gray-300 transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 md:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <Link to="/browse" className="logo text-2xl" onClick={handleMobileNavClick()}>
                TechFlix
              </Link>
              <button
                className="p-2 text-white hover:text-gray-300 transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close mobile menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/browse" 
                    className="block py-3 px-4 text-lg text-white hover:bg-gray-800 rounded transition-colors"
                    onClick={handleMobileNavClick()}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="block py-3 px-4 text-lg text-white hover:bg-gray-800 rounded transition-colors"
                    onClick={handleMobileNavClick()}
                  >
                    Series
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="block py-3 px-4 text-lg text-white hover:bg-gray-800 rounded transition-colors"
                    onClick={handleMobileNavClick()}
                  >
                    New & Popular
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="block py-3 px-4 text-lg text-white hover:bg-gray-800 rounded transition-colors"
                    onClick={handleMobileNavClick()}
                  >
                    My List
                  </a>
                </li>
                <li>
                  <Link 
                    to="/tts-test" 
                    className="block py-3 px-4 text-lg text-yellow-400 hover:bg-gray-800 rounded transition-colors"
                    onClick={handleMobileNavClick()}
                  >
                    TTS Lab
                  </Link>
                </li>
              </ul>

              {/* Mobile Search */}
              <form onSubmit={(e) => { handleSearchSubmit(e); closeMobileMenu(); }} className="mt-6">
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 pr-12 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Search titles..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Search episodes and series"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Submit search"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </form>

              {/* Mobile Sound Control */}
              <div className="mt-6 px-4">
                <SoundControl className="w-full" />
              </div>
            </nav>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center justify-center">
                <div className="profile" onClick={handleMobileNavClick()}>U</div>
                <span className="ml-3 text-white">User Profile</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header