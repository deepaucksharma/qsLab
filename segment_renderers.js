/**
 * Segment Type Renderers for Neural Learn Course Platform
 * Implements all 15+ segment types from the Kafka course
 */

class SegmentRenderers {
    constructor() {
        // Initialize visual asset manager if available
        this.visualAssetManager = window.visualAssetManager || null;
        
        // Map segment types to their render methods
        this.renderers = {
            // Opening & Introduction Types
            'course_opening': this.renderCourseOpening.bind(this),
            'instructor_introduction': this.renderInstructorIntroduction.bind(this),
            'episode_opening': this.renderEpisodeOpening.bind(this),
            
            // Explanation & Context Types
            'concept_explanation': this.renderConceptExplanation.bind(this),
            'historical_context': this.renderHistoricalContext.bind(this),
            'origin_story': this.renderOriginStory.bind(this),
            'problem_recap': this.renderProblemRecap.bind(this),
            'paradigm_shift': this.renderParadigmShift.bind(this),
            
            // Technical & Code Types
            'technical_introduction': this.renderTechnicalIntroduction.bind(this),
            'code_walkthrough': this.renderCodeWalkthrough.bind(this),
            'architecture_design': this.renderArchitectureDesign.bind(this),
            'practical_example': this.renderPracticalExample.bind(this),
            'practical_configuration': this.renderPracticalConfiguration.bind(this),
            
            // Metric & Data Types
            'metric_deep_dive': this.renderMetricDeepDive.bind(this),
            'new_metric_deep_dive': this.renderNewMetricDeepDive.bind(this),
            'metrics_overview': this.renderMetricsOverview.bind(this),
            'metric_taxonomy': this.renderMetricTaxonomy.bind(this),
            
            // Feature & Concept Types
            'feature_introduction': this.renderFeatureIntroduction.bind(this),
            'new_feature_highlight': this.renderNewFeatureHighlight.bind(this),
            'new_feature_discovery': this.renderNewFeatureDiscovery.bind(this),
            'concept_introduction': this.renderConceptIntroduction.bind(this),
            'scalability_concept': this.renderScalabilityConcept.bind(this),
            'immutability_concept': this.renderImmutabilityConcept.bind(this),
            
            // Comparison & Decision Types
            'technology_comparison': this.renderTechnologyComparison.bind(this),
            'decision_framework': this.renderDecisionFramework.bind(this),
            
            // UI & Schema Types
            'ui_walkthrough': this.renderUIWalkthrough.bind(this),
            'schema_introduction': this.renderSchemaIntroduction.bind(this),
            'advanced_customization': this.renderAdvancedCustomization.bind(this),
            
            // Default fallback
            'default': this.renderDefault.bind(this)
        };
    }
    
    render(segment) {
        const renderer = this.renderers[segment.segmentType] || this.renderers.default;
        return renderer(segment);
    }
    
