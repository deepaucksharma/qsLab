import React from 'react'

const NRQLDemoScene = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white p-8">
    <div className="max-w-2xl text-center">
      <h2 className="text-3xl font-bold mb-4">Mini-Demo: RecordsUnacked Live in NRQL</h2>
      <p className="text-lg text-gray-300">
        A quick NRQL query shows your <code>RecordsUnacked</code> metrics trending in real time.
      </p>
    </div>
  </div>
)

export default NRQLDemoScene
