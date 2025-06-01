import React from 'react'

const CodeEditor = ({ code = '', language = 'text', showLineNumbers = false, theme = '' }) => {
  const lines = code.split('\n')
  return (
    <pre className={`bg-gray-900 text-green-300 p-4 overflow-auto text-xs font-mono ${theme}`}>
      {showLineNumbers
        ? lines.map((line, idx) => (
            <div key={idx} className="whitespace-pre">
              <span className="select-none opacity-50 mr-2">{String(idx + 1).padStart(3, ' ')}</span>
              {line}
            </div>
          ))
        : code}
    </pre>
  )
}

export default CodeEditor
