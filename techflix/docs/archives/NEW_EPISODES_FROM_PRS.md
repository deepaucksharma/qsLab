# New Episodes from Open PRs

## Episodes NOT in Our Current Solution:

### 1. **Data Ingestion Paths Episode** (PR #10)
- Topic: Flex ingestion, NRQL demo, nri-kafka reminder
- Key Features:
  - Raw Prometheus metrics ingestion
  - NRQL querying demonstrations
  - Module recap functionality

### 2. **Key Shifts Critical Metrics Episode** (PR #6)
- **Unique Implementation Features:**
  ```javascript
  // Animated metric counters
  const animatedValue = Math.floor(progress * targetValue / 100);
  
  // Progressive reveal patterns
  const opacity = Math.min(progress / 20, 1);
  const transform = `translateY(${Math.max(0, 20 - progress / 5)}px)`;
  ```
- Scenes:
  - TradeOffsScene
  - MetricSpotlightScene
  - ZeroLagFallacyScene
  - ModuleRecapScene

### 3. **Kafka Evolution Limits Episode** (PR #4)
- Features:
  - SkipInteractive component
  - Placeholder scenes with framer-motion
  - Evolution timeline visualization

## Key Implementation Patterns to Adopt:

### 1. **Time-Based Animations**
```javascript
// From PR #6
const progress = (time / duration) * 100;
const revealElements = progress > threshold;
```

### 2. **Interactive Metric Display**
```javascript
// Animated counters
<div className="text-6xl font-bold text-white">
  {Math.floor(progress * metricValue / 100)}ms
</div>
```

### 3. **Progressive Content Reveal**
```javascript
// Staggered list animations
{items.map((item, index) => (
  <li 
    style={{
      opacity: progress > (index * 10) ? 1 : 0,
      transform: `translateX(${progress > (index * 10) ? 0 : -20}px)`
    }}
  >
    {item}
  </li>
))}
```

### 4. **Module Recap Pattern**
- Summary bullets with animations
- Key takeaways highlighted
- Progress tracking

## Implementation Priority:

1. **High Priority**: Key Shifts Critical Metrics (has unique animations)
2. **Medium Priority**: Data Ingestion Paths (practical demos)
3. **Low Priority**: Kafka Evolution Limits (mostly placeholders)

## Next Steps:

1. Implement the animated metric counter pattern
2. Add progressive reveal animations to existing episodes
3. Create module recap components
4. Add time-based scene progression

These episodes add significant interactive and educational value beyond our current implementation.