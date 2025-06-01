import React from 'react'
import { Terminal } from 'lucide-react'

const CodeExampleScene = ({ time, duration = 20 }) => {
  const code = `// Traditional Consumer Group
const consumer = kafka.consumer({ 
    groupId: 'payment-processors' 
});

// Limited to partition count!
// 10 partitions = max 10 consumers

// Share Group Consumer (Kafka 4.0)
const shareConsumer = kafka.shareConsumer({ 
    groupId: 'share:payment-processors' 
});

// Scale to 100s of consumers!
// Each message individually tracked

shareConsumer.run({
    eachMessage: async ({ message }) => {
        try {
            await processPayment(message);
            await shareConsumer.acknowledge(message);
        } catch (error) {
            if (isRetryable(error)) {
                await shareConsumer.release(message);
            } else {
                await shareConsumer.reject(message);
            }
        }
    }
});`

  const visibleLines = Math.min(code.split('\n').length, Math.floor(time / 0.5) + 1)

  return (
    <div className="w-full h-full bg-black p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
          Code: The Difference
        </h2>
        
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <Terminal className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">JavaScript</span>
            </div>
          </div>
          
          <div className="p-6 font-mono text-sm">
            {code.split('\n').slice(0, visibleLines).map((line, idx) => (
              <div key={idx} className="flex">
                <span className="text-gray-500 mr-4 select-none">{(idx + 1).toString().padStart(2, '0')}</span>
                <span className={
                  line.includes('//') ? 'text-gray-500' :
                  line.includes('const') ? 'text-purple-400' :
                  line.includes('await') ? 'text-blue-400' :
                  'text-gray-300'
                }>
                  {line || '\u00A0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeExampleScene