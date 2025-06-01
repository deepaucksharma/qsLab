import React from 'react'

const CallToActionScene = ({ time = 0 }) => (
  <div className="w-full h-full bg-gradient-to-br from-black via-gray-900 to-purple-900 flex flex-col items-center justify-center text-center p-8 text-white relative overflow-hidden">
    <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
      Observing Kafka Share Groups with New Relic: Mission Accomplished!
    </h1>
    <p className="text-xl mb-8 max-w-3xl">
      You've journeyed from Kafka fundamentals to full New Relic Ultra integration! Explore the resources, and elevate your Kafka observability.
    </p>
    <a
      href="https://nr.com/kafka-sg-observe"
      className="text-3xl font-bold text-blue-400 underline animate-pulse"
      style={{ animationDelay: `${Math.max(0, time - 1)}s` }}
    >
      nr.com/kafka-sg-observe
    </a>
  </div>
)

export default CallToActionScene
