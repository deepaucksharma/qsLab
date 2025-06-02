import EventSourcingIntroScene from '../../../components/scenes/EventSourcingIntroScene'
import CQRSPatternScene from '../../../components/scenes/CQRSPatternScene'
import EventStoreScene from '../../../components/scenes/EventStoreScene'
import SagaPatternScene from '../../../components/scenes/SagaPatternScene'

export const eventDrivenEpisode = {
  metadata: {
    seriesId: 'tech-insights',
    seasonNumber: 1,
    episodeNumber: 4,
    title: 'Event-Driven Systems',
    synopsis: 'Build reactive applications using event sourcing and CQRS patterns for scalable, maintainable architectures.',
    runtime: 48,
    rating: 'Advanced',
    genres: ['Events', 'CQRS', 'Event Sourcing', 'Architecture']
  },
  scenes: [
    {
      id: 'event-sourcing-intro',
      title: 'Introduction to Event Sourcing',
      duration: 600,
      component: EventSourcingIntroScene
    },
    {
      id: 'cqrs-pattern',
      title: 'CQRS Pattern Deep Dive',
      duration: 800,
      component: CQRSPatternScene
    },
    {
      id: 'event-store',
      title: 'Building an Event Store',
      duration: 700,
      component: EventStoreScene
    },
    {
      id: 'saga-pattern',
      title: 'Saga Pattern for Distributed Transactions',
      duration: 780,
      component: SagaPatternScene
    }
  ],
  interactiveMoments: [
    {
      timestamp: 300,
      type: 'quiz',
      data: {
        question: 'What is the main benefit of Event Sourcing?',
        options: [
          'Faster writes',
          'Complete audit trail',
          'Less storage',
          'Simpler code'
        ],
        correctAnswer: 1
      }
    },
    {
      timestamp: 1200,
      type: 'decision',
      data: {
        prompt: 'Choose a consistency model for your CQRS implementation:',
        options: [
          { id: 'eventual', label: 'Eventually Consistent', impact: 'Higher performance, delayed reads' },
          { id: 'strong', label: 'Strongly Consistent', impact: 'Lower performance, immediate reads' }
        ]
      }
    },
    {
      timestamp: 2100,
      type: 'code-exercise',
      data: {
        title: 'Implement a Simple Event',
        starter: `// Define an OrderPlaced event
class OrderPlaced {
  constructor(orderId, customerId, items, total) {
    // TODO: Initialize event properties
  }
}`
      }
    }
  ]
}