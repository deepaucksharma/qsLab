import React, { useState, useEffect } from 'react'

const RecapScene = ({ time = 0, duration = 40 }) => {
  const points = [
    'Kafka Share Groups fundamentals',
    'Custom OHI for QueueSample metrics',
    'Queues & Streams UI integration',
    'Operational best practices'
  ]

  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const index = Math.min(points.length, Math.floor(time / 5))
    setVisibleCount(index)
  }, [time])

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-blue-900 flex flex-col items-center justify-center p-8 text-center text-white relative overflow-hidden">
      <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
        Mission Recap
      </h1>
      <ul className="text-2xl space-y-6">
        {points.slice(0, visibleCount).map((p, i) => (
          <li key={i} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${i * 0.3}s`, animationFillMode: 'forwards' }}>
            {p}
          </li>
        ))}
      </ul>
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  )
}

export default RecapScene
