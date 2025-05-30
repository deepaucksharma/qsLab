# Kafka Observability Mastery Lab - Learning App

An interactive web application for learning Kafka observability with New Relic through hands-on exercises and real-world scenarios.

## 📚 Implementation Documentation

For detailed implementation documentation, see the [Track Documentation](../docs/tracks/README.md):

- **[Master Implementation Plan](../docs/tracks/MASTER_IMPLEMENTATION_PLAN.md)** - Complete 4-track development strategy
- **[Track Alignment Plan](../docs/tracks/TRACKS_ALIGNMENT_PLAN.md)** - Integration and coordination strategy
- **[Consolidated Status Report](../docs/tracks/CONSOLIDATED_STATUS_REPORT.md)** - Current progress across all tracks
- **[Visual Architecture Overview](../docs/tracks/VISUAL_ARCHITECTURE_OVERVIEW.md)** - System diagrams and data flows

### Track-Specific Documentation:
- **Track 1**: [Frontend Development](../docs/tracks/track1-frontend/)
- **Track 2**: [Backend & Terminal](../docs/tracks/track2-backend/) - ✅ Implemented
- **Track 3**: [Content & Documentation](../docs/tracks/track3-content/)
- **Track 4**: [Infrastructure & DevOps](../docs/tracks/track4-infrastructure/)

## Features

### 📚 Comprehensive Learning Path
- **5-Week Journey**: From basics to advanced platform architecture
- **Progressive Difficulty**: Each week builds on previous knowledge
- **Hands-On Exercises**: Real code and commands you can execute
- **Interactive Elements**: Simulators, calculators, and live examples

### 🎯 Key Features
- **Progress Tracking**: Automatic saving of your learning progress
- **Interactive JMX Terminal**: Practice JMX commands in a simulated environment
- **Code Playground**: Test commands and queries with instant feedback
- **Completion Checklist**: Track objectives for each week
- **Mobile Responsive**: Learn on any device

### 🛠️ Technical Features
- **Offline Support**: Continue learning without internet
- **Local Storage**: Progress saved automatically
- **No Backend Required**: Runs entirely in the browser
- **Modern UI**: Clean, intuitive interface

## Getting Started

### Option 1: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/qsLab.git
cd qsLab/learning-app

# Open in browser
open index.html
# Or use a local server
python -m http.server 8000
# Visit http://localhost:8000
```

### Option 2: Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings > Pages
3. Select "Deploy from branch" and choose main branch
4. Your app will be available at `https://yourusername.github.io/qsLab/learning-app/`

### Option 3: Deploy to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/qsLab)

## Usage Guide

### Navigation
- Use the sidebar to navigate between sections
- Track your progress with the progress bar
- Check off objectives as you complete them

### Interactive Elements

#### JMX Terminal Simulator
Practice JMX commands:
```
open localhost:9999
domains
domain kafka.server
beans
get Count
```

#### Rate Calculator
Calculate message rates from counter values:
- Enter two counter values
- Specify time interval
- Get instant rate calculation

#### Code Playground
Test different types of code:
- Bash commands
- YAML configurations
- Go code
- Java snippets
- NRQL queries

### Progress Tracking
- Automatic save to browser storage
- Visual progress indicators
- Week-by-week completion tracking
- Overall course progress

## Customization

### Adding New Content
1. Edit `index.html` to add new sections
2. Update navigation in the sidebar
3. Add corresponding styles in `styles.css`
4. Update JavaScript logic in `app.js`

### Theming
Customize colors in `styles.css`:
```css
:root {
    --primary-color: #1a73e8;
    --secondary-color: #34a853;
    --accent-color: #ea4335;
    --warning-color: #fbbc04;
}
```

### Adding Exercises
Create new exercise sections:
```html
<div class="exercise-container">
    <h2>Exercise Title</h2>
    <div class="exercise-content">
        <!-- Your exercise content -->
    </div>
</div>
```

## Architecture

```
learning-app/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── app.js          # Interactive functionality
└── README.md       # This file
```

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Vanilla JS for interactivity
- **Prism.js**: Syntax highlighting
- **Font Awesome**: Icons
- **Local Storage**: Progress persistence

## Future Enhancements

### Planned Features
- [ ] Real terminal integration
- [ ] Live Kafka environment connection
- [ ] Video tutorials
- [ ] Collaborative features
- [ ] Backend API for progress sync
- [ ] Certificate generation
- [ ] Dark mode theme
- [ ] More interactive simulations

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
MIT License - Feel free to use and modify for your learning needs!

## Support
- Create an issue for bugs or features
- Join our community discussions
- Share your learning journey!

---

**Happy Learning! 🚀**

Transform from a Kafka map-reader to a map-maker with this interactive learning experience!