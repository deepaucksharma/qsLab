import { Component } from '../base/Component.js';

/**
 * Quiz Component
 * Interactive quiz system with multiple question types
 */
export class Quiz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentQuestion: 0,
      answers: {},
      submitted: false,
      score: null,
      startTime: Date.now(),
      showExplanations: false
    };
  }

  render() {
    const container = this.createElement('div', { 
      className: 'quiz-container' 
    });

    if (!this.state.submitted) {
      container.appendChild(this.renderQuestion());
    } else {
      container.appendChild(this.renderResults());
    }

    return container;
  }

  renderQuestion() {
    const { questions, title } = this.props;
    const question = questions[this.state.currentQuestion];
    const progress = ((this.state.currentQuestion + 1) / questions.length) * 100;

    return this.createElement('div', { className: 'quiz' }, [
      // Header
      this.createElement('div', { className: 'quiz__header' }, [
        this.createElement('h3', { className: 'quiz__title' }, [title]),
        this.renderProgressBar(progress),
        this.createElement('span', { className: 'quiz__progress-text' }, [
          `Question ${this.state.currentQuestion + 1} of ${questions.length}`
        ])
      ]),

      // Question
      this.createElement('div', { className: 'quiz__question' }, [
        this.createElement('h4', {}, [question.question]),
        question.code && this.renderCodeBlock(question)
      ]),

      // Options
      this.renderOptions(question),

      // Navigation
      this.renderNavigation()
    ]);
  }

  renderProgressBar(progress) {
    return this.createElement('div', { className: 'quiz__progress' }, [
      this.createElement('div', { 
        className: 'quiz__progress-bar',
        style: { width: `${progress}%` }
      })
    ]);
  }

  renderCodeBlock(question) {
    return this.createElement('pre', { className: 'quiz__code' }, [
      this.createElement('code', { 
        className: `language-${question.language || 'javascript'}` 
      }, [question.code])
    ]);
  }

  renderOptions(question) {
    const container = this.createElement('div', { className: 'quiz__options' });
    
    question.options.forEach((option, index) => {
      const optionEl = this.createElement('label', { 
        className: 'quiz__option' 
      }, [
        this.createElement('input', {
          type: question.type === 'multiple' ? 'checkbox' : 'radio',
          name: `question-${this.state.currentQuestion}`,
          value: index,
          checked: this.isSelected(index),
          onChange: () => this.updateAnswer(index, question.type)
        }),
        this.createElement('span', { className: 'quiz__option-text' }, [option])
      ]);
      
      container.appendChild(optionEl);
    });

    return container;
  }

  renderNavigation() {
    const isLastQuestion = this.state.currentQuestion === this.props.questions.length - 1;
    
    return this.createElement('div', { className: 'quiz__actions' }, [
      this.createElement('button', {
        className: 'btn btn--secondary',
        onClick: () => this.previousQuestion(),
        disabled: this.state.currentQuestion === 0
      }, ['Previous']),
      
      this.createElement('button', {
        className: 'btn btn--primary',
        onClick: () => isLastQuestion ? this.submitQuiz() : this.nextQuestion()
      }, [isLastQuestion ? 'Submit Quiz' : 'Next'])
    ]);
  }

  renderResults() {
    const { questions, passingScore = 70 } = this.props;
    const percentage = Math.round((this.state.score / questions.length) * 100);
    const passed = percentage >= passingScore;
    const timeTaken = Math.floor((Date.now() - this.state.startTime) / 1000);

    return this.createElement('div', { className: 'quiz__results' }, [
      // Icon
      this.createElement('div', { className: 'quiz__results-icon' }, [
        this.createElement('i', {
          className: `fas fa-${passed ? 'check-circle' : 'times-circle'}`,
          style: { color: passed ? 'var(--color-success)' : 'var(--color-error)' }
        })
      ]),

      // Title
      this.createElement('h3', {}, ['Quiz Complete!']),

      // Score
      this.createElement('div', { className: 'quiz__score' }, [
        this.createElement('div', { className: 'quiz__score-number' }, [`${percentage}%`]),
        this.createElement('div', { className: 'quiz__score-text' }, [
          `${this.state.score} out of ${questions.length} correct`
        ]),
        this.createElement('div', { className: 'quiz__time' }, [
          `Time taken: ${this.formatTime(timeTaken)}`
        ])
      ]),

      // Message
      this.createElement('p', { className: 'quiz__results-message' }, [
        passed ? 
          "Great job! You've passed this quiz." : 
          `You need at least ${passingScore}% to pass. Try again!`
      ]),

      // Review toggle
      this.createElement('button', {
        className: 'btn btn--secondary',
        onClick: () => this.toggleExplanations()
      }, [
        this.state.showExplanations ? 'Hide Review' : 'Show Review'
      ]),

      // Answer review
      this.state.showExplanations && this.renderAnswerReview(),

      // Actions
      this.createElement('div', { className: 'quiz__actions' }, [
        this.createElement('button', {
          className: 'btn btn--secondary',
          onClick: () => this.retakeQuiz()
        }, ['Retake Quiz']),
        
        this.createElement('button', {
          className: 'btn btn--primary',
          onClick: () => this.props.onComplete?.(this.state.score, this.state.answers)
        }, ['Continue Learning'])
      ])
    ]);
  }

  renderAnswerReview() {
    const reviewContainer = this.createElement('div', { 
      className: 'quiz__results-breakdown' 
    }, [
      this.createElement('h4', {}, ['Review Your Answers:'])
    ]);

    this.props.questions.forEach((question, index) => {
      const isCorrect = this.checkAnswer(index);
      const userAnswer = this.state.answers[index];
      
      const reviewItem = this.createElement('div', {
        className: `quiz__review-item ${isCorrect ? 'correct' : 'incorrect'}`
      }, [
        this.createElement('h5', {}, [
          this.createElement('i', {
            className: `fas fa-${isCorrect ? 'check' : 'times'}`
          }),
          ` Question ${index + 1}: ${question.question}`
        ]),
        
        this.createElement('p', {}, [
          'Your answer: ',
          this.createElement('strong', {}, [
            Array.isArray(userAnswer) ? 
              userAnswer.map(i => question.options[i]).join(', ') :
              question.options[userAnswer] || 'No answer'
          ])
        ])
      ]);

      if (!isCorrect && question.explanation) {
        reviewItem.appendChild(
          this.createElement('div', { className: 'quiz__explanation' }, [
            this.createElement('p', {}, [
              'Correct answer: ',
              this.createElement('strong', {}, [
                Array.isArray(question.correct) ?
                  question.correct.map(i => question.options[i]).join(', ') :
                  question.options[question.correct]
              ])
            ]),
            this.createElement('p', { className: 'explanation-text' }, [
              question.explanation
            ])
          ])
        );
      }

      reviewContainer.appendChild(reviewItem);
    });

    return reviewContainer;
  }

  isSelected(index) {
    const answer = this.state.answers[this.state.currentQuestion];
    if (Array.isArray(answer)) {
      return answer.includes(index);
    }
    return answer === index;
  }

  updateAnswer(value, type) {
    const answers = { ...this.state.answers };
    
    if (type === 'multiple') {
      const current = answers[this.state.currentQuestion] || [];
      if (current.includes(value)) {
        answers[this.state.currentQuestion] = current.filter(v => v !== value);
      } else {
        answers[this.state.currentQuestion] = [...current, value];
      }
    } else {
      answers[this.state.currentQuestion] = value;
    }
    
    this.setState({ answers });
  }

  checkAnswer(questionIndex) {
    const question = this.props.questions[questionIndex];
    const userAnswer = this.state.answers[questionIndex];
    
    if (Array.isArray(question.correct)) {
      return Array.isArray(userAnswer) &&
        userAnswer.length === question.correct.length &&
        userAnswer.every(ans => question.correct.includes(ans));
    }
    
    return userAnswer === question.correct;
  }

  nextQuestion() {
    if (this.state.currentQuestion < this.props.questions.length - 1) {
      this.setState({ currentQuestion: this.state.currentQuestion + 1 });
    }
  }

  previousQuestion() {
    if (this.state.currentQuestion > 0) {
      this.setState({ currentQuestion: this.state.currentQuestion - 1 });
    }
  }

  submitQuiz() {
    let score = 0;
    this.props.questions.forEach((_, index) => {
      if (this.checkAnswer(index)) score++;
    });
    
    this.setState({ submitted: true, score });
    this.props.onSubmit?.(score, this.state.answers);
  }

  retakeQuiz() {
    this.setState({
      currentQuestion: 0,
      answers: {},
      submitted: false,
      score: null,
      startTime: Date.now(),
      showExplanations: false
    });
  }

  toggleExplanations() {
    this.setState({ showExplanations: !this.state.showExplanations });
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// Quiz factory function for easy creation
export function createQuiz(config) {
  const quiz = new Quiz(config);
  return quiz;
}