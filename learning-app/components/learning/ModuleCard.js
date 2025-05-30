import { Component } from '../base/Component.js';

/**
 * Module Card Component
 * Displays learning module information with progress tracking
 */
export class ModuleCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      progress: props.progress || 0
    };
  }

  render() {
    const { 
      moduleId, 
      title, 
      subtitle, 
      objectives = [], 
      exercises = [],
      isLocked = false,
      isActive = false
    } = this.props;

    return this.createElement('div', {
      className: `module-card ${isLocked ? 'module-card--locked' : ''} ${isActive ? 'module-card--active' : ''}`,
      dataset: { moduleId }
    }, [
      // Header
      this.createElement('div', { className: 'module-card__header' }, [
        // Icon
        this.createElement('div', { className: 'module-card__icon' }, [
          this.createElement('span', { className: 'module-icon' }, [this.getIcon()])
        ]),
        
        // Info
        this.createElement('div', { className: 'module-card__info' }, [
          this.createElement('h3', { className: 'module-card__title' }, [title]),
          this.createElement('p', { className: 'module-card__subtitle' }, [subtitle])
        ]),
        
        // Progress Ring
        this.renderProgressRing()
      ]),
      
      // Content (expandable)
      this.state.expanded && this.createElement('div', { 
        className: 'module-card__content' 
      }, [
        // Objectives
        objectives.length > 0 && this.createElement('div', { 
          className: 'module-objectives' 
        }, [
          this.createElement('h4', {}, ['Learning Objectives:']),
          this.createElement('ul', {}, 
            objectives.map(obj => 
              this.createElement('li', {}, [obj])
            )
          )
        ]),
        
        // Exercises
        exercises.length > 0 && this.createElement('div', { 
          className: 'module-exercises' 
        }, [
          this.createElement('h4', {}, ['Exercises:']),
          this.createElement('ul', { className: 'exercise-list' }, 
            exercises.map(ex => 
              this.createElement('li', { 
                className: ex.completed ? 'completed' : '' 
              }, [
                this.createElement('i', { 
                  className: `fas fa-${ex.completed ? 'check-circle' : 'circle'}` 
                }),
                this.createElement('span', {}, [ex.name])
              ])
            )
          )
        ])
      ]),
      
      // Actions
      this.createElement('div', { className: 'module-card__actions' }, [
        isLocked ? 
          this.createElement('button', {
            className: 'btn btn--disabled',
            disabled: true
          }, [
            this.createElement('i', { className: 'fas fa-lock' }),
            this.createElement('span', {}, ['Locked'])
          ]) :
          this.createElement('button', {
            className: 'btn btn--primary',
            onClick: () => this.handleStart()
          }, [
            this.state.progress > 0 ? 'Continue' : 'Start',
            ' Module'
          ]),
        
        this.createElement('button', {
          className: 'btn btn--secondary btn--icon',
          onClick: () => this.toggleExpanded(),
          'aria-label': this.state.expanded ? 'Show less' : 'Show more',
          'aria-expanded': this.state.expanded
        }, [
          this.createElement('i', { 
            className: `fas fa-chevron-${this.state.expanded ? 'up' : 'down'}` 
          })
        ])
      ])
    ]);
  }

  renderProgressRing() {
    const radius = 26;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (this.state.progress / 100) * circumference;

    return this.createElement('div', { className: 'module-card__progress' }, [
      this.createElement('svg', {
        className: 'progress-ring',
        width: '60',
        height: '60'
      }, [
        // Background circle
        this.createElement('circle', {
          className: 'progress-ring__bg',
          stroke: 'var(--color-gray-200)',
          strokeWidth: '4',
          fill: 'transparent',
          r: radius,
          cx: '30',
          cy: '30'
        }),
        // Progress circle
        this.createElement('circle', {
          className: 'progress-ring__circle',
          stroke: 'var(--color-primary-500)',
          strokeWidth: '4',
          fill: 'transparent',
          r: radius,
          cx: '30',
          cy: '30',
          style: {
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.35s'
          }
        })
      ]),
      this.createElement('span', { className: 'progress-text' }, [
        `${this.state.progress}%`
      ])
    ]);
  }

  getIcon() {
    const icons = {
      'foundation': '📚',
      'week1': '🔍',
      'week2': '🔨',
      'week3': '⚡',
      'week4': '🕵️',
      'week5': '🏗️'
    };
    return icons[this.props.moduleId] || '📖';
  }

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  handleStart() {
    this.props.onStart?.(this.props.moduleId);
  }

  updateProgress(newProgress) {
    this.setState({ progress: newProgress });
  }
}