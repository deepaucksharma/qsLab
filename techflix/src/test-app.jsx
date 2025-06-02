import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('test-app.jsx loading...')

const TestApp = () => {
  console.log('TestApp component rendering')
  return (
    <div style={{ background: '#141414', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: '#E50914', fontSize: '48px' }}>TechFlix is Working!</h1>
      <p style={{ fontSize: '24px' }}>React has successfully mounted.</p>
      <div style={{ marginTop: '20px', padding: '20px', background: '#2a2a2a', borderRadius: '8px' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>React Version: {React.version}</li>
          <li>Current Time: {new Date().toLocaleTimeString()}</li>
          <li>Node Environment: {process.env.NODE_ENV || 'development'}</li>
        </ul>
      </div>
    </div>
  )
}

try {
  console.log('Looking for root element...')
  const rootElement = document.getElementById('root')
  
  if (rootElement) {
    console.log('Root element found, creating React root...')
    const root = ReactDOM.createRoot(rootElement)
    console.log('Rendering TestApp...')
    root.render(<TestApp />)
    console.log('TestApp rendered successfully!')
  } else {
    console.error('Root element not found!')
  }
} catch (error) {
  console.error('Error rendering app:', error)
}