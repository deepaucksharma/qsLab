import { partitionBarrierEpisode, criticalMetricsEpisode, kafkaShareGroupsEpisode, jmxExplorationEpisode } from '../episodes'

// Enhanced series metadata with Netflix-style features
export const SERIES_INFO = {
  id: 'tech-insights-2024',
  title: "Tech Insights",
  tagline: "Mastering Modern Technology",
  overview: "Explore cutting-edge technology concepts through cinematic storytelling. From Kafka's revolutionary Share Groups to New Relic's observability platform, each episode delivers deep technical insights with Hollywood-quality production.",
  heroImage: "/images/series-hero.jpg",
  logoImage: "/images/series-logo.png",
  rating: "TV-14",
  year: 2024,
  seasons: 2,
  totalEpisodes: 8,
  genres: ["Educational", "Technology", "Documentary"],
  cast: [
    { name: "AI Narrator", role: "Guide", image: "/images/cast/narrator.jpg" },
    { name: "Technical Experts", role: "Subject Matter Experts", image: "/images/cast/experts.jpg" }
  ],
  creators: ["TechFlix Studios"],
  matchScore: 98,
  maturityRating: {
    rating: "TV-14",
    descriptors: ["Complex Technical Content", "Professional Language"]
  },
  details: {
    totalDuration: "5h 20m",
    releaseSchedule: "Weekly",
    languages: ["English"],
    subtitles: ["English", "Spanish", "French", "German", "Japanese"],
    audioDescription: true,
    dolbyVision: true,
    hdr10: true,
    spatialAudio: true,
    downloads: true
  },
  trailerUrl: "/videos/series-trailer.mp4",
  socialShare: {
    hashtags: ["TechInsights", "LearnKafka", "Observability"],
    shortUrl: "techflix.io/tech-insights"
  }
}

