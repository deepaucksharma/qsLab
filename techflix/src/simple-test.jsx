import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('Simple test loading...');

const App = () => {
  console.log('App component rendering');
  return (
    <div style={{ background: 'black', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ color: 'red', fontSize: '48px' }}>TechFlix Test</h1>
      <p>If you see this, React is working!</p>
    </div>
  );
};

console.log('Looking for root element...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  console.log('Creating root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('Rendering...');
  root.render(<App />);
  console.log('Rendered!');
} else {
  console.error('No root element found!');
}