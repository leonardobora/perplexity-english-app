# EduDash - English Learning Dashboard

[![CI/CD Pipeline](https://github.com/leonardobora/perplexity-english-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/leonardobora/perplexity-english-app/actions/workflows/ci-cd.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://leonardobora.github.io/perplexity-english-app/)

An interactive educational dashboard for English language learning, specifically designed for Brazilian high school students preparing for college entrance exams (ENEM and UFPR). The application combines gamification elements with AI-powered study assistance.

## 🚀 Live Demo

Visit the live application: [https://leonardobora.github.io/perplexity-english-app/](https://leonardobora.github.io/perplexity-english-app/)

## 📋 Features

### 🎓 Dual User Interface
- **Professor Dashboard**: Class management, lesson creation, student progress tracking
- **Student Dashboard**: Personal progress, gamified learning experience, AI study assistant

### 🎮 Gamification System
- Points and level progression
- Daily streak tracking
- Achievement badges
- Class leaderboards
- Visual progress indicators

### 🤖 AI-Powered Features
- Personalized study summaries
- Interactive Q&A assistant
- Content generation for lessons
- Performance analysis and recommendations

### 📱 Modern UI/UX
- Responsive design for all devices
- Dark/light mode support
- Smooth animations and transitions
- Accessible interface

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (with CSS Variables), Vanilla JavaScript
- **Styling**: Modern CSS with Grid and Flexbox
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages
- **Development**: Static file server

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+ (for development tools)
- Modern web browser
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/leonardobora/perplexity-english-app.git
   cd perplexity-english-app
   ```

2. **Install development dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   npm run serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:8000`

### Available Scripts

- `npm start` - Start local server with Python
- `npm run serve` - Start local server with npx serve
- `npm run lint` - Run all linting checks
- `npm run build` - Build for production
- `npm run optimize` - Build and minify assets

## 🏗️ Project Structure

```
perplexity_english_app/
├── index.html              # Main application file
├── app.js                  # Application logic and state management
├── style.css               # Complete styling with CSS variables
├── CLAUDE.md               # Development guide for Claude Code
├── package.json            # Project dependencies and scripts
├── README.md               # This file
├── .gitignore              # Git ignore rules
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # GitHub Actions CI/CD pipeline
└── documentation/
    ├── dashboard-estructura.md
    └── codigo-exemplo.md
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for automated testing and deployment:

### Workflow Steps
1. **Test Phase**
   - HTML validation
   - CSS linting
   - JavaScript syntax checking
   - File structure validation

2. **Build Phase**
   - Asset minification
   - Build artifact creation
   - Version stamping

3. **Deploy Phase**
   - Automatic deployment to GitHub Pages
   - Performance audit with Lighthouse

### Deployment
- **Automatic**: Pushes to `main`/`master` branch trigger deployment
- **Manual**: Can be triggered from GitHub Actions tab
- **Rollback**: Previous versions available in GitHub releases

## 🎯 Educational Focus

### Target Audience
- Brazilian high school students (3rd year)
- Students preparing for ENEM and UFPR exams
- English language learners at intermediate level

### Learning Areas
- **Grammar**: Tenses, sentence structure, syntax
- **Vocabulary**: Academic and exam-specific terminology
- **Reading**: Comprehension strategies and practice
- **Writing**: Essay composition and formal writing
- **Listening**: Audio comprehension exercises

### Pedagogical Approach
- **Microlearning**: 5-10 minute lesson segments
- **Spaced Repetition**: Optimized review scheduling
- **Gamification**: Points, levels, and achievement motivation
- **Personalization**: AI-adapted content based on performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Test your changes across different browsers
- Update documentation as needed
- Ensure accessibility standards are maintained

## 🔧 Configuration

### GitHub Pages Setup
1. Go to repository Settings > Pages
2. Select "Deploy from a branch"
3. Choose "gh-pages" branch (created by Actions)
4. Update URLs in `package.json` and `README.md`

### Environment Variables (for future features)
- `OPENAI_API_KEY`: For AI integration (when implemented)
- `DATABASE_URL`: For backend integration (when implemented)

## 📊 Performance

The application is optimized for:
- Fast loading times (< 2s on 3G)
- Lighthouse scores > 90 in all categories
- Mobile-first responsive design
- Minimal JavaScript bundle size

## 🔐 Security

- Client-side only (no sensitive data exposure)
- Input validation and sanitization
- CSP headers (when deployed)
- No external dependencies in production

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern language learning platforms
- Designed for Brazilian educational system requirements
- Built with accessibility and performance in mind

## 📞 Support

- Create an [issue](https://github.com/leonardobora/perplexity-english-app/issues) for bug reports
- Start a [discussion](https://github.com/leonardobora/perplexity-english-app/discussions) for questions
- Check [GitHub Pages](https://leonardobora.github.io/perplexity-english-app/) for live demo

---

**Note**: Update the GitHub URLs and usernames in this README after creating your repository.