// Enhanced episode data structure
export const ENHANCED_SERIES_DATA = {
  seasons: [
    {
      id: "season-1",
      number: 1,
      title: "Season 1: Foundations",
      releaseDate: "2024-01-15",
      description: "Master the fundamentals of modern distributed systems and observability.",
      episodes: [
        {
          id: "s1e1",
          seasonNumber: 1,
          episodeNumber: 1,
          overallNumber: 1,
          title: "Breaking the Partition Barrier",
          description: "Discover how Kafka Share Groups revolutionize message consumption by removing the partition-consumer limit.",
          synopsis: "In this groundbreaking episode, we explore Apache Kafka's most significant evolution: Share Groups. Learn how this revolutionary feature solves the age-old partition-consumer coupling problem, enabling unprecedented scalability in event streaming architectures.",
          duration: 2700, // 45 minutes in seconds
          durationDisplay: "45m",
          releaseDate: "2024-01-15",
          level: "Advanced",
          tags: ["Kafka", "Distributed Systems", "Streaming"],
          hasContent: true,
          episodeData: partitionBarrierEpisode,
          thumbnail: "/images/episodes/s1e1-thumbnail.jpg",
          previewVideo: "/videos/episodes/s1e1-preview.mp4",
          stillFrames: [
            "/images/episodes/s1e1-still-1.jpg",
            "/images/episodes/s1e1-still-2.jpg",
            "/images/episodes/s1e1-still-3.jpg"
          ],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["System Architects Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: 4.8,
            criticalScore: 95,
            viewCount: 125000
          },
          downloadAvailable: true,
          nextEpisode: "s1e2",
          previousEpisode: null
        },
        {
          id: "s1e2",
          seasonNumber: 1,
          episodeNumber: 2,
          overallNumber: 2,
          title: "Performance Metrics Deep Dive",
          description: "Master the art of system observation with advanced monitoring techniques.",
          synopsis: "Journey into the world of observability as we uncover the critical metrics that reveal system health. From golden signals to custom dashboards, learn how to build a comprehensive monitoring strategy that prevents issues before they impact users.",
          duration: 2280, // 38 minutes
          durationDisplay: "38m",
          releaseDate: "2024-01-22",
          level: "Intermediate",
          tags: ["Monitoring", "Observability", "Metrics"],
          hasContent: true,
          episodeData: criticalMetricsEpisode,
          thumbnail: "/images/episodes/s1e2-thumbnail.jpg",
          previewVideo: "/videos/episodes/s1e2-preview.mp4",
          stillFrames: [
            "/images/episodes/s1e2-still-1.jpg",
            "/images/episodes/s1e2-still-2.jpg",
            "/images/episodes/s1e2-still-3.jpg"
          ],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["Observability Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: 4.7,
            criticalScore: 92,
            viewCount: 98000
          },
          downloadAvailable: true,
          nextEpisode: "s1e3",
          previousEpisode: "s1e1"
        },
        {
          id: "s1e3",
          seasonNumber: 1,
          episodeNumber: 3,
          overallNumber: 3,
          title: "Microservices Architecture",
          description: "Design resilient distributed systems with modern microservices patterns.",
          synopsis: "Explore the architectural patterns that power today's most scalable applications. From service mesh to circuit breakers, discover how to build microservices that are both independent and interconnected.",
          duration: 3120, // 52 minutes
          durationDisplay: "52m",
          releaseDate: "2024-01-29",
          level: "Advanced",
          tags: ["Architecture", "Microservices", "Design Patterns"],
          hasContent: false,
          episodeData: null,
          thumbnail: "/images/episodes/s1e3-thumbnail.jpg",
          previewVideo: null,
          stillFrames: [],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["Architecture Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: null,
            criticalScore: null,
            viewCount: 0
          },
          downloadAvailable: false,
          comingSoon: true,
          expectedReleaseDate: "2024-02-05",
          nextEpisode: "s1e4",
          previousEpisode: "s1e2"
        },
        {
          id: "s1e4",
          seasonNumber: 1,
          episodeNumber: 4,
          overallNumber: 4,
          title: "Event-Driven Systems",
          description: "Build reactive applications using event sourcing and CQRS patterns.",
          synopsis: "Discover how event-driven architecture transforms the way we build modern applications. Learn the principles of event sourcing, CQRS, and eventual consistency through practical examples.",
          duration: 2880, // 48 minutes
          durationDisplay: "48m",
          releaseDate: "2024-02-05",
          level: "Advanced",
          tags: ["Events", "CQRS", "Event Sourcing"],
          hasContent: false,
          episodeData: null,
          thumbnail: "/images/episodes/s1e4-thumbnail.jpg",
          previewVideo: null,
          stillFrames: [],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["Event Systems Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: null,
            criticalScore: null,
            viewCount: 0
          },
          downloadAvailable: false,
          comingSoon: true,
          expectedReleaseDate: "2024-02-12",
          nextEpisode: "s2e1",
          previousEpisode: "s1e3"
        }
      ]
    },
    {
      id: "season-2",
      number: 2,
      title: "Season 2: Advanced Topics",
      releaseDate: "2024-02-12",
      description: "Deep dive into cutting-edge technologies and expert-level system design.",
      episodes: [
        {
          id: "s2e1",
          seasonNumber: 2,
          episodeNumber: 1,
          overallNumber: 5,
          title: "Kafka Share Groups: The Future of Event Streaming",
          description: "Explore Apache Kafka 4.0's revolutionary Share Groups feature that breaks the scalability bottleneck of traditional consumer groups.",
          synopsis: "Witness the future of event streaming as we unveil Kafka 4.0's game-changing Share Groups. This feature represents the biggest evolution in Kafka's consumption model, enabling dynamic scaling and eliminating partition limitations.",
          duration: 1920, // 32 minutes
          durationDisplay: "32m",
          releaseDate: "2024-02-12",
          level: "Advanced",
          tags: ["Kafka", "Share Groups", "Event Streaming"],
          hasContent: true,
          episodeData: kafkaShareGroupsEpisode,
          thumbnail: "/images/episodes/s2e1-thumbnail.jpg",
          previewVideo: "/videos/episodes/s2e1-preview.mp4",
          stillFrames: [
            "/images/episodes/s2e1-still-1.jpg",
            "/images/episodes/s2e1-still-2.jpg",
            "/images/episodes/s2e1-still-3.jpg"
          ],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["Kafka Core Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: 4.9,
            criticalScore: 98,
            viewCount: 150000
          },
          downloadAvailable: true,
          featured: true,
          nextEpisode: "s2e2",
          previousEpisode: "s1e4"
        },
        {
          id: "s2e2",
          seasonNumber: 2,
          episodeNumber: 2,
          overallNumber: 6,
          title: "Distributed Systems Consensus",
          description: "Explore Raft, Paxos, and modern consensus algorithms.",
          synopsis: "Unravel the mysteries of distributed consensus as we explore the algorithms that make distributed systems possible. From Raft's understandable approach to Paxos's theoretical foundations, master the art of agreement in distributed computing.",
          duration: 3300, // 55 minutes
          durationDisplay: "55m",
          releaseDate: "2024-02-19",
          level: "Expert",
          tags: ["Consensus", "Distributed Systems", "Algorithms"],
          hasContent: true,
          episodeData: jmxExplorationEpisode,
          thumbnail: "/images/episodes/s2e2-thumbnail.jpg",
          previewVideo: "/videos/episodes/s2e2-preview.mp4",
          stillFrames: [
            "/images/episodes/s2e2-still-1.jpg",
            "/images/episodes/s2e2-still-2.jpg",
            "/images/episodes/s2e2-still-3.jpg"
          ],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["Distributed Systems Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: 4.6,
            criticalScore: 90,
            viewCount: 85000
          },
          downloadAvailable: true,
          nextEpisode: "s2e3",
          previousEpisode: "s2e1"
        },
        {
          id: "s2e3",
          seasonNumber: 2,
          episodeNumber: 3,
          overallNumber: 7,
          title: "Real-time Stream Processing",
          description: "Build high-performance streaming pipelines with Apache Flink.",
          synopsis: "Enter the world of real-time data processing where milliseconds matter. Learn how to build streaming pipelines that process millions of events per second while maintaining exactly-once semantics.",
          duration: 2520, // 42 minutes
          durationDisplay: "42m",
          releaseDate: "2024-02-26",
          level: "Advanced",
          tags: ["Streaming", "Flink", "Real-time"],
          hasContent: false,
          episodeData: null,
          thumbnail: "/images/episodes/s2e3-thumbnail.jpg",
          previewVideo: null,
          stillFrames: [],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["Stream Processing Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: null,
            criticalScore: null,
            viewCount: 0
          },
          downloadAvailable: false,
          comingSoon: true,
          expectedReleaseDate: "2024-03-04",
          nextEpisode: "s2e4",
          previousEpisode: "s2e2"
        },
        {
          id: "s2e4",
          seasonNumber: 2,
          episodeNumber: 4,
          overallNumber: 8,
          title: "Cloud Native Security",
          description: "Implement zero-trust architecture in Kubernetes environments.",
          synopsis: "Security in the cloud-native era requires a fundamental shift in thinking. Explore zero-trust principles, service mesh security, and policy-as-code to build impenetrable Kubernetes deployments.",
          duration: 3000, // 50 minutes
          durationDisplay: "50m",
          releaseDate: "2024-03-04",
          level: "Advanced",
          tags: ["Security", "Kubernetes", "Zero Trust"],
          hasContent: false,
          episodeData: null,
          thumbnail: "/images/episodes/s2e4-thumbnail.jpg",
          previewVideo: null,
          stillFrames: [],
          progress: {
            watched: false,
            watchedDate: null,
            timeWatched: 0,
            percentComplete: 0,
            lastWatchedPosition: 0
          },
          metadata: {
            director: "Tech Studios",
            writers: ["Security Team"],
            producers: ["TechFlix Productions"],
            cinematography: "Digital Animation Studio",
            music: "TechBeats Collective"
          },
          ratings: {
            userScore: null,
            criticalScore: null,
            viewCount: 0
          },
          downloadAvailable: false,
          comingSoon: true,
          expectedReleaseDate: "2024-03-11",
          nextEpisode: null,
          previousEpisode: "s2e3"
        }
      ]
    }
  ],
  
  // Helper functions for episode management
  getEpisodeById(episodeId) {
    for (const season of this.seasons) {
      const episode = season.episodes.find(ep => ep.id === episodeId);
      if (episode) return episode;
    }
    return null;
  },
  
  getNextEpisode(currentEpisodeId) {
    const current = this.getEpisodeById(currentEpisodeId);
    return current?.nextEpisode ? this.getEpisodeById(current.nextEpisode) : null;
  },
  
  getPreviousEpisode(currentEpisodeId) {
    const current = this.getEpisodeById(currentEpisodeId);
    return current?.previousEpisode ? this.getEpisodeById(current.previousEpisode) : null;
  },
  
  getContinueWatching() {
    const inProgress = [];
    for (const season of this.seasons) {
      for (const episode of season.episodes) {
        if (episode.progress.percentComplete > 0 && episode.progress.percentComplete < 95) {
          inProgress.push(episode);
        }
      }
    }
    return inProgress.sort((a, b) => b.progress.watchedDate - a.progress.watchedDate);
  },
  
  getWatchedEpisodes() {
    const watched = [];
    for (const season of this.seasons) {
      for (const episode of season.episodes) {
        if (episode.progress.watched) {
          watched.push(episode);
        }
      }
    }
    return watched;
  },
  
  updateProgress(episodeId, timeWatched, duration) {
    const episode = this.getEpisodeById(episodeId);
    if (episode) {
      episode.progress.timeWatched = timeWatched;
      episode.progress.lastWatchedPosition = timeWatched;
      episode.progress.percentComplete = (timeWatched / duration) * 100;
      episode.progress.watched = episode.progress.percentComplete >= 95;
      if (episode.progress.watched && !episode.progress.watchedDate) {
        episode.progress.watchedDate = new Date().toISOString();
      }
      // Persist to localStorage
      this.saveProgress();
    }
  },
  
  saveProgress() {
    const progress = {};
    for (const season of this.seasons) {
      for (const episode of season.episodes) {
        progress[episode.id] = episode.progress;
      }
    }
    localStorage.setItem('techflix_progress', JSON.stringify(progress));
  },
  
  loadProgress() {
    const saved = localStorage.getItem('techflix_progress');
    if (saved) {
      const progress = JSON.parse(saved);
      for (const season of this.seasons) {
        for (const episode of season.episodes) {
          if (progress[episode.id]) {
            episode.progress = { ...episode.progress, ...progress[episode.id] };
          }
        }
      }
    }
  }
}

// Initialize progress from localStorage
ENHANCED_SERIES_DATA.loadProgress();