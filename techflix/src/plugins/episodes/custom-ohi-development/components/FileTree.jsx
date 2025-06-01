import React from 'react'

const FileTree = ({ files = {}, activeFile, onFileSelect }) => {
  const root = Object.keys(files)[0]
  const fileMap = root ? files[root] : {}

  return (
    <div className="text-xs font-mono">
      {root && <div className="font-semibold mb-1">{root}</div>}
      <ul className="ml-4 space-y-1">
        {Object.keys(fileMap).map(name => (
          <li key={name}>
            <button
              className={`block text-left w-full ${activeFile === name ? 'text-red-400' : 'text-gray-200'} hover:text-white`}
              onClick={() => onFileSelect && onFileSelect(name)}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FileTree
