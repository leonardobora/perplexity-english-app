# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an English learning educational dashboard application (EduDash) designed for high school students preparing for Brazilian college entrance exams (ENEM and UFPR). The application combines gamification elements (similar to Duolingo) with AI-powered note-taking features.

## Architecture

This is a client-side single-page application built with:
- **Frontend**: HTML + CSS + JavaScript (vanilla)
- **Structure**: Static files that simulate a complete educational dashboard
- **Data**: Simulated in-memory data (no backend database)

### Core Files
- `index.html`: Main application with complete UI structure for both professor and student dashboards
- `app.js`: Application logic, state management, and interactive features
- `style.css`: Complete styling with CSS variables, responsive design, and dark mode support
- `script.py`: Database schema example and planning scripts

## Key Features

### Dual User Interfaces
1. **Professor Dashboard**: Class management, lesson creation, student progress tracking
2. **Student Dashboard**: Personal progress, lesson access, gamification elements, AI assistant

### Gamification System
- Points and levels progression
- Streak tracking (consecutive study days)
- Badge/achievement system
- Class leaderboards and rankings
- Progress visualization

### AI Features (Simulated)
- Personalized study summaries
- Interactive Q&A assistant
- Content generation for lessons
- Performance analysis and recommendations

## Development Commands

Since this is a static application, development is straightforward:

```bash
# Serve locally (any simple HTTP server)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000

# View application
open http://localhost:8000
```

## Code Architecture

### State Management (`app.js`)
- `dadosApp`: Simulated database with users, classes, lessons, badges
- `estadoApp`: Current application state (logged user, active section)
- Event-driven architecture with comprehensive event listeners

### UI Structure
- Login screen with role selection (professor/student)
- Sidebar navigation with section switching
- Modal dialogs for CRUD operations
- Toast notifications for user feedback
- Responsive grid layouts

### Styling System (`style.css`)
- CSS custom properties for theming
- Dark/light mode support via media queries and data attributes
- Modular component-based styles
- Responsive design with mobile-first approach

## Data Structure

The application simulates a complete database structure with:
- Users (professors and students)
- Classes and enrollments
- Subjects organized by exam relevance (ENEM/UFPR)
- Lessons with difficulty levels and point rewards
- Student progress tracking
- Badge/achievement system
- AI-generated notes and summaries

## Key Functions

### Navigation
- `realizarLogin(tipo)`: Handle user login by role
- `navegarPara(secao)`: Navigate between dashboard sections
- `mostrarTela(telaId)`: Switch between main application screens

### CRUD Operations
- `salvarNovaLicao()`: Create new lessons (simulated)
- `atualizarListaLicoes()`: Refresh lesson displays
- Modal management for create/edit forms

### Gamification
- `simularProgressoLicao()`: Simulate lesson completion with points
- Progress tracking and streak management
- Badge achievement simulation

### AI Integration (Simulated)
- `processarPerguntaIA()`: Handle AI assistant questions
- `gerarResumo()`: Generate study summaries
- Content personalization based on student level

## Educational Content Focus

The application is specifically designed for:
- English language learning
- Brazilian college entrance exam preparation (ENEM, UFPR)
- Grammar, vocabulary, reading, writing, and listening skills
- Adaptive learning with spaced repetition concepts

## Extending the Application

To add new features:
1. Update `dadosApp` structure for new data types
2. Add corresponding UI sections in `index.html`
3. Implement CRUD functions in `app.js`
4. Style new components following existing CSS patterns
5. Add navigation menu items and routing logic

## Technical Notes

- Uses modern JavaScript ES6+ features
- CSS Grid and Flexbox for layouts
- Event delegation for dynamic content
- Simulated asynchronous operations with setTimeout
- Local storage could be added for persistence
- Ready for conversion to a full-stack application with real backend

The codebase demonstrates a complete educational dashboard concept that could be expanded into a production application with proper backend integration, real AI services, and user authentication.