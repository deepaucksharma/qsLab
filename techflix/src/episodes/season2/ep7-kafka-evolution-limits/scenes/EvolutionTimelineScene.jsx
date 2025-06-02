import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  Timeline,
  MetricDisplay,
  ParticleBackground
} from '../../../../components/StorytellingComponents'
import { getSceneState } from '../../../../utils/animationHelpers'
import AnimatedMetricCounter from '../../../../components/AnimatedMetricCounter'

const EvolutionTimelineScene = ({ time = 0, duration = 12 }) => {
  const phases = {
    intro: { start: 0, duration: 2 },
    history: { start: 2, duration: 7 },
    milestones: { start: 9, duration: 3 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  
  const kafkaTimeline = [
    {
      date: '2011',
      title: 'Birth at LinkedIn',
      description: 'Jay Kreps creates Kafka to handle 1 billion events/day'
    },
    {
      date: '2012',
      title: 'Apache Incubation',
      description: 'Open-sourced and enters Apache Incubator'
    },
    {
      date: '2014',
      title: 'Confluent Founded',
      description: 'Commercial support and enterprise features'
    },
    {
      date: '2017',
      title: 'Exactly-Once Semantics',
      description: 'KIP-98 introduces idempotent producers'
    },
    {
      date: '2020',
      title: 'KRaft Mode',
      description: 'Removing ZooKeeper dependency begins'
    },
    {
      date: '2023',
      title: 'Share Groups',
      description: 'KIP-932 revolutionizes consumption model'
    },
    {
      date: 'Future',
      title: 'Cloud-Native Era',
      description: 'Serverless streaming and edge computing'
    }
  ]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Time Stream Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
        <ParticleBackground 
          particleCount={70}
          colors={['#3b82f6', '#8b5cf6', '#ec4899']}
          behavior="timestream"
        />
        
        {/* Time grid effect */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #3b82f6 1px, transparent 1px),
                linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Intro Phase */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-9xl font-black mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring" }}
                >
                  <span className="bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    KAFKA
                  </span>
                </motion.div>
                <motion.p
                  className="text-3xl text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  A decade of distributed evolution
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* History Phase */}
        {phase === 'history' && (
          <div className="max-w-6xl mx-auto">
            <CinematicTitle
              title="The Journey"
              subtitle="From startup project to industry standard"
              time={localTime}
              startTime={0}
            />
            
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <Timeline
                events={kafkaTimeline}
                time={localTime}
                startTime={1}
              />
            </motion.div>
            
            {/* Floating metrics */}
            {localTime > 3 && (
              <motion.div
                className="absolute top-20 right-20 bg-blue-900/30 backdrop-blur-lg rounded-lg p-4 border border-blue-600/50"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <div className="text-sm text-blue-400 mb-1">Global Adoption</div>
                <AnimatedMetricCounter
                  value={80}
                  suffix="%"
                  className="text-3xl font-bold text-white"
                  duration={2000}
                />
                <div className="text-xs text-gray-400">of Fortune 100</div>
              </motion.div>
            )}
            
            {localTime > 4 && (
              <motion.div
                className="absolute bottom-20 left-20 bg-purple-900/30 backdrop-blur-lg rounded-lg p-4 border border-purple-600/50"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
              >
                <div className="text-sm text-purple-400 mb-1">Daily Events</div>
                <AnimatedMetricCounter
                  value={7}
                  suffix=" trillion"
                  className="text-3xl font-bold text-white"
                  duration={2000}
                />
                <div className="text-xs text-gray-400">processed globally</div>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Milestones Phase */}
        {phase === 'milestones' && (
          <motion.div
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12 gradient-text">
              Game-Changing Milestones
            </h2>
            
            <MetricDisplay
              metrics={[
                {
                  label: 'Performance',
                  prefix: '',
                  value: 2000000,
                  suffix: ' msg/s',
                  change: 10000
                },
                {
                  label: 'Latency',
                  prefix: '<',
                  value: 2,
                  suffix: 'ms p99',
                  change: -95
                },
                {
                  label: 'Durability',
                  prefix: '',
                  value: 99.99999,
                  suffix: '%',
                  change: null
                },
                {
                  label: 'Scale',
                  prefix: '',
                  value: 1000,
                  suffix: '+ nodes',
                  change: 900
                }
              ]}
              time={localTime}
              startTime={0}
            />
            
            <motion.div
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-600/50"
                whileHover={{ scale: 1.05, borderColor: 'rgb(59 130 246)' }}
              >
                <h3 className="text-xl font-bold mb-2 text-blue-400">Past</h3>
                <p className="text-gray-300">Simple pub-sub messaging</p>
              </motion.div>
              
              <motion.div
                className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-600/50"
                whileHover={{ scale: 1.05, borderColor: 'rgb(147 51 234)' }}
              >
                <h3 className="text-xl font-bold mb-2 text-purple-400">Present</h3>
                <p className="text-gray-300">Distributed streaming platform</p>
              </motion.div>
              
              <motion.div
                className="bg-gradient-to-br from-pink-900/30 to-orange-900/30 rounded-lg p-6 border border-pink-600/50"
                whileHover={{ scale: 1.05, borderColor: 'rgb(236 72 153)' }}
              >
                <h3 className="text-xl font-bold mb-2 text-pink-400">Future</h3>
                <p className="text-gray-300">Cloud-native event mesh</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default EvolutionTimelineScene