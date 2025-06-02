import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SeasonTabs = ({ seasons, selectedSeason, onSeasonChange }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const tabsContainerRef = useRef(null);
  const tabsRef = useRef(null);

  // Check if tabs overflow and need scroll arrows
  const checkOverflow = () => {
    if (tabsContainerRef.current && tabsRef.current) {
      const container = tabsContainerRef.current;
      const tabs = tabsRef.current;
      
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < tabs.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [seasons]);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = tabsContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkOverflow, 300);
    }
  };

  return (
    <div className="relative mb-8">
      {/* Season Selector Label */}
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-white">Episodes</h2>
        <div className="text-gray-400 text-sm">
          {seasons.find(s => s.number === selectedSeason)?.episodes.length || 0} Episodes
        </div>
      </div>

      {/* Season Tabs Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Tabs Container */}
        <div
          ref={tabsContainerRef}
          className="overflow-x-auto scrollbar-hide"
          onScroll={checkOverflow}
        >
          <div ref={tabsRef} className="flex gap-2 pb-2">
            {seasons.map((season) => (
              <button
                key={season.number}
                onClick={() => onSeasonChange(season.number)}
                className={`
                  relative px-6 py-3 whitespace-nowrap font-medium text-lg transition-all duration-200
                  ${selectedSeason === season.number
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                  }
                `}
              >
                {/* Tab Label */}
                <span className="relative z-10">
                  {season.title || `Season ${season.number}`}
                </span>
                
                {/* Active Indicator */}
                {selectedSeason === season.number && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-sm" />
                )}
                
                {/* Episode Count Badge */}
                {season.episodes && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({season.episodes.length})
                  </span>
                )}
                
                {/* New Episodes Badge */}
                {season.hasNewEpisodes && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Season Description */}
      {seasons.find(s => s.number === selectedSeason)?.description && (
        <p className="mt-4 text-gray-400 text-sm max-w-3xl">
          {seasons.find(s => s.number === selectedSeason).description}
        </p>
      )}
    </div>
  );
};

// Add custom scrollbar hide styles
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Safari and Chrome */
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = scrollbarHideStyles;
  document.head.appendChild(styleSheet);
}

export default SeasonTabs;