    // Common header for all segments
    renderHeader(segment) {
        const typeLabel = segment.segmentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
            <div class="segment-header">
                <span class="segment-type-badge" data-type="${segment.segmentType}">
                    ${this.getSegmentIcon(segment.segmentType)} ${typeLabel}
                </span>
                ${segment.title ? `<h3 class="segment-title">${segment.title}</h3>` : ''}
                ${this.renderLearningObjectives(segment.learningObjectives)}
                ${this.renderEstimatedDuration(segment.estimatedDuration)}
            </div>
        `;
    }
    
    renderLearningObjectives(objectives) {
        if (!objectives || objectives.length === 0) return '';
        return `
            <ul class="learning-objectives">
                ${objectives.map(obj => `<li><i class="fas fa-check-circle"></i> ${obj}</li>`).join('')}
            </ul>
        `;
    }
    
    renderEstimatedDuration(duration) {
        if (!duration) return '';
        return `<div class="segment-duration"><i class="far fa-clock"></i> ${duration}</div>`;
    }
    
    renderKeywords(keywords) {
        if (!keywords || keywords.length === 0) return '';
        return `
            <div class="segment-keywords">
                ${keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
            </div>
        `;
    }
    
    renderPoints(points) {
        if (!points) return '';
        return `
            <div class="segment-points">
                <i class="fas fa-star"></i> ${points} points
            </div>
        `;
    }
    
    renderVisualAssets(segment) {
        if (!this.visualAssetManager) return '';
        
        const visuals = [];
        
        // Check for visual references in mediaRefs
        if (segment.mediaRefs && segment.mediaRefs.visualIds && segment.mediaRefs.visualIds.length > 0) {
            segment.mediaRefs.visualIds.forEach(visualId => {
                const placeholder = this.visualAssetManager.createPlaceholder(visualId, {
                    width: '100%',
                    height: '400px'
                });
                visuals.push(`<div class="segment-visual segment-visual-center">${placeholder.outerHTML}</div>`);
            });
        }
        
        // Check for inline diagram
        if (segment.diagram) {
            const diagramId = segment.diagram.id || `diagram-${segment.id}`;
            const placeholder = this.visualAssetManager.createPlaceholder(diagramId, {
                width: '100%',
                height: segment.diagram.height || '350px'
            });
            visuals.push(`<div class="segment-visual segment-visual-center">${placeholder.outerHTML}</div>`);
        }
        
        return visuals.join('\n');
    }
    
    getSegmentIcon(type) {
        const icons = {
            'course_opening': 'fas fa-rocket',
            'instructor_introduction': 'fas fa-user-tie',
            'concept_explanation': 'fas fa-lightbulb',
            'historical_context': 'fas fa-history',
            'technical_introduction': 'fas fa-cogs',
            'code_walkthrough': 'fas fa-code',
            'metric_deep_dive': 'fas fa-chart-line',
            'feature_introduction': 'fas fa-sparkles',
            'technology_comparison': 'fas fa-balance-scale',
            'ui_walkthrough': 'fas fa-desktop',
            'default': 'fas fa-book'
        };
        return `<i class="${icons[type] || icons.default}"></i>`;
    }
    
    // === Opening & Introduction Types ===
    
    renderCourseOpening(segment) {
        return `
            <div class="segment course-opening-segment animated-entrance">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="welcome-animation">
                        <div class="animated-logo">
                            <i class="fas fa-graduation-cap fa-4x"></i>
                        </div>
                        <h2 class="welcome-message">Welcome to Your Learning Journey!</h2>
                    </div>
                    <div class="content-text">${segment.textContent}</div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderInstructorIntroduction(segment) {
        return `
            <div class="segment instructor-intro-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="instructor-profile">
                        <div class="instructor-avatar">
                            <i class="fas fa-user-tie fa-3x"></i>
                        </div>
                        <div class="instructor-bio">
                            <h4>Your Instructor</h4>
                            <p>${segment.textContent}</p>
                        </div>
                    </div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderEpisodeOpening(segment) {
        return `
            <div class="segment episode-opening-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="episode-intro">
                        <i class="fas fa-play-circle fa-2x"></i>
                        <p class="intro-text">${segment.textContent}</p>
                    </div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    // === Explanation & Context Types ===
    
    renderConceptExplanation(segment) {
        return `
            <div class="segment concept-explanation-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    ${this.renderVisualAssets(segment)}
                    ${!segment.mediaRefs && !segment.diagram ? `
                        <div class="concept-visual">
                            <i class="fas fa-lightbulb fa-2x"></i>
                        </div>
                    ` : ''}
                    <div class="explanation-text">${segment.textContent}</div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderHistoricalContext(segment) {
        return `
            <div class="segment historical-context-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="timeline-container">
                        <div class="timeline-marker">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="timeline-content">
                            <p>${segment.textContent}</p>
                        </div>
                    </div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderOriginStory(segment) {
        return `
            <div class="segment origin-story-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="story-container">
                        <div class="story-icon">
                            <i class="fas fa-book-open fa-2x"></i>
                        </div>
                        <div class="story-text">${segment.textContent}</div>
                    </div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderProblemRecap(segment) {
        return `
            <div class="segment problem-recap-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="problem-highlight">
                        <i class="fas fa-exclamation-triangle fa-2x"></i>
                        <h4>Problem Summary</h4>
                    </div>
                    <div class="recap-text">${segment.textContent}</div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderParadigmShift(segment) {
        return `
            <div class="segment paradigm-shift-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="shift-visualization">
                        <div class="old-paradigm">
                            <i class="fas fa-times-circle"></i>
                            <span>Old Way</span>
                        </div>
                        <div class="arrow">
                            <i class="fas fa-arrow-right fa-2x"></i>
                        </div>
                        <div class="new-paradigm">
                            <i class="fas fa-check-circle"></i>
                            <span>New Way</span>
                        </div>
                    </div>
                    <p class="shift-explanation">${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    // === Technical & Code Types ===
    
    renderTechnicalIntroduction(segment) {
        return `
            <div class="segment technical-intro-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="tech-diagram">
                        <i class="fas fa-cogs fa-3x"></i>
                    </div>
                    <div class="technical-content">${segment.textContent}</div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderCodeWalkthrough(segment) {
        const codeExample = segment.codeExample || {};
        return `
            <div class="segment code-walkthrough-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="walkthrough-intro">${segment.textContent}</div>
                    ${codeExample.snippet ? this.renderCodeBlock(codeExample) : ''}
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderCodeBlock(codeExample) {
        const highlightLines = codeExample.highlightLines || [];
        const language = codeExample.language || 'javascript';
        
        return `
            <div class="code-block-container">
                <div class="code-header">
                    <span class="code-language">${language}</span>
                    <button class="copy-code-btn" onclick="copyCodeToClipboard(this)">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <pre class="code-block" data-highlight="${highlightLines.join(',')}">
                    <code class="language-${language}">${this.escapeHtml(codeExample.snippet)}</code>
                </pre>
                ${codeExample.animateTyping ? '<div class="typing-indicator">Typing animation enabled</div>' : ''}
            </div>
        `;
    }
    
    renderArchitectureDesign(segment) {
        return `
            <div class="segment architecture-design-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    ${this.renderVisualAssets(segment)}
                    ${!segment.mediaRefs && !segment.diagram ? `
                        <div class="architecture-diagram">
                            <i class="fas fa-project-diagram fa-3x"></i>
                            <p class="diagram-placeholder">Architecture Diagram</p>
                        </div>
                    ` : ''}
                    <div class="design-explanation">${segment.textContent}</div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderPracticalExample(segment) {
        const codeExample = segment.codeExample || null;
        return `
            <div class="segment practical-example-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="example-intro">
                        <i class="fas fa-hands-on fa-2x"></i>
                        <h4>Hands-On Example</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${codeExample ? this.renderCodeBlock(codeExample) : ''}
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderPracticalConfiguration(segment) {
        const codeExample = segment.codeExample || null;
        return `
            <div class="segment practical-config-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="config-header">
                        <i class="fas fa-sliders-h"></i>
                        <h4>Configuration Guide</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${codeExample ? this.renderCodeBlock(codeExample) : ''}
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    // === Metric & Data Types ===
    
    renderMetricDeepDive(segment) {
        return `
            <div class="segment metric-deep-dive-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    ${this.renderVisualAssets(segment)}
                    ${!segment.mediaRefs && !segment.diagram ? `
                        <div class="metric-visualization">
                            <i class="fas fa-chart-line fa-3x"></i>
                            <div class="metric-placeholder">Metric Chart Placeholder</div>
                        </div>
                    ` : ''}
                    <div class="metric-explanation">${segment.textContent}</div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderNewMetricDeepDive(segment) {
        return `
            <div class="segment new-metric-deep-dive-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="new-metric-badge">
                        <span class="badge-new">NEW</span>
                    </div>
                    <div class="metric-info">
                        <i class="fas fa-chart-area fa-2x"></i>
                        <h4>New Metric Analysis</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderMetricsOverview(segment) {
        return `
            <div class="segment metrics-overview-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Performance</span>
                        </div>
                        <div class="metric-card">
                            <i class="fas fa-heartbeat"></i>
                            <span>Health</span>
                        </div>
                        <div class="metric-card">
                            <i class="fas fa-chart-bar"></i>
                            <span>Usage</span>
                        </div>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderMetricTaxonomy(segment) {
        return `
            <div class="segment metric-taxonomy-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="taxonomy-tree">
                        <i class="fas fa-sitemap fa-2x"></i>
                        <h4>Metric Categories</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    // === Feature & Concept Types ===
    
    renderFeatureIntroduction(segment) {
        return `
            <div class="segment feature-intro-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="feature-highlight">
                        <i class="fas fa-sparkles fa-2x"></i>
                        <h4>Introducing New Feature</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderNewFeatureHighlight(segment) {
        return `
            <div class="segment new-feature-highlight-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="feature-banner">
                        <span class="badge-new">NEW</span>
                        <i class="fas fa-star fa-2x"></i>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderNewFeatureDiscovery(segment) {
        return `
            <div class="segment new-feature-discovery-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="discovery-prompt">
                        <i class="fas fa-search fa-2x"></i>
                        <h4>Discover New Capabilities</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderConceptIntroduction(segment) {
        return `
            <div class="segment concept-intro-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="concept-icon">
                        <i class="fas fa-brain fa-2x"></i>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderScalabilityConcept(segment) {
        return `
            <div class="segment scalability-concept-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="scalability-visual">
                        <i class="fas fa-expand-arrows-alt fa-2x"></i>
                        <h4>Scaling Principles</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderImmutabilityConcept(segment) {
        return `
            <div class="segment immutability-concept-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="immutable-visual">
                        <i class="fas fa-lock fa-2x"></i>
                        <h4>Immutability Explained</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    // === Comparison & Decision Types ===
    
    renderTechnologyComparison(segment) {
        return `
            <div class="segment tech-comparison-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="comparison-header">
                        <i class="fas fa-balance-scale fa-2x"></i>
                        <h4>Technology Comparison</h4>
                    </div>
                    <div class="comparison-content">
                        <p>${segment.textContent}</p>
                    </div>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderDecisionFramework(segment) {
        return `
            <div class="segment decision-framework-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="framework-header">
                        <i class="fas fa-route fa-2x"></i>
                        <h4>Decision Framework</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    // === UI & Schema Types ===
    
    renderUIWalkthrough(segment) {
        return `
            <div class="segment ui-walkthrough-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    ${this.renderVisualAssets(segment)}
                    ${!segment.mediaRefs && !segment.diagram ? `
                        <div class="ui-preview">
                            <i class="fas fa-desktop fa-2x"></i>
                            <h4>UI Walkthrough</h4>
                        </div>
                    ` : ''}
                    <p>${segment.textContent}</p>
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderSchemaIntroduction(segment) {
        return `
            <div class="segment schema-intro-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="schema-icon">
                        <i class="fas fa-database fa-2x"></i>
                        <h4>Schema Overview</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${segment.codeExample ? this.renderCodeBlock(segment.codeExample) : ''}
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderAdvancedCustomization(segment) {
        return `
            <div class="segment advanced-custom-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <div class="custom-header">
                        <i class="fas fa-tools fa-2x"></i>
                        <h4>Advanced Customization</h4>
                    </div>
                    <p>${segment.textContent}</p>
                    ${segment.dashboardExample ? this.renderDashboardExample(segment.dashboardExample) : ''}
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    renderDashboardExample(dashboardExample) {
        if (!dashboardExample.widgets) return '';
        
        return `
            <div class="dashboard-example">
                <h5>Example Dashboard Configuration</h5>
                <div class="dashboard-widgets">
                    ${dashboardExample.widgets.map(widget => `
                        <div class="widget-card">
                            <h6>${widget.title}</h6>
                            <p class="widget-type">${widget.type}</p>
                            ${widget.query1 ? `<code class="widget-query">${widget.query1}</code>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // === Default Renderer ===
    
    renderDefault(segment) {
        return `
            <div class="segment default-segment">
                ${this.renderHeader(segment)}
                <div class="segment-content">
                    <p>${segment.textContent}</p>
                    ${segment.codeExample ? this.renderCodeBlock(segment.codeExample) : ''}
                    ${this.renderKeywords(segment.keywords)}
                </div>
                ${this.renderPoints(segment.pointsAwarded)}
            </div>
        `;
    }
    
    // Utility method
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in main script
window.SegmentRenderers = SegmentRenderers;