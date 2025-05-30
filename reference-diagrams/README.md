# NRI-Kafka Reference Diagrams

This directory contains comprehensive Mermaid diagrams that visualize the NRI-Kafka architecture and data flows.

## Available Diagrams

### 1. Functional Architecture (`functional-architecture.mmd`)
Shows the complete data flow from configuration through collection modes to New Relic output.

### 2. Domain Model (`domain-model.mmd`)
Illustrates Kafka entities and their mapping to New Relic samples, including JMX MBean relationships.

### 3. Technical Architecture (`technical-architecture.mmd`)
Details the internal component structure, security layers, and deployment patterns.

### 4. Data Flow Sequence (`data-flow-sequence.mmd`)
Step-by-step sequence diagram showing parallel collection and error handling.

### 5. Container Architecture (`container-k8s-architecture.mmd`)
Kubernetes and Docker deployment patterns with security contexts.

### 6. Performance Architecture (`performance-architecture.mmd`)
Optimization patterns, resource management, and scalability strategies.

## How to Use

### Viewing Diagrams
1. Copy the `.mmd` content
2. Paste into:
   - [Mermaid Live Editor](https://mermaid.live)
   - VS Code with Mermaid extension
   - GitHub (renders automatically)

### Customizing Diagrams
Feel free to modify these diagrams for your specific use cases:
- Add your cluster-specific details
- Highlight problem areas
- Document your optimizations

### Integration with Documentation
These diagrams can be embedded in:
- Confluence pages
- GitHub READMEs
- Architecture decision records (ADRs)
- Runbooks and troubleshooting guides

## Quick Reference

### Most Important Diagrams for Learning
1. Start with **Functional Architecture** - understand the flow
2. Study **Domain Model** - know what metrics come from where
3. Review **Technical Architecture** - see how it's built

### For Production Operations
1. **Data Flow Sequence** - troubleshooting guide
2. **Performance Architecture** - optimization reference
3. **Container Architecture** - deployment patterns
