import { motion } from 'framer-motion';
import {
  CinematicTitle,
  CodeDemo,
  ArchitectureDiagram,
  MetricDisplay,
  Timeline,
  ComparisonView,
  ParticleBackground,
  SceneTransition
} from '../StorytellingComponents';
import { getCameraTransform } from '../../utils/animationHelpers';

/**
 * SCENE TEMPLATE - Blueprint for Creating Cinematic Technical Content
 * 
 * This template demonstrates best practices for creating engaging technical
 * explainer scenes with proper storytelling structure.
 */

const SceneTemplate = ({ time, duration }) => {
  // Scene timing breakdown (for a 30-second scene)
  const sceneTimings = {
    intro: { start: 0, duration: 3 },        // Hook the audience
    problem: { start: 3, duration: 5 },      // Present the challenge
    solution: { start: 8, duration: 7 },     // Introduce the solution
    demo: { start: 15, duration: 8 },        // Show it in action
    impact: { start: 23, duration: 5 },      // Show the results
    outro: { start: 28, duration: 2 }        // Call to action
  };
  
  
  // Camera movements for cinematic effect
  const cameraMovements = [
    { start: 0, end: 3, fromX: 0, toX: 0, fromY: 50, toY: 0, fromScale: 0.8, toScale: 1 },
    { start: 8, end: 10, fromX: 0, toX: -200, fromY: 0, toY: 0, fromScale: 1, toScale: 1.2 },
    { start: 23, end: 25, fromX: -200, toX: 0, fromY: 0, toY: 0, fromScale: 1.2, toScale: 1 }
  ];
  
  const cameraTransform = getCameraTransform(time, cameraMovements);
  
  // Example data for demonstrations
  const architectureNodes = [
    { id: 'source', label: 'Data Source', icon: '📊', x: 20, y: 50, className: 'border-blue-500' },
    { id: 'processor', label: 'Processor', icon: '⚡', x: 50, y: 50, className: 'border-purple-500' },
    { id: 'output', label: 'Output', icon: '📤', x: 80, y: 50, className: 'border-green-500' }
  ];
  
  const connections = [
    { x1: '30%', y1: '50%', x2: '40%', y2: '50%' },
    { x1: '60%', y1: '50%', x2: '70%', y2: '50%' }
  ];
  
  const metrics = [
    { label: 'Performance', value: 450, suffix: '%', prefix: '+', change: 450 },
    { label: 'Latency', value: 12, suffix: 'ms', change: -88 },
    { label: 'Throughput', value: 1.2, suffix: 'M/s', change: 300 },
    { label: 'Efficiency', value: 99.9, suffix: '%', change: 15 }
  ];
  
  const timelineEvents = [
    { date: '2020', title: 'The Problem', description: 'Systems hit scaling limits' },
    { date: '2021', title: 'Research Phase', description: 'Exploring new architectures' },
    { date: '2022', title: 'Breakthrough', description: 'New pattern discovered' },
    { date: '2023', title: 'Production', description: 'Deployed at scale' }
  ];
  
  const codeExample = `// Revolutionary new approach
class StreamProcessor {
  async process(data) {
    // Parallel processing pipeline
    const results = await Promise.all(
      data.chunks.map(chunk => 
        this.processChunk(chunk)
      )
    );
    
    return this.aggregate(results);
  }
  
  async processChunk(chunk) {
    // Magic happens here ✨
    return transform(chunk);
  }
}`;
  
  const codeHighlights = [
    { start: 10, end: 15, lines: [5, 6, 7] },
    { start: 15, end: 20, lines: [12, 13] }
  ];
  
  return (
    <div className="scene-container" style={{ transform: cameraTransform }}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900" />
      <div className="absolute inset-0 bg-tech-grid opacity-20" />
      <ParticleBackground colors={['#3b82f6', '#8b5cf6', '#10b981']} />
      
      {/* Scene Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="max-w-7xl w-full">
          
          {/* Phase 1: Introduction */}
          <SceneTransition isActive={time >= sceneTimings.intro.start && time < sceneTimings.problem.start}>
            <motion.div 
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <CinematicTitle
                title="The Next Evolution"
                subtitle="Transforming Technical Excellence"
                time={time}
                startTime={sceneTimings.intro.start}
              />
            </motion.div>
          </SceneTransition>
          
          {/* Phase 2: Problem Statement */}
          <SceneTransition isActive={time >= sceneTimings.problem.start && time < sceneTimings.solution.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                The Challenge We Faced
              </motion.h2>
              
              <ComparisonView
                before={{
                  label: "Traditional Approach",
                  content: (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-500">❌</span>
                        <span>Sequential processing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-red-500">❌</span>
                        <span>Limited scalability</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-red-500">❌</span>
                        <span>High latency</span>
                      </div>
                    </div>
                  )
                }}
                after={{
                  label: "Our Solution",
                  content: (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Parallel processing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Infinite scalability</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Ultra-low latency</span>
                      </div>
                    </div>
                  )
                }}
                time={time}
                startTime={sceneTimings.problem.start}
              />
            </div>
          </SceneTransition>
          
          {/* Phase 3: Solution Architecture */}
          <SceneTransition isActive={time >= sceneTimings.solution.start && time < sceneTimings.demo.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                Revolutionary Architecture
              </motion.h2>
              
              <div className="h-96">
                <ArchitectureDiagram
                  nodes={architectureNodes}
                  connections={connections}
                  time={time}
                  startTime={sceneTimings.solution.start}
                />
              </div>
            </div>
          </SceneTransition>
          
          {/* Phase 4: Live Demo */}
          <SceneTransition isActive={time >= sceneTimings.demo.start && time < sceneTimings.impact.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                See It In Action
              </motion.h2>
              
              <CodeDemo
                code={codeExample}
                language="javascript"
                time={time}
                startTime={sceneTimings.demo.start}
                highlights={codeHighlights}
              />
              
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: time > sceneTimings.demo.start + 3 ? 1 : 0 }}
              >
                <button className="btn-interactive">
                  Try Live Demo →
                </button>
              </motion.div>
            </div>
          </SceneTransition>
          
          {/* Phase 5: Impact & Results */}
          <SceneTransition isActive={time >= sceneTimings.impact.start && time < sceneTimings.outro.start}>
            <div className="space-y-8">
              <motion.h2 
                className="text-4xl font-bold text-center mb-8"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Real-World Impact
              </motion.h2>
              
              <MetricDisplay
                metrics={metrics}
                time={time}
                startTime={sceneTimings.impact.start}
              />
              
              <Timeline
                events={timelineEvents}
                time={time}
                startTime={sceneTimings.impact.start + 2}
              />
            </div>
          </SceneTransition>
          
          {/* Phase 6: Call to Action */}
          <SceneTransition isActive={time >= sceneTimings.outro.start}>
            <motion.div 
              className="text-center space-y-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
            >
              <h2 className="text-5xl font-black holographic">
                Ready to Transform?
              </h2>
              <p className="text-xl text-gray-300">
                Join thousands of engineers building the future
              </p>
              <motion.button
                className="btn-interactive text-xl px-8 py-4"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
              </motion.button>
            </motion.div>
          </SceneTransition>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="progress-story">
        <div 
          className="progress-story-fill"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default SceneTemplate;