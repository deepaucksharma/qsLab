import React from 'react'

const SimplePage = () => {
  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ fontSize: '48px', color: 'red' }}>TechFlix Test</h1>
      <p style={{ fontSize: '24px' }}>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px' }}>
        <button style={{ 
          backgroundColor: 'red', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none',
          borderRadius: '4px',
          fontSize: '18px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  )
}

export default SimplePage