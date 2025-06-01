import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle } from 'lucide-react'

const InteractiveOverlay = ({ scene, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showFeedback, setShowFeedback] = useState(false)

  const questions = scene.interactiveElements || []
  const currentQ = questions[currentQuestion]

  const handleAnswer = (answerIndex) => {
    const newAnswers = { ...answers, [currentQuestion]: answerIndex }
    setAnswers(newAnswers)
    setShowFeedback(true)

    setTimeout(() => {
      setShowFeedback(false)
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(current => current + 1)
      } else {
        onComplete()
      }
    }, 2000)
  }

  if (!currentQ) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-effect rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{currentQ.type === 'quiz' ? 'Knowledge Check' : 'Interactive Element'}</h2>
            <p className="text-gray-400 text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Question Content */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">{currentQ.question}</h3>
          
          {currentQ.code && (
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-green-400">{currentQ.code}</pre>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options?.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => !showFeedback && handleAnswer(index)}
                disabled={showFeedback}
                whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showFeedback
                    ? index === currentQ.correctAnswer
                      ? 'border-green-500 bg-green-500/20'
                      : answers[currentQuestion] === index
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-gray-600 bg-gray-800'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {showFeedback && (
                    <div>
                      {index === currentQ.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : answers[currentQuestion] === index ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                  <span className="font-medium">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                answers[currentQuestion] === currentQ.correctAnswer
                  ? 'bg-green-500/20 border border-green-500'
                  : 'bg-red-500/20 border border-red-500'
              }`}
            >
              <p className="font-semibold mb-2">
                {answers[currentQuestion] === currentQ.correctAnswer ? 'Correct!' : 'Not quite right.'}
              </p>
              <p className="text-sm text-gray-300">{currentQ.explanation}</p>
            </motion.div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-8">
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= currentQuestion ? 'bg-netflix-red' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default InteractiveOverlay