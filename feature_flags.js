// Feature flags for Neural Learn Platform
const FEATURES = {
    // Interactive features
    NEW_INTERACTIONS: true,
    ENHANCED_DRAG_DROP: true,
    HAPTIC_FEEDBACK: true,
    SOUND_EFFECTS: true,
    PARTICLE_EFFECTS: true,
    
    // Analytics features
    ANALYTICS_DASHBOARD: true,
    ADVANCED_RECOMMENDATIONS: false,
    LEARNING_INSIGHTS: true,
    
    // UI features
    DARK_MODE: true,
    ENHANCED_NAVIGATION: true,
    KEYBOARD_SHORTCUTS: true,
    PROGRESS_DASHBOARD: true,
    
    // Performance features
    SERVICE_WORKER: false, // Disabled due to port mismatch
    ASSET_PRELOADING: true,
    LAZY_LOADING: true,
    PERFORMANCE_MODE: true,
    SKELETON_LOADERS: true,
    ACCESSIBILITY: true,
    OFFLINE_SUPPORT: false, // Ready but not enabled
    
    // Content features
    MULTIPLE_COURSES: true,
    ADAPTIVE_LEARNING: false, // Disabled for now
    SPACED_REPETITION: false
};

// Export for use in other modules
window.FEATURES = FEATURES;