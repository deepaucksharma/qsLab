import React from 'react'
import { Lock, Unlock, AlertCircle } from 'lucide-react'

const ProblemVisualizationScene = ({ time, duration = 15 }) => {
  const concepts = [
    {
      title: 'The Scaling Ceiling',
      description: '10 partitions = max 10 consumers',
      icon: Lock,
      problem: true,
      stats: { limit: '10', waste: '60%' }
    },
    {
      title: 'Head-of-Line Blocking',
      description: 'One slow message blocks entire partition',
      icon: AlertCircle,
      problem: true,
      stats: { latency: '10x', impact: 'Critical' }
    },
    {
      title: 'Share Groups Solution',
      description: 'Unlimited consumers, no blocking',
      icon: Unlock,
      problem: false,
      stats: { limit: '∞', efficiency: '95%' }
    }
  ]

  const visibleConcepts = Math.min(concepts.length, Math.floor(time / 5) + 1)

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-850 to-black p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 animate-fadeIn">
          The Problems We Face
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {concepts.slice(0, visibleConcepts).map((concept, idx) => {
            const Icon = concept.icon
            return (
              <div
                key={idx}
                className={`
                  relative rounded-2xl p-6 transform transition-all duration-700
                  ${concept.problem 
                    ? 'bg-gradient-to-br from-red-900/20 to-gray-900 border-2 border-red-600/50' 
                    : 'bg-gradient-to-br from-green-900/20 to-gray-900 border-2 border-green-600/50'
                  }
                  animate-scaleIn
                `}
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    concept.problem ? 'bg-red-600/20' : 'bg-green-600/20'
                  }`}>
                    <Icon size={32} className={
                      concept.problem ? 'text-red-500' : 'text-green-500'
                    } />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{concept.title}</h3>
                <p className="text-gray-400 mb-4">{concept.description}</p>
                
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-700">
                  {Object.entries(concept.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className={`text-2xl font-bold ${
                        concept.problem ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {value}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProblemVisualizationScene