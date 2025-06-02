import React from 'react';

const OHIConceptScene = ({ time, duration }) => {
  const progress = (time / duration) * 100;
  
  const showTitle = time > 0.5;
  const showDefinition = time > 2;
  const showArchitecture = time > 4;
  const showBenefits = time > 6;

  return (
    <div className="w-full h-full bg-gradient-to-br from-teal-900 via-black to-cyan-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Circuit Pattern Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="tech-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.5"/>
              <circle cx="60" cy="0" r="3" fill="currentColor" opacity="0.5"/>
              <circle cx="0" cy="60" r="3" fill="currentColor" opacity="0.5"/>
              <circle cx="60" cy="60" r="3" fill="currentColor" opacity="0.5"/>
              <circle cx="30" cy="30" r="4" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-grid)"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Title */}
        <div 
          className="text-center mb-12"
          style={{
            opacity: showTitle ? 1 : 0,
            transform: `translateY(${showTitle ? 0 : 30}px)`,
            transition: 'all 0.8s ease-out'
          }}
        >
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            On-Host Integrations (OHI)
          </h1>
          <p className="text-2xl text-gray-300">
            Custom Metrics Collection for New Relic
          </p>
        </div>

        {/* Definition */}
        {showDefinition && (
          <div 
            className="mb-12 bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-teal-500/30"
            style={{
              opacity: Math.min((time - 2) * 0.5, 1),
              transform: `translateX(${Math.max(0, -50 + (time - 2) * 25)}px)`,
              transition: 'all 0.5s ease-out'
            }}
          >
            <h3 className="text-2xl font-bold text-teal-300 mb-4">What is an OHI?</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              An On-Host Integration is a lightweight program that runs alongside the New Relic 
              Infrastructure agent, collecting custom metrics from your applications and services, 
              then sending them to New Relic in a structured format.
            </p>
            <div className="mt-6 flex items-center space-x-8">
              <div className="text-center">
                <div className="text-4xl mb-2">🔧</div>
                <span className="text-sm text-gray-400">Custom Built</span>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <span className="text-sm text-gray-400">Metrics Collector</span>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🚀</div>
                <span className="text-sm text-gray-400">Production Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* Architecture */}
        {showArchitecture && (
          <div 
            className="mb-12"
            style={{
              opacity: Math.min((time - 4) * 0.5, 1),
              transform: `translateY(${Math.max(0, 30 - (time - 4) * 15)}px)`
            }}
          >
            <h3 className="text-2xl font-bold text-gray-300 mb-6 text-center">OHI Architecture</h3>
            <div className="flex items-center justify-between">
              {/* Your App */}
              <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="font-semibold text-cyan-300">Your App</h4>
                <p className="text-xs text-gray-400 mt-2">Kafka + JMX</p>
              </div>

              {/* Arrow */}
              <svg className="w-16 h-2" viewBox="0 0 60 8">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
                  </marker>
                </defs>
                <line x1="0" y1="4" x2="50" y2="4" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#arrowhead)" />
              </svg>

              {/* OHI */}
              <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-teal-500/30 text-center">
                <div className="text-4xl mb-3">🔄</div>
                <h4 className="font-semibold text-teal-300">Your OHI</h4>
                <p className="text-xs text-gray-400 mt-2">Go Binary</p>
              </div>

              {/* Arrow */}
              <svg className="w-16 h-2" viewBox="0 0 60 8">
                <line x1="0" y1="4" x2="50" y2="4" stroke="#14b8a6" strokeWidth="2" markerEnd="url(#arrowhead)" />
              </svg>

              {/* Infrastructure Agent */}
              <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-green-500/30 text-center">
                <div className="text-4xl mb-3">🏗️</div>
                <h4 className="font-semibold text-green-300">Infra Agent</h4>
                <p className="text-xs text-gray-400 mt-2">New Relic</p>
              </div>

              {/* Arrow */}
              <svg className="w-16 h-2" viewBox="0 0 60 8">
                <line x1="0" y1="4" x2="50" y2="4" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead)" />
              </svg>

              {/* New Relic */}
              <div className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h4 className="font-semibold text-purple-300">New Relic</h4>
                <p className="text-xs text-gray-400 mt-2">Platform</p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        {showBenefits && (
          <div 
            className="grid grid-cols-3 gap-6"
            style={{
              opacity: Math.min((time - 6) * 0.5, 1),
              transform: `translateY(${Math.max(0, 20 - (time - 6) * 10)}px)`
            }}
          >
            {[
              { 
                icon: '⚡', 
                title: 'Performance', 
                desc: 'Lightweight & efficient data collection',
                color: 'from-yellow-500 to-orange-500'
              },
              { 
                icon: '🎯', 
                title: 'Customizable', 
                desc: 'Tailored to your specific metrics',
                color: 'from-teal-500 to-cyan-500'
              },
              { 
                icon: '📈', 
                title: 'Integrated', 
                desc: 'First-class New Relic UI support',
                color: 'from-purple-500 to-pink-500'
              }
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="bg-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300"
                style={{
                  opacity: Math.min((time - 6 - idx * 0.3) * 0.5, 1),
                  transform: `scale(${Math.min(1, 0.9 + (time - 6 - idx * 0.3) * 0.05)})`
                }}
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h4 className={`text-lg font-semibold mb-2 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                  {benefit.title}
                </h4>
                <p className="text-sm text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OHIConceptScene;