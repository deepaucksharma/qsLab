import React from 'react'

const TestCSSPage = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-red-600">CSS Test Page</h1>
      <p className="text-lg mb-2">Testing Tailwind Classes:</p>
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <p className="text-blue-400">Blue text</p>
        <p className="text-green-400">Green text</p>
        <p className="text-yellow-400">Yellow text</p>
      </div>
      <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
      <div className="mt-4 flex gap-4">
        <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
        <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg"></div>
      </div>
    </div>
  )
}

export default TestCSSPage