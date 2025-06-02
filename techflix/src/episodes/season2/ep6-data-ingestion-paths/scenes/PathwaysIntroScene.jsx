import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CinematicTitle,
  ArchitectureDiagram,
  ParticleBackground,
  Timeline
} from '../../../../components/StorytellingComponents'
import { getSceneState, getTextRevealStyle } from '../../../../utils/animationHelpers'

const PathwaysIntroScene = ({ time = 0, duration = 10 }) => {
  const phases = {
    opening: { start: 0, duration: 3 },
    challenge: { start: 3, duration: 4 },
    preview: { start: 7, duration: 3 }
  }
  
  const { phase, progress, localTime } = getSceneState(time, phases)
  
  // Data flow visualization nodes
  const dataFlowNodes = [
    { id: 'source1', label: 'IoT Devices', icon: '📡', x: 10, y: 30, description: '1M events/s' },
    { id: 'source2', label: 'Web Apps', icon: '🌐', x: 10, y: 50, description: '500K req/s' },
    { id: 'source3', label: 'Databases', icon: '💾', x: 10, y: 70, description: 'CDC streams' },
    { id: 'kafka', label: 'Kafka', icon: '🚀', x: 50, y: 50, description: 'Central Hub' },
    { id: 'consumer1', label: 'Analytics', icon: '📊', x: 90, y: 30, description: 'Real-time' },
    { id: 'consumer2', label: 'Storage', icon: '🗄️', x: 90, y: 50, description: 'Data Lake' },
    { id: 'consumer3', label: 'ML Pipeline', icon: '🤖', x: 90, y: 70, description: 'Predictions' }
  ]
  
  const connections = [
    { x1: '15%', y1: '30%', x2: '45%', y2: '50%' },
    { x1: '15%', y1: '50%', x2: '45%', y2: '50%' },
    { x1: '15%', y1: '70%', x2: '45%', y2: '50%' },
    { x1: '55%', y1: '50%', x2: '85%', y2: '30%' },
    { x1: '55%', y1: '50%', x2: '85%', y2: '50%' },
    { x1: '55%', y1: '50%', x2: '85%', y2: '70%' }
  ]
  
  const ingestionPaths = [
    { date: 'Path 1', title: 'Direct Producer API', description: 'Low latency, high control' },
    { date: 'Path 2', title: 'Kafka Connect', description: 'Declarative, scalable connectors' },
    { date: 'Path 3', title: 'Stream Processing', description: 'Transform as you ingest' },
    { date: 'Path 4', title: 'Hybrid Approach', description: 'Best of all worlds' }
  ]
  
  return (
    <div className="scene-container relative bg-black">
      {/* Dynamic Data Flow Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20" />
        <ParticleBackground 
          particleCount={50}
          colors={['#3b82f6', '#06b6d4', '#14b8a6']}
          behavior="flow"
        />
      </div>
      
      <div className="relative z-10 h-full p-8 overflow-hidden">
        
        {/* Opening Phase */}
        <AnimatePresence>
          {phase === 'opening' && (
            <motion.div
              className="flex items-center justify-center h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.h1
                  className="text-8xl md:text-9xl font-black mb-6"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, type: "spring" }}
                >
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    DATA INGESTION
                  </span>
                </motion.h1>
                <motion.p
                  className="text-3xl text-gray-300"
                  style={getTextRevealStyle(localTime, 1)}
                >
                  Where your data journey begins
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Challenge Phase */}
        {phase === 'challenge' && (
          <div className="max-w-7xl mx-auto">
            <CinematicTitle
              title="The Challenge"
              subtitle="Multiple sources, one destination"
              time={localTime}
              startTime={0}
            />
            
            <motion.div
              className="mt-12 relative h-96"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <ArchitectureDiagram
                nodes={dataFlowNodes}
                connections={connections}
                time={localTime}
                startTime={0.5}
              />
              
              {/* Data flow animation overlay */}
              {localTime > 2 && (
                <div className="absolute inset-0 pointer-events-none">
                  {connections.map((conn, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400 rounded-full"
                      initial={{ left: conn.x1, top: conn.y1 }}
                      animate={{ left: conn.x2, top: conn.y2 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "linear"
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
            
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: localTime > 2 ? 1 : 0, y: localTime > 2 ? 0 : 20 }}
            >
              <p className="text-2xl text-gray-300">
                How do you efficiently move <span className="text-cyan-400 font-bold">millions of events</span> per second?
              </p>
            </motion.div>
          </div>
        )}
        
        {/* Preview Phase */}
        {phase === 'preview' && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-5xl font-bold text-center mb-12 gradient-text">
              Your Ingestion Toolkit
            </h2>
            
            <Timeline
              events={ingestionPaths}
              time={localTime}
              startTime={0}
            />
            
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2 }}
            >
              <motion.div
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg"
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 40px rgba(6, 182, 212, 0.8)',
                    '0 0 20px rgba(59, 130, 246, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-xl font-bold">Let's explore each path</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default PathwaysIntroScene