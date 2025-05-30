/**
 * Week 1 Quiz Implementation
 */

// Quiz questions for Week 1
const week1QuizData = {
  title: 'Week 1: X-Ray Vision Assessment',
  passingScore: 70,
  questions: [
    {
      question: 'What is the primary purpose of JMX in Kafka monitoring?',
      type: 'single',
      options: [
        'To store Kafka messages',
        'To expose Kafka metrics and allow management operations',
        'To handle consumer group coordination',
        'To manage topic partitions'
      ],
      correct: 1,
      explanation: 'JMX (Java Management Extensions) provides a standardized way to expose Kafka metrics and perform management operations on the broker.'
    },
    {
      question: 'Which JMX metric would you use to monitor the rate of messages coming into a Kafka broker?',
      type: 'single',
      options: [
        'BytesOutPerSec',
        'MessagesInPerSec',
        'RequestsPerSec',
        'PartitionCount'
      ],
      correct: 1,
      explanation: 'MessagesInPerSec is the JMX metric that tracks the rate of messages being produced to the broker.'
    },
    {
      question: 'Given the following JMX output, calculate the message rate:\nCount at T1: 15823\nCount at T2: 31646\nTime interval: 60 seconds',
      type: 'single',
      code: 'Count at T1: 15823\nCount at T2: 31646\nTime interval: 60 seconds',
      language: 'text',
      options: [
        '527.4 messages/second',
        '263.7 messages/second',
        '1582.3 messages/second',
        '316.5 messages/second'
      ],
      correct: 1,
      explanation: 'Rate = (31646 - 15823) / 60 = 15823 / 60 = 263.7 messages/second'
    },
    {
      question: 'Which of the following are valid JMX domains in Kafka? (Select all that apply)',
      type: 'multiple',
      options: [
        'kafka.server',
        'kafka.network',
        'kafka.consumer',
        'kafka.log',
        'kafka.controller'
      ],
      correct: [0, 1, 3, 4],
      explanation: 'kafka.server, kafka.network, kafka.log, and kafka.controller are standard JMX domains. kafka.consumer is managed client-side.'
    },
    {
      question: 'What does the nri-kafka integration do with JMX counter values?',
      type: 'single',
      options: [
        'Stores them as-is in New Relic',
        'Converts them to rate metrics (per second)',
        'Aggregates them by topic',
        'Filters out zero values'
      ],
      correct: 1,
      explanation: 'The nri-kafka integration automatically converts JMX counter values to rate metrics for easier analysis in New Relic.'
    },
    {
      question: 'In the metric flow from Kafka to New Relic, what is the correct order?',
      type: 'single',
      options: [
        'Kafka → New Relic → JMX → nri-kafka',
        'JMX → Kafka → nri-kafka → New Relic',
        'Kafka → JMX → nri-kafka → New Relic Infrastructure Agent → New Relic',
        'nri-kafka → JMX → Kafka → New Relic'
      ],
      correct: 2,
      explanation: 'Metrics flow from Kafka (exposed via JMX) → collected by nri-kafka → sent through Infrastructure Agent → stored in New Relic.'
    },
    {
      question: 'Which command would you use to connect to a Kafka broker\'s JMX port using jmxterm?',
      type: 'single',
      code: 'java -jar jmxterm.jar',
      language: 'bash',
      options: [
        'connect kafka://localhost:9092',
        'open localhost:9999',
        'jmx connect localhost:9999',
        'attach localhost:9999'
      ],
      correct: 1,
      explanation: 'In jmxterm, the "open" command is used to connect to a JMX port, typically 9999 for Kafka.'
    },
    {
      question: 'What is the relationship between Count and OneMinuteRate in JMX metrics?',
      type: 'single',
      options: [
        'Count is the total since broker start, OneMinuteRate is the average per second over the last minute',
        'They are the same value in different units',
        'Count is per minute, OneMinuteRate is per second',
        'OneMinuteRate is the derivative of Count'
      ],
      correct: 0,
      explanation: 'Count is a cumulative counter since broker start, while OneMinuteRate shows the average rate per second calculated over the last minute.'
    }
  ]
};

