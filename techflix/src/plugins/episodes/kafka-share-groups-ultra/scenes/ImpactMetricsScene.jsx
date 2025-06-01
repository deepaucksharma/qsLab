import React, { useState, useEffect } from 'react';

const ImpactMetricsScene = ({ time, duration }) => {
  const [metricValues, setMetricValues] = useState([0, 0, 0, 0]);
  const progress = (time / duration) * 100;

  const metrics = [
    { target: 3, label: 'Throughput Improvement', desc: 'Message processing speed', icon: '⚡', color: 'from-red-600 to-orange-600', suffix: 'x' },
    { target: 70, label: 'Complexity Reduction', desc: 'Operational overhead', icon: '📈', color: 'from-green-600 to-emerald-600', suffix: '%' },
    { target: 100, label: 'Scaling Efficiency', desc: 'During peak loads', icon: '🔄', color: 'from-blue-600 to-cyan-600', suffix: '%' },
    { target: 250, label: 'Companies Adopting', desc: 'Fortune 500 enterprises', icon: '🏢', color: 'from-purple-600 to-pink-600', suffix: '+' }
  ];

  const testimonials = [
    { company: 'Netflix', icon: '🎬', quote: 'Reduced recommendation latency by 87% with Share Groups' },
    { company: 'Uber', icon: '🚗', quote: 'Handled 3x more ride requests during peak events' },
    { company: 'Amazon', icon: '🛒', quote: 'Improved order processing scalability by 250%' }
  ];

  // Animate metrics
  useEffect(() => {
    if (time > 2) {
      const animationProgress = Math.min((time - 2) / 5, 1);
      const easeProgress = 1 - Math.pow(1 - animationProgress, 4);
      
      setMetricValues(metrics.map(metric => Math.floor(metric.target * easeProgress)));
    }
  }, [time]);

  const getCardDelay = (index) => 1 + index * 0.3;
  const getCardOpacity = (index) => time > getCardDelay(index) ? 1 : 0;
  const getCardScale = (index) => {
    const delay = getCardDelay(index);
    if (time <= delay) return 0.8;
    const elapsed = time - delay;
    if (elapsed < 0.5) return 0.8 + (elapsed / 0.5) * 0.2;
    return 1;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 via-black to-purple-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-7xl relative z-10">
        {/* Title */}
        <div className="text-center mb-12" style={{ opacity: Math.min(time * 0.5, 1) }}>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Real-World Transformation
          </h1>
          <p className="text-2xl text-gray-300">Performance Gains That Matter</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 text-center border border-gray-700/50 hover:border-gray-600 transform hover:scale-105 transition-all duration-300"
              style={{
                opacity: getCardOpacity(index),
                transform: `scale(${getCardScale(index)})`,
                transition: 'all 0.5s ease-out'
              }}
            >
              {/* Icon */}
              <div className="text-5xl mb-4">{metric.icon}</div>
              
              {/* Value */}
              <div className="text-6xl font-black mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                   style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                   className={`bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                {metricValues[index]}{metric.suffix}
              </div>
              
              {/* Label */}
              <div className="text-lg font-bold mb-2 text-gray-200">{metric.label}</div>
              
              {/* Description */}
              <div className="text-sm text-gray-500 mb-4">{metric.desc}</div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${(metricValues[index] / metric.target) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        {time > 8 && (
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-200"
                style={{ opacity: Math.min((time - 8) * 0.5, 1) }}>
              Industry Leaders Share Their Success
            </h3>
            
            <div className="grid grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-900/60 backdrop-blur-lg rounded-2xl p-6 text-center border border-gray-700/30 hover:border-gray-600 transform hover:scale-105 transition-all duration-300"
                  style={{
                    opacity: Math.min((time - 9 - index) * 0.5, 1),
                    transform: `translateY(${Math.max(0, 30 - (time - 9 - index) * 15)}px) scale(${getCardScale(index + 4)})`,
                    transition: 'all 0.5s ease-out'
                  }}
                >
                  <div className="text-4xl mb-4">{testimonial.icon}</div>
                  <div className="text-xl font-bold mb-3 text-gray-200">{testimonial.company}</div>
                  <p className="text-gray-400 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {time > 15 && (
          <div className="text-center mt-16"
               style={{
                 opacity: Math.min((time - 15) * 0.5, 1),
                 transform: `translateY(${Math.max(0, 30 - (time - 15) * 15)}px)`
               }}>
            <div className="inline-block bg-gradient-to-r from-red-600 to-orange-600 p-1 rounded-full">
              <button className="bg-black rounded-full px-8 py-4 font-bold text-lg hover:bg-gray-900 transition-colors">
                🚀 Start Your Share Groups Journey
              </button>
            </div>
            <p className="text-gray-500 mt-4 text-sm">Join 250+ companies transforming their event streaming architecture</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-96">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-30px) translateX(20px);
          }
          66% {
            transform: translateY(20px) translateX(-10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ImpactMetricsScene;