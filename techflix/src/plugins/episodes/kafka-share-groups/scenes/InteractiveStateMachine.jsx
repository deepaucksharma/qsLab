import React, { useState } from 'react'

const InteractiveStateMachine = ({ onComplete }) => {
  const [currentState, setCurrentState] = useState('available')
  const [history, setHistory] = useState(['available'])
  
  const states = {
    available: { 
      color: '#10B981', 
      label: 'Available',
      description: 'Ready for consumption',
      next: ['acquired'] 
    },
    acquired: { 
      color: '#3B82F6', 
      label: 'Acquired',
      description: 'Locked by consumer',
      next: ['acknowledged', 'released', 'rejected'] 
    },
    acknowledged: { 
      color: '#22C55E', 
      label: 'Acknowledged',
      description: 'Successfully processed',
      next: [] 
    },
    released: { 
      color: '#F59E0B', 
      label: 'Released',
      description: 'Returned for retry',
      next: ['available'] 
    },
    rejected: { 
      color: '#EF4444', 
      label: 'Rejected',
      description: 'Processing failed',
      next: [] 
    }
  }

  const handleTransition = (nextState) => {
    setHistory([...history, nextState])
    setCurrentState(nextState)
  }

  return (
    <div className="glass-effect rounded-2xl p-8 max-w-3xl w-full animate-scaleIn">
      <h2 className="text-3xl font-bold text-center mb-8">
        Interactive State Machine
      </h2>
      
      <div className="text-center mb-8">
        <div 
          className="inline-block text-5xl font-bold p-8 rounded-2xl"
          style={{ 
            backgroundColor: states[currentState].color + '20',
            color: states[currentState].color,
            border: `3px solid ${states[currentState].color}`
          }}
        >
          {states[currentState].label}
        </div>
        <p className="text-gray-400 mt-4">{states[currentState].description}</p>
      </div>
      
      <div className="flex justify-center gap-4 mb-8">
        {states[currentState].next.map(nextState => (
          <button
            key={nextState}
            onClick={() => handleTransition(nextState)}
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: states[nextState].color + '20',
              color: states[nextState].color,
              border: `2px solid ${states[nextState].color}`
            }}
          >
            → {states[nextState].label}
          </button>
        ))}
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-2 text-gray-400">State History</h3>
        <div className="flex gap-2 flex-wrap">
          {history.map((state, idx) => (
            <span 
              key={idx}
              className="px-3 py-1 rounded text-sm"
              style={{ 
                backgroundColor: states[state].color + '30',
                color: states[state].color
              }}
            >
              {states[state].label}
            </span>
          ))}
        </div>
      </div>
      
      <button
        onClick={() => onComplete({ finalState: currentState, history })}
        className="w-full netflix-button text-lg"
      >
        Continue Learning
      </button>
    </div>
  )
}

export default InteractiveStateMachine