// Initialize quiz when document is ready
function initializeWeek1Quiz() {
  const quizContainer = document.getElementById('week1-quiz-container');
  if (!quizContainer) {
    console.error('Quiz container not found');
    return;
  }

  // Add quiz button to Week 1 section
  const week1Section = document.getElementById('week1');
  if (week1Section) {
    const quizButton = document.createElement('button');
    quizButton.className = 'btn btn--primary';
    quizButton.innerHTML = '<i class="fas fa-clipboard-check"></i> Take Week 1 Quiz';
    quizButton.onclick = () => launchQuiz();
    
    // Find a good place to insert the button
    const exerciseSection = week1Section.querySelector('.exercises');
    if (exerciseSection) {
      exerciseSection.appendChild(quizButton);
    }
  }
}

// Launch the quiz
async function launchQuiz() {
  // Check if Quiz component is available
  if (!window.moduleLoader?.Quiz) {
    // Try to load it
    try {
      const module = await import('../components/assessment/Quiz.js');
      window.moduleLoader.Quiz = module.Quiz;
    } catch (error) {
      console.error('Failed to load Quiz component:', error);
      alert('Quiz component is not available. Please refresh the page.');
      return;
    }
  }

  const { Quiz } = window.moduleLoader;
  const { progressTracker, toast } = window.moduleLoader;

  // Create quiz modal
  const modal = document.createElement('div');
  modal.className = 'quiz-modal';
  modal.innerHTML = `
    <div class="quiz-modal-content">
      <button class="quiz-modal-close" onclick="this.closest('.quiz-modal').remove()">
        <i class="fas fa-times"></i>
      </button>
      <div id="quiz-mount-point"></div>
    </div>
  `;

  document.body.appendChild(modal);

  // Create and mount quiz
  const quiz = new Quiz({
    ...week1QuizData,
    onSubmit: (score, answers) => {
      // Track quiz completion
      if (progressTracker) {
        progressTracker.completeQuiz('week1', 'week1-quiz', score, answers);
      }
      
      // Show toast
      if (toast) {
        const percentage = Math.round((score / week1QuizData.questions.length) * 100);
        if (percentage >= 70) {
          toast.success(`Quiz passed with ${percentage}%! Great job! 🎉`);
        } else {
          toast.warning(`Quiz score: ${percentage}%. Keep studying and try again!`);
        }
      }
    },
    onComplete: (score, answers) => {
      // Close modal
      modal.remove();
      
      // Update UI
      updateWeek1Progress();
    }
  });

  quiz.mount(document.getElementById('quiz-mount-point'));

  // Add quiz styles if not already loaded
  if (!document.querySelector('link[href*="quiz.css"]')) {
    const quizStyles = document.createElement('link');
    quizStyles.rel = 'stylesheet';
    quizStyles.href = 'styles/components/quiz.css';
    document.head.appendChild(quizStyles);
  }
}

// Update Week 1 progress after quiz
function updateWeek1Progress() {
  const { progressTracker } = window.moduleLoader;
  if (progressTracker) {
    const moduleProgress = progressTracker.state.modules.week1;
    const badge = document.querySelector('a[href="#week1"] .progress-badge');
    if (badge) {
      badge.textContent = `${Math.round(moduleProgress.progress)}%`;
    }
  }
}

// Add quiz modal styles
const quizModalStyles = `
.quiz-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.quiz-modal-content {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease;
}

.quiz-modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.quiz-modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

#quiz-mount-point {
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

[data-theme="dark"] .quiz-modal-content {
  background: var(--color-surface-variant);
}

[data-theme="dark"] .quiz-modal-close {
  color: #ccc;
}

[data-theme="dark"] .quiz-modal-close:hover {
  background: var(--color-gray-800);
  color: white;
}
`;

// Inject modal styles
const modalStyleSheet = document.createElement('style');
modalStyleSheet.textContent = quizModalStyles;
document.head.appendChild(modalStyleSheet);

// Auto-initialize when enhancements are loaded
if (window.moduleLoader) {
  initializeWeek1Quiz();
} else {
  document.addEventListener('enhancementsLoaded', initializeWeek1Quiz);
}

// Export for manual use
window.week1Quiz = {
  initialize: initializeWeek1Quiz,
  launch: launchQuiz,
  data: week1QuizData
};