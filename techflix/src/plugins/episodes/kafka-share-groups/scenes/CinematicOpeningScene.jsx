import React from 'react'

const CinematicOpeningScene = ({ time, duration = 8 }) => {
  const progress = Math.min(time / duration, 1)
  const fadeOutStart = 0.7
  const opacity = time > duration * fadeOutStart 
    ? 1 - ((time - duration * fadeOutStart) / (duration * (1 - fadeOutStart)))
    : 1

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          />
        ))}
      </div>
      
      <div 
        className="text-center max-w-4xl px-8 z-10"
        style={{ 
          opacity,
          transform: `scale(${0.8 + progress * 0.2})`,
          filter: `blur(${Math.max(0, (1 - progress) * 2)}px)`
        }}
      >
        <h1 className="text-6xl md:text-8xl font-black mb-6 gradient-text">
          Breaking the Barrier
        </h1>
        <p className="text-2xl md:text-3xl text-gray-400">
          How Kafka Share Groups Change Everything
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <div className="px-4 py-2 bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-500">Episode</span>
            <span className="block text-xl font-bold">01</span>
          </div>
          <div className="px-4 py-2 bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-500">Runtime</span>
            <span className="block text-xl font-bold">45m</span>
          </div>
          <div className="px-4 py-2 bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-500">Level</span>
            <span className="block text-xl font-bold text-red-500">Advanced</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CinematicOpeningScene