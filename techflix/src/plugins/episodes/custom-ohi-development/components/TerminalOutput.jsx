import React from 'react'

const TerminalOutput = ({ commands = [], prompt = '$ ' }) => {
  return (
    <div className="bg-black text-green-400 p-4 font-mono text-xs h-full overflow-auto">
      {commands.map((c, i) => (
        <div key={i} className="mb-2">
          <div>
            <span className="text-red-500">{prompt}</span>
            {c.cmd}
          </div>
          {c.output && (
            <pre className="ml-4 whitespace-pre-wrap text-green-300">{c.output}</pre>
          )}
        </div>
      ))}
    </div>
  )
}

export default TerminalOutput
