import React, { useState, useEffect } from 'react'

const Header = () => {
  const [scrolled, setScrolled] = useState(false)

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
        <a href="#" className="logo" onClick={() => window.location.reload()}>TechFlix</a>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Series</a></li>
          <li><a href="#">New & Popular</a></li>
          <li><a href="#">My List</a></li>
        </ul>
        <div className="nav-right">
          <input type="text" className="search-box" placeholder="Search titles..." />
          <div className="profile">U</div>
        </div>
      </nav>
    </header>
  )
}

export default Header