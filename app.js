// EduDash - Real Functional System
// Complete rewrite with real data persistence and AI integration

// Data Architecture - Real persistent storage
class DataManager {
  constructor() {
    this.storageKey = 'edudash_data';
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    
    if (!existingData) {
      // Blank slate - no pre-populated data
      this.data = {
        meta: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          lastBackup: null
        },
        users: {
          professors: [],
          students: []
        },
        classes: [],
        lessons: [],
        assignments: [],
        progress: [],
        settings: {
          aiProviders: {
            openai: { apiKey: '', model: 'gpt-4o-mini', enabled: false },
            anthropic: { apiKey: '', model: 'claude-3-sonnet-20240229', enabled: false },
            google: { apiKey: '', model: 'gemini-pro', enabled: false },
            perplexity: { apiKey: '', model: 'llama-3-sonar-large-32k-online', enabled: false }
          },
          defaultProvider: 'openai',
          theme: 'auto',
          language: 'pt-BR'
        }
      };
      this.save();
    } else {
      this.data = JSON.parse(existingData);
      this.migrateData(); // Handle version updates
    }
  }

  migrateData() {
    // Handle data migrations for version updates
    if (!this.data.meta) {
      this.data.meta = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastBackup: null
      };
    }
    this.save();
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  backup() {
    const backup = {
      ...this.data,
      meta: {
        ...this.data.meta,
        lastBackup: new Date().toISOString()
      }
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edudash_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  restore(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const restoredData = JSON.parse(e.target.result);
        this.data = restoredData;
        this.save();
        location.reload(); // Refresh to apply restored data
      } catch (error) {
        throw new Error('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  }

  // CRUD Operations
  create(collection, item) {
    const id = this.generateId();
    const newItem = {
      id,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  read(collection, id = null) {
    if (id) {
      return this.data[collection].find(item => item.id === id) || null;
    }
    return [...this.data[collection]];
  }

  update(collection, id, updates) {
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data[collection].splice(index, 1);
    this.save();
    return true;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Advanced queries
  query(collection, filters = {}) {
    let results = [...this.data[collection]];
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        results = results.filter(item => {
          if (typeof filters[key] === 'object' && filters[key].includes) {
            return filters[key].includes(item[key]);
          }
          return item[key] === filters[key];
        });
      }
    });
    
    return results;
  }
}

// AI Provider Integration
class AIManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.rateLimits = new Map();
  }

  async makeRequest(provider, prompt, options = {}) {
    if (!this.canMakeRequest(provider)) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    const settings = this.dataManager.data.settings.aiProviders[provider];
    if (!settings.enabled || !settings.apiKey) {
      throw new Error(`${provider} is not configured or enabled.`);
    }

    this.updateRateLimit(provider);

    try {
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(prompt, options);
        case 'anthropic':
          return await this.callAnthropic(prompt, options);
        case 'google':
          return await this.callGoogle(prompt, options);
        case 'perplexity':
          return await this.callPerplexity(prompt, options);
        default:
          throw new Error(`Unknown AI provider: ${provider}`);
      }
    } catch (error) {
      console.error(`AI request failed for ${provider}:`, error);
      throw error;
    }
  }

  async callOpenAI(prompt, options = {}) {
    const settings = this.dataManager.data.settings.aiProviders.openai;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: 'system',
            content: 'You are an English language tutor specialized in helping Brazilian students prepare for ENEM and UFPR entrance exams. Provide clear, educational responses in Portuguese.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(prompt, options = {}) {
    const settings = this.dataManager.data.settings.aiProviders.anthropic;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': settings.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: options.maxTokens || 500,
        messages: [{
          role: 'user',
          content: `As an English language tutor for Brazilian students preparing for ENEM and UFPR: ${prompt}`
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API request failed');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callGoogle(prompt, options = {}) {
    const settings = this.dataManager.data.settings.aiProviders.google;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `As an English tutor for Brazilian ENEM/UFPR students: ${prompt}`
          }]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Google AI API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callPerplexity(prompt, options = {}) {
    const settings = this.dataManager.data.settings.aiProviders.perplexity;
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          {
            role: 'system',
            content: 'You are an English language tutor for Brazilian students preparing for ENEM and UFPR entrance exams.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Perplexity API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  canMakeRequest(provider) {
    const lastRequest = this.rateLimits.get(provider);
    const now = Date.now();
    const cooldown = 5000; // 5 seconds between requests
    
    return !lastRequest || (now - lastRequest) > cooldown;
  }

  updateRateLimit(provider) {
    this.rateLimits.set(provider, Date.now());
  }
}

// User Management System
class UserManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentUser = null;
    this.currentUserType = null;
  }

  createProfessor(userData) {
    const professor = {
      ...userData,
      type: 'professor',
      classesOwned: [],
      lessonsCreated: [],
      stats: {
        totalClasses: 0,
        totalStudents: 0,
        totalLessons: 0
      }
    };
    
    return this.dataManager.create('users', professor);
  }

  createStudent(userData) {
    const student = {
      ...userData,
      type: 'student',
      classesEnrolled: [],
      progress: {
        totalPoints: 0,
        currentLevel: 1,
        streak: 0,
        lastActivity: null,
        badges: []
      },
      stats: {
        lessonsCompleted: 0,
        averageScore: 0,
        timeSpent: 0
      }
    };
    
    return this.dataManager.create('users', student);
  }

  login(email, userType) {
    const users = this.dataManager.query('users', { email, type: userType });
    
    if (users.length === 0) {
      throw new Error('User not found');
    }
    
    this.currentUser = users[0];
    this.currentUserType = userType;
    
    // Update last login
    this.dataManager.update('users', this.currentUser.id, {
      lastLogin: new Date().toISOString()
    });
    
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.currentUserType = null;
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateProfile(updates) {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }
    
    return this.dataManager.update('users', this.currentUser.id, updates);
  }
}

// Progress Tracking System
class ProgressManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
  }

  recordLessonCompletion(userId, lessonId, score, timeSpent) {
    const lesson = this.dataManager.read('lessons', lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const progress = {
      userId,
      lessonId,
      score,
      timeSpent,
      pointsEarned: this.calculatePoints(lesson, score),
      completedAt: new Date().toISOString()
    };

    const progressRecord = this.dataManager.create('progress', progress);
    this.updateUserStats(userId, progressRecord);
    this.checkBadges(userId);
    
    return progressRecord;
  }

  calculatePoints(lesson, score) {
    const basePoints = lesson.basePoints || 10;
    const multiplier = score / 100; // Score as percentage
    const difficultyBonus = {
      'easy': 1,
      'medium': 1.2,
      'hard': 1.5
    }[lesson.difficulty] || 1;
    
    return Math.round(basePoints * multiplier * difficultyBonus);
  }

  updateUserStats(userId, progressRecord) {
    const user = this.dataManager.read('users', userId);
    if (!user) return;

    const newProgress = {
      ...user.progress,
      totalPoints: user.progress.totalPoints + progressRecord.pointsEarned,
      lastActivity: new Date().toISOString()
    };

    // Update level based on points
    newProgress.currentLevel = this.calculateLevel(newProgress.totalPoints);
    
    // Update streak
    newProgress.streak = this.calculateStreak(userId);

    // Update lesson completion count
    const userLessons = this.dataManager.query('progress', { userId });
    user.stats.lessonsCompleted = userLessons.length;

    this.dataManager.update('users', userId, {
      progress: newProgress,
      stats: user.stats
    });
  }

  calculateLevel(totalPoints) {
    // Level formula: level = floor(sqrt(points / 100)) + 1
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  calculateStreak(userId) {
    const userProgress = this.dataManager.query('progress', { userId })
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (userProgress.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const record of userProgress) {
      const recordDate = new Date(record.completedAt);
      recordDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  checkBadges(userId) {
    const user = this.dataManager.read('users', userId);
    const userProgress = this.dataManager.query('progress', { userId });
    
    const badges = [
      {
        id: 'first_lesson',
        name: 'First Step',
        description: 'Complete sua primeira lição',
        icon: '🥇',
        condition: () => userProgress.length >= 1
      },
      {
        id: 'streak_7',
        name: 'Streak Champion',
        description: '7 dias consecutivos',
        icon: '🔥',
        condition: () => user.progress.streak >= 7
      },
      {
        id: 'level_5',
        name: 'Level Master',
        description: 'Alcance o nível 5',
        icon: '⭐',
        condition: () => user.progress.currentLevel >= 5
      },
      {
        id: 'points_1000',
        name: 'Point Collector',
        description: '1000 pontos totais',
        icon: '💎',
        condition: () => user.progress.totalPoints >= 1000
      }
    ];

    const newBadges = badges.filter(badge => 
      !user.progress.badges.includes(badge.id) && badge.condition()
    );

    if (newBadges.length > 0) {
      const updatedBadges = [...user.progress.badges, ...newBadges.map(b => b.id)];
      this.dataManager.update('users', userId, {
        progress: {
          ...user.progress,
          badges: updatedBadges
        }
      });

      // Show badge notification
      newBadges.forEach(badge => {
        this.showBadgeNotification(badge);
      });
    }
  }

  showBadgeNotification(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
      <div class="badge-notification__content">
        <div class="badge-notification__icon">${badge.icon}</div>
        <div class="badge-notification__text">
          <strong>Nova Badge!</strong><br>
          ${badge.name}: ${badge.description}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
}

// Initialize the real system
const dataManager = new DataManager();
const aiManager = new AIManager(dataManager);
const userManager = new UserManager(dataManager);
const progressManager = new ProgressManager(dataManager);

// Application state
let appState = {
  currentScreen: 'login',
  currentSection: null,
  isLoading: false
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeRealApp();
});

function initializeRealApp() {
  setupEventListeners();
  checkExistingSession();
  setupInitialScreen();
}

function setupEventListeners() {
  // Login system
  const loginCards = document.querySelectorAll('.login-card');
  loginCards.forEach(card => {
    card.addEventListener('click', function() {
      const role = this.dataset.role;
      showUserSelectionModal(role);
    });
  });

  // Logout buttons
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('logout-btn-aluno')?.addEventListener('click', logout);

  // Navigation
  setupNavigation();
  
  // Modals and forms
  setupModalsAndForms();
}

function checkExistingSession() {
  // Check if user was previously logged in (session storage)
  const savedSession = sessionStorage.getItem('edudash_session');
  if (savedSession) {
    const session = JSON.parse(savedSession);
    try {
      userManager.login(session.email, session.userType);
      showDashboard(session.userType);
    } catch (error) {
      sessionStorage.removeItem('edudash_session');
    }
  }
}

function setupInitialScreen() {
  const users = dataManager.read('users');
  
  if (users.length === 0) {
    // Show first-time setup
    showFirstTimeSetup();
  } else {
    // Show login screen
    showScreen('login-screen');
  }
}

function showFirstTimeSetup() {
  // Create a welcome modal for first-time users
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎉 Bem-vindo ao EduDash!</h2>
      </div>
      <div class="modal-body">
        <p>Este é seu primeiro acesso. Vamos configurar sua conta!</p>
        <p>Comece criando um perfil de professor ou aluno.</p>
        <div class="first-time-actions">
          <button class="btn btn--primary" onclick="showCreateUserModal('professor')">
            👩‍🏫 Criar Perfil de Professor
          </button>
          <button class="btn btn--secondary" onclick="showCreateUserModal('student')">
            🎓 Criar Perfil de Aluno
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

console.log('🚀 EduDash Real System Loaded!');
console.log('📊 Data Manager:', dataManager);
console.log('🤖 AI Manager:', aiManager);
console.log('👤 User Manager:', userManager);
console.log('📈 Progress Manager:', progressManager);// EduDash Real System - UI Components and User Interface
// Part 2: Complete UI functionality for the real system

// UI Management Functions
function showScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));

  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    appState.currentScreen = screenId;
  }
}

function showUserSelectionModal(userType) {
  const users = dataManager.query('users', { type: userType });
  
  if (users.length === 0) {
    showCreateUserModal(userType);
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${userType === 'professor' ? '👩‍🏫 Selecionar Professor' : '🎓 Selecionar Aluno'}</h2>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">
        <div class="user-selection-list">
          ${users.map(user => `
            <div class="user-selection-item" onclick="loginAsUser('${user.id}', '${userType}')">
              <div class="user-avatar">${userType === 'professor' ? '👩‍🏫' : '🎓'}</div>
              <div class="user-info">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
                ${user.lastLogin ? `<small>Último acesso: ${formatDate(user.lastLogin)}</small>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="modal-actions">
          <button class="btn btn--outline" onclick="showCreateUserModal('${userType}')">
            ➕ Criar Novo ${userType === 'professor' ? 'Professor' : 'Aluno'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function showCreateUserModal(userType) {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${userType === 'professor' ? '👩‍🏫 Novo Professor' : '🎓 Novo Aluno'}</h2>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">
        <form id="create-user-form">
          <div class="form-group">
            <label class="form-label">Nome Completo</label>
            <input type="text" name="name" class="form-control" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" name="email" class="form-control" required>
          </div>
          ${userType === 'professor' ? `
            <div class="form-group">
              <label class="form-label">Instituição</label>
              <input type="text" name="institution" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Especialização</label>
              <select name="specialization" class="form-control">
                <option value="english-general">Inglês Geral</option>
                <option value="english-enem">Inglês ENEM</option>
                <option value="english-ufpr">Inglês UFPR</option>
                <option value="english-advanced">Inglês Avançado</option>
              </select>
            </div>
          ` : `
            <div class="form-group">
              <label class="form-label">Série/Ano</label>
              <select name="grade" class="form-control">
                <option value="1ano">1º Ano</option>
                <option value="2ano">2º Ano</option>
                <option value="3ano">3º Ano</option>
                <option value="cursinho">Cursinho</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Objetivo</label>
              <select name="goal" class="form-control">
                <option value="enem">ENEM</option>
                <option value="ufpr">UFPR</option>
                <option value="both">Ambos</option>
                <option value="general">Aprimoramento Geral</option>
              </select>
            </div>
          `}
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn--outline" onclick="closeModal(this)">Cancelar</button>
        <button class="btn btn--primary" onclick="createUser('${userType}')">Criar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function createUser(userType) {
  const form = document.getElementById('create-user-form');
  const formData = new FormData(form);
  const userData = Object.fromEntries(formData.entries());

  try {
    let newUser;
    if (userType === 'professor') {
      newUser = userManager.createProfessor(userData);
    } else {
      newUser = userManager.createStudent(userData);
    }

    closeModal(document.querySelector('.modal.active'));
    showToast(`${userType === 'professor' ? 'Professor' : 'Aluno'} criado com sucesso!`, 'success');
    
    // Auto-login the new user
    loginAsUser(newUser.id, userType);
    
  } catch (error) {
    showToast('Erro ao criar usuário: ' + error.message, 'error');
  }
}

function loginAsUser(userId, userType) {
  try {
    const user = dataManager.read('users', userId);
    userManager.currentUser = user;
    userManager.currentUserType = userType;
    
    // Save session
    sessionStorage.setItem('edudash_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      userType: userType
    }));
    
    closeModal(document.querySelector('.modal.active'));
    showDashboard(userType);
    showToast(`Bem-vindo(a), ${user.name}!`, 'success');
    
  } catch (error) {
    showToast('Erro ao fazer login: ' + error.message, 'error');
  }
}

function showDashboard(userType) {
  if (userType === 'professor') {
    showScreen('professor-dashboard');
    navigateToSection('overview');
    updateProfessorDashboard();
  } else {
    showScreen('aluno-dashboard');
    navigateToSection('dashboard-aluno');
    updateStudentDashboard();
  }
}

function updateProfessorDashboard() {
  const user = userManager.getCurrentUser();
  if (!user) return;

  // Update user info in sidebar
  const userInfo = document.querySelector('#professor-dashboard .user-info .status');
  if (userInfo) {
    userInfo.textContent = user.name;
  }

  // Update stats
  const classes = dataManager.query('classes', { professorId: user.id });
  const students = dataManager.query('users', { type: 'student' }).filter(student => 
    student.classesEnrolled.some(classId => 
      classes.some(cls => cls.id === classId)
    )
  );
  const lessons = dataManager.query('lessons', { createdBy: user.id });

  updateStatsCards([
    { value: students.length, label: 'Total de Alunos', trend: '+0 este mês' },
    { value: '0%', label: 'Progresso Médio', trend: '+0% este mês' },
    { value: lessons.length, label: 'Lições Ativas', trend: '0 concluídas hoje' },
    { value: classes.length, label: 'Turmas', trend: 'ENEM & UFPR' }
  ]);

  updateClassProgress(classes);
  updateTopStudents(students);
}

function updateStudentDashboard() {
  const user = userManager.getCurrentUser();
  if (!user) return;

  // Update user info in sidebar
  const userInfo = document.querySelector('#aluno-dashboard .user-info');
  if (userInfo) {
    userInfo.querySelector('.status').textContent = user.name;
    userInfo.querySelector('.user-level').textContent = `Nível ${user.progress.currentLevel} • ${user.progress.totalPoints} pts`;
  }

  // Update stats
  const userProgress = dataManager.query('progress', { userId: user.id });
  const completedLessons = userProgress.length;
  
  updateStatsCards([
    { value: user.progress.currentLevel, label: 'Nível Atual', trend: `Próximo: Nível ${user.progress.currentLevel + 1}` },
    { value: user.progress.totalPoints, label: 'Pontos Totais', trend: '+0 esta semana' },
    { value: user.progress.streak, label: 'Dias Consecutivos', trend: user.progress.streak > 0 ? '🔥 Streak ativo' : '💤 Sem streak' },
    { value: `${user.progress.badges.length}/12`, label: 'Badges', trend: `${12 - user.progress.badges.length} para conquistar` }
  ]);

  updateNextLessons(user);
  updateRecentBadges(user);
}

function updateStatsCards(stats) {
  const statCards = document.querySelectorAll('.stat-card');
  stats.forEach((stat, index) => {
    if (statCards[index]) {
      statCards[index].querySelector('.stat-number').textContent = stat.value;
      statCards[index].querySelector('.stat-label').textContent = stat.label;
      statCards[index].querySelector('.stat-trend').textContent = stat.trend;
    }
  });
}

function updateClassProgress(classes) {
  const progressList = document.querySelector('.progress-list');
  if (!progressList) return;

  progressList.innerHTML = classes.map(cls => {
    const students = dataManager.query('users', { type: 'student' }).filter(student => 
      student.classesEnrolled.includes(cls.id)
    );
    
    const progress = students.length > 0 ? 
      Math.round(students.reduce((sum, student) => sum + (student.progress.totalPoints / 100), 0) / students.length) : 0;

    return `
      <div class="progress-item">
        <span class="progress-label">${cls.name}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
        </div>
        <span class="progress-value">${Math.min(progress, 100)}%</span>
      </div>
    `;
  }).join('');
}

function updateTopStudents(students) {
  const rankingList = document.querySelector('.ranking-list');
  if (!rankingList) return;

  const sortedStudents = students
    .sort((a, b) => b.progress.totalPoints - a.progress.totalPoints)
    .slice(0, 3);

  rankingList.innerHTML = sortedStudents.map((student, index) => `
    <div class="ranking-item">
      <span class="ranking-position">${index + 1}º</span>
      <span class="ranking-name">${student.name}</span>
      <span class="ranking-points">${student.progress.totalPoints} pts</span>
    </div>
  `).join('');
}

function updateNextLessons(user) {
  const container = document.querySelector('.licoes-proximas');
  if (!container) return;

  const userProgress = dataManager.query('progress', { userId: user.id });
  const completedLessonIds = userProgress.map(p => p.lessonId);
  const availableLessons = dataManager.read('lessons').filter(lesson => 
    !completedLessonIds.includes(lesson.id)
  ).slice(0, 2);

  container.innerHTML = availableLessons.map(lesson => `
    <div class="licao-item">
      <div class="licao-icon">${getCategoryIcon(lesson.category)}</div>
      <div class="licao-details">
        <h4>${lesson.title}</h4>
        <p>${lesson.category} • ${lesson.estimatedTime} min • ${lesson.basePoints} pts</p>
      </div>
      <button class="btn btn--primary btn--sm" onclick="startLesson('${lesson.id}')">Iniciar</button>
    </div>
  `).join('');
}

function updateRecentBadges(user) {
  const container = document.querySelector('.badges-recentes');
  if (!container) return;

  const allBadges = [
    { id: 'first_lesson', name: 'First Step', description: 'Complete sua primeira lição', icon: '🥇' },
    { id: 'streak_7', name: 'Streak Champion', description: '7 dias consecutivos', icon: '🔥' },
    { id: 'level_5', name: 'Level Master', description: 'Alcance o nível 5', icon: '⭐' },
    { id: 'points_1000', name: 'Point Collector', description: '1000 pontos totais', icon: '💎' }
  ];

  container.innerHTML = allBadges.slice(0, 3).map(badge => `
    <div class="badge-item ${user.progress.badges.includes(badge.id) ? 'conquistada' : ''}">
      <span class="badge-icon">${badge.icon}</span>
      <div class="badge-info">
        <h4>${badge.name}</h4>
        <p>${badge.description}</p>
      </div>
    </div>
  `).join('');
}

// Navigation and UI Helpers
function setupNavigation() {
  // Professor navigation
  const professorMenu = document.querySelectorAll('#professor-dashboard .sidebar-menu a');
  professorMenu.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      navigateToSection(section);
      updateActiveMenuItem(this);
    });
  });

  // Student navigation
  const studentMenu = document.querySelectorAll('#aluno-dashboard .sidebar-menu a');
  studentMenu.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      navigateToSection(section);
      updateActiveMenuItem(this);
    });
  });
}

function navigateToSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.classList.remove('active'));

  // Show target section
  const targetSection = document.getElementById(`${sectionId}-section`);
  if (targetSection) {
    targetSection.classList.add('active');
    appState.currentSection = sectionId;
  }
}

function updateActiveMenuItem(activeLink) {
  // Remove active class from all links in the same menu
  const menu = activeLink.closest('.sidebar-menu');
  menu.querySelectorAll('a').forEach(link => link.classList.remove('active'));
  
  // Add active class to clicked link
  activeLink.classList.add('active');
}

function setupModalsAndForms() {
  // Settings modal for AI configuration
  setupAISettings();
  
  // Lesson creation modal
  setupLessonCreation();
  
  // Class management
  setupClassManagement();
}

function setupAISettings() {
  // Create settings button if it doesn't exist
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'btn btn--outline btn--sm';
  settingsBtn.innerHTML = '⚙️ Configurações';
  settingsBtn.onclick = showSettingsModal;
  
  // Add to professor sidebar
  const professorFooter = document.querySelector('#professor-dashboard .sidebar-footer');
  if (professorFooter && !professorFooter.querySelector('[onclick="showSettingsModal()"]')) {
    professorFooter.insertBefore(settingsBtn, professorFooter.firstChild);
  }
}

function showSettingsModal() {
  const settings = dataManager.data.settings;
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>⚙️ Configurações</h2>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">
        <div class="settings-tabs">
          <div class="tab-buttons">
            <button class="tab-btn active" onclick="switchTab('ai-settings')">🤖 IA</button>
            <button class="tab-btn" onclick="switchTab('general-settings')">🔧 Geral</button>
            <button class="tab-btn" onclick="switchTab('data-management')">💾 Dados</button>
          </div>
          
          <div id="ai-settings" class="tab-content active">
            <h3>Configuração de IA</h3>
            <p>Configure suas chaves de API para usar os recursos de IA:</p>
            
            ${Object.entries(settings.aiProviders).map(([provider, config]) => `
              <div class="provider-config">
                <h4>${getProviderName(provider)}</h4>
                <div class="form-group">
                  <label class="form-label">API Key</label>
                  <input type="password" 
                         class="form-control" 
                         value="${config.apiKey}" 
                         placeholder="Insira sua API key"
                         onchange="updateProviderSetting('${provider}', 'apiKey', this.value)">
                </div>
                <div class="form-group">
                  <label class="form-label">Modelo</label>
                  <select class="form-control" onchange="updateProviderSetting('${provider}', 'model', this.value)">
                    ${getModelOptions(provider, config.model)}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-checkbox">
                    <input type="checkbox" 
                           ${config.enabled ? 'checked' : ''} 
                           onchange="updateProviderSetting('${provider}', 'enabled', this.checked)">
                    <span>Habilitar este provedor</span>
                  </label>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div id="general-settings" class="tab-content">
            <h3>Configurações Gerais</h3>
            <div class="form-group">
              <label class="form-label">Provedor de IA Padrão</label>
              <select class="form-control" onchange="updateGeneralSetting('defaultProvider', this.value)">
                ${Object.keys(settings.aiProviders).map(provider => `
                  <option value="${provider}" ${settings.defaultProvider === provider ? 'selected' : ''}>
                    ${getProviderName(provider)}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tema</label>
              <select class="form-control" onchange="updateGeneralSetting('theme', this.value)">
                <option value="auto" ${settings.theme === 'auto' ? 'selected' : ''}>Automático</option>
                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Claro</option>
                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Escuro</option>
              </select>
            </div>
          </div>
          
          <div id="data-management" class="tab-content">
            <h3>Gerenciamento de Dados</h3>
            <div class="data-actions">
              <button class="btn btn--primary" onclick="dataManager.backup()">
                📁 Fazer Backup
              </button>
              <button class="btn btn--secondary" onclick="document.getElementById('restore-file').click()">
                📂 Restaurar Backup
              </button>
              <input type="file" id="restore-file" style="display: none" accept=".json" onchange="handleRestore(this)">
              <button class="btn btn--warning" onclick="confirmDataReset()">
                🗑️ Limpar Todos os Dados
              </button>
            </div>
            <div class="data-info">
              <p><strong>Última atualização:</strong> ${formatDate(new Date().toISOString())}</p>
              <p><strong>Total de usuários:</strong> ${dataManager.read('users').length}</p>
              <p><strong>Total de turmas:</strong> ${dataManager.read('classes').length}</p>
              <p><strong>Total de lições:</strong> ${dataManager.read('lessons').length}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn--primary" onclick="closeModal(this)">Fechar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Helper Functions
function closeModal(element) {
  const modal = element.closest('.modal');
  if (modal) {
    modal.remove();
  }
}

function logout() {
  userManager.logout();
  sessionStorage.removeItem('edudash_session');
  appState.currentScreen = 'login';
  appState.currentSection = null;
  showScreen('login-screen');
  showToast('Logout realizado com sucesso!', 'info');
}

function showToast(message, type = 'info') {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCategoryIcon(category) {
  const icons = {
    'grammar': '📝',
    'vocabulary': '📖',
    'reading': '📚',
    'writing': '✏️',
    'listening': '🎧'
  };
  return icons[category.toLowerCase()] || '📄';
}

function getProviderName(provider) {
  const names = {
    'openai': 'OpenAI (GPT)',
    'anthropic': 'Anthropic (Claude)',
    'google': 'Google (Gemini)',
    'perplexity': 'Perplexity'
  };
  return names[provider] || provider;
}

function getModelOptions(provider, currentModel) {
  const models = {
    'openai': ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    'anthropic': ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    'google': ['gemini-pro', 'gemini-pro-vision'],
    'perplexity': ['llama-3-sonar-large-32k-online', 'llama-3-sonar-small-32k-online']
  };
  
  return (models[provider] || []).map(model => 
    `<option value="${model}" ${model === currentModel ? 'selected' : ''}>${model}</option>`
  ).join('');
}

// Export functions for global access
window.showUserSelectionModal = showUserSelectionModal;
window.showCreateUserModal = showCreateUserModal;
window.createUser = createUser;
window.loginAsUser = loginAsUser;
window.closeModal = closeModal;
window.showSettingsModal = showSettingsModal;

console.log('🎨 Real UI System Loaded!');// EduDash Real System - Features and AI Integration
// Part 3: Lesson management, AI features, and complete functionality

// Lesson Management System
function setupLessonCreation() {
  const newLessonBtn = document.getElementById('nova-licao-btn');
  if (newLessonBtn) {
    newLessonBtn.addEventListener('click', showCreateLessonModal);
  }
}

function showCreateLessonModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h2>➕ Nova Lição</h2>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">
        <form id="create-lesson-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Título da Lição</label>
              <input type="text" name="title" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select name="category" class="form-control" required>
                <option value="">Selecione...</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="listening">Listening</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Vestibular</label>
              <select name="examType" class="form-control" required>
                <option value="">Selecione...</option>
                <option value="enem">ENEM</option>
                <option value="ufpr">UFPR</option>
                <option value="both">Ambos</option>
                <option value="general">Geral</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Dificuldade</label>
              <select name="difficulty" class="form-control" required>
                <option value="">Selecione...</option>
                <option value="easy">Fácil (1-3)</option>
                <option value="medium">Médio (4-6)</option>
                <option value="hard">Difícil (7-10)</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Pontos Base</label>
              <input type="number" name="basePoints" class="form-control" min="5" max="50" value="10" required>
            </div>
            <div class="form-group">
              <label class="form-label">Tempo Estimado (minutos)</label>
              <input type="number" name="estimatedTime" class="form-control" min="5" max="120" value="15" required>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea name="description" class="form-control" rows="3" placeholder="Breve descrição da lição..."></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Conteúdo da Lição</label>
            <div class="content-editor">
              <div class="editor-toolbar">
                <button type="button" class="btn btn--sm" onclick="insertContent('heading')">📝 Título</button>
                <button type="button" class="btn btn--sm" onclick="insertContent('paragraph')">📄 Parágrafo</button>
                <button type="button" class="btn btn--sm" onclick="insertContent('example')">💡 Exemplo</button>
                <button type="button" class="btn btn--sm" onclick="insertContent('exercise')">✏️ Exercício</button>
                <button type="button" class="btn btn--sm" onclick="generateContentWithAI()">🤖 Gerar com IA</button>
              </div>
              <textarea name="content" class="form-control content-textarea" rows="10" placeholder="Conteúdo da lição..."></textarea>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Pré-requisitos</label>
            <select name="prerequisites" class="form-control" multiple>
              <!-- Will be populated with existing lessons -->
            </select>
            <small>Selecione lições que devem ser completadas antes desta</small>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn--outline" onclick="closeModal(this)">Cancelar</button>
        <button class="btn btn--secondary" onclick="saveLessonDraft()">💾 Salvar Rascunho</button>
        <button class="btn btn--primary" onclick="createLesson()">✅ Criar Lição</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  populateLessonPrerequisites();
}

function populateLessonPrerequisites() {
  const select = document.querySelector('select[name="prerequisites"]');
  if (!select) return;
  
  const user = userManager.getCurrentUser();
  const lessons = dataManager.query('lessons', { createdBy: user.id });
  
  select.innerHTML = lessons.map(lesson => 
    `<option value="${lesson.id}">${lesson.title}</option>`
  ).join('');
}

function insertContent(type) {
  const textarea = document.querySelector('.content-textarea');
  const templates = {
    heading: '\n## Título da Seção\n\n',
    paragraph: '\nSeu texto aqui...\n\n',
    example: '\n**Exemplo:**\n- Frase em inglês\n- Tradução\n\n',
    exercise: '\n**Exercício:**\n1. Pergunta aqui?\na) Opção A\nb) Opção B\nc) Opção C\n\n**Resposta:** a) Opção A\n\n'
  };
  
  const template = templates[type] || '';
  const cursorPos = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPos);
  const textAfter = textarea.value.substring(cursorPos);
  
  textarea.value = textBefore + template + textAfter;
  textarea.focus();
  textarea.setSelectionRange(cursorPos + template.length, cursorPos + template.length);
}

async function generateContentWithAI() {
  const form = document.getElementById('create-lesson-form');
  const formData = new FormData(form);
  const title = formData.get('title');
  const category = formData.get('category');
  const difficulty = formData.get('difficulty');
  const examType = formData.get('examType');
  
  if (!title || !category) {
    showToast('Preencha o título e categoria antes de gerar conteúdo', 'warning');
    return;
  }
  
  const textarea = document.querySelector('.content-textarea');
  const originalText = textarea.value;
  
  try {
    showLoading(true);
    textarea.value = 'Gerando conteúdo com IA...';
    
    const prompt = `Crie uma lição completa de inglês sobre "${title}" para a categoria ${category}. 
    Nível de dificuldade: ${difficulty}
    Tipo de vestibular: ${examType}
    
    A lição deve incluir:
    1. Introdução ao tópico
    2. Explicação clara com exemplos
    3. Exercícios práticos
    4. Dicas específicas para o vestibular brasileiro
    5. Vocabulário importante
    
    Formate em markdown e seja educativo e engajante.`;
    
    const defaultProvider = dataManager.data.settings.defaultProvider;
    const content = await aiManager.makeRequest(defaultProvider, prompt);
    
    textarea.value = content;
    showToast('Conteúdo gerado com sucesso!', 'success');
    
  } catch (error) {
    textarea.value = originalText;
    showToast('Erro ao gerar conteúdo: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

function createLesson() {
  const form = document.getElementById('create-lesson-form');
  const formData = new FormData(form);
  const lessonData = Object.fromEntries(formData.entries());
  
  // Validation
  if (!lessonData.title || !lessonData.category || !lessonData.difficulty) {
    showToast('Preencha todos os campos obrigatórios', 'error');
    return;
  }
  
  try {
    const user = userManager.getCurrentUser();
    const lesson = {
      ...lessonData,
      createdBy: user.id,
      status: 'active',
      completions: 0,
      averageScore: 0,
      prerequisites: Array.from(document.querySelector('select[name="prerequisites"]').selectedOptions)
        .map(option => option.value)
    };
    
    const createdLesson = dataManager.create('lessons', lesson);
    
    // Update user stats
    userManager.updateProfile({
      lessonsCreated: [...(user.lessonsCreated || []), createdLesson.id]
    });
    
    closeModal(document.querySelector('.modal.active'));
    showToast('Lição criada com sucesso!', 'success');
    
    // Refresh lessons view if we're on that section
    if (appState.currentSection === 'licoes') {
      updateLessonsView();
    }
    
  } catch (error) {
    showToast('Erro ao criar lição: ' + error.message, 'error');
  }
}

function saveLessonDraft() {
  const form = document.getElementById('create-lesson-form');
  const formData = new FormData(form);
  const draftData = Object.fromEntries(formData.entries());
  
  // Save to localStorage as draft
  const drafts = JSON.parse(localStorage.getItem('edudash_drafts') || '[]');
  const draft = {
    id: Date.now().toString(),
    type: 'lesson',
    data: draftData,
    savedAt: new Date().toISOString()
  };
  
  drafts.push(draft);
  localStorage.setItem('edudash_drafts', JSON.stringify(drafts));
  
  showToast('Rascunho salvo!', 'info');
}

// Class Management System
function setupClassManagement() {
  // Add event listeners for class creation and management
  const newClassBtns = document.querySelectorAll('button:contains("Nova Turma")');
  newClassBtns.forEach(btn => {
    if (btn.textContent.includes('Nova Turma')) {
      btn.addEventListener('click', showCreateClassModal);
    }
  });
}

function showCreateClassModal() {
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>➕ Nova Turma</h2>
        <button class="modal-close" onclick="closeModal(this)">&times;</button>
      </div>
      <div class="modal-body">
        <form id="create-class-form">
          <div class="form-group">
            <label class="form-label">Nome da Turma</label>
            <input type="text" name="name" class="form-control" required placeholder="Ex: 3º Ano A">
          </div>
          <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea name="description" class="form-control" rows="3" placeholder="Descrição da turma..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ano/Série</label>
              <select name="grade" class="form-control" required>
                <option value="">Selecione...</option>
                <option value="1ano">1º Ano</option>
                <option value="2ano">2º Ano</option>
                <option value="3ano">3º Ano</option>
                <option value="cursinho">Cursinho</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Foco</label>
              <select name="focus" class="form-control" required>
                <option value="">Selecione...</option>
                <option value="enem">ENEM</option>
                <option value="ufpr">UFPR</option>
                <option value="both">Ambos</option>
                <option value="general">Inglês Geral</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Código de Acesso</label>
            <input type="text" name="accessCode" class="form-control" value="${generateClassCode()}" readonly>
            <small>Compartilhe este código com os alunos para que possam se inscrever</small>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn--outline" onclick="closeModal(this)">Cancelar</button>
        <button class="btn btn--primary" onclick="createClass()">Criar Turma</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function generateClassCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function createClass() {
  const form = document.getElementById('create-class-form');
  const formData = new FormData(form);
  const classData = Object.fromEntries(formData.entries());
  
  try {
    const user = userManager.getCurrentUser();
    const newClass = {
      ...classData,
      professorId: user.id,
      students: [],
      lessons: [],
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    const createdClass = dataManager.create('classes', newClass);
    
    // Update professor's owned classes
    userManager.updateProfile({
      classesOwned: [...(user.classesOwned || []), createdClass.id]
    });
    
    closeModal(document.querySelector('.modal.active'));
    showToast('Turma criada com sucesso!', 'success');
    
    // Refresh classes view
    if (appState.currentSection === 'turmas') {
      updateClassesView();
    }
    
  } catch (error) {
    showToast('Erro ao criar turma: ' + error.message, 'error');
  }
}

// AI Assistant Functions
function setupAIAssistant() {
  // Professor AI assistant
  const generateSummaryBtns = document.querySelectorAll('button:contains("Gerar Resumo")');
  generateSummaryBtns.forEach(btn => {
    if (btn.textContent.includes('Gerar Resumo')) {
      btn.addEventListener('click', generateAISummary);
    }
  });
  
  // Student AI assistant
  const askQuestionBtns = document.querySelectorAll('button:contains("Perguntar")');
  askQuestionBtns.forEach(btn => {
    if (btn.textContent.includes('Perguntar')) {
      btn.addEventListener('click', processAIQuestion);
    }
  });
}

async function generateAISummary() {
  const topicInput = document.querySelector('#assistente-section input[type="text"]');
  const levelSelect = document.querySelector('#assistente-section select');
  
  if (!topicInput || !topicInput.value.trim()) {
    showToast('Digite um tópico para gerar o resumo', 'warning');
    return;
  }
  
  const topic = topicInput.value.trim();
  const level = levelSelect ? levelSelect.value : 'Intermediário';
  
  try {
    showLoading(true);
    
    const prompt = `Crie um resumo educacional sobre "${topic}" para estudantes brasileiros de nível ${level} se preparando para vestibulares (ENEM/UFPR).

O resumo deve incluir:
1. Conceitos fundamentais
2. Exemplos práticos
3. Dicas para vestibulares
4. Exercícios rápidos
5. Vocabulário importante

Seja claro, didático e focado no contexto brasileiro.`;

    const defaultProvider = dataManager.data.settings.defaultProvider;
    const summary = await aiManager.makeRequest(defaultProvider, prompt);
    
    // Update the summary display
    const summaryDiv = document.querySelector('.resumo-content');
    if (summaryDiv) {
      summaryDiv.innerHTML = `
        <div class="ai-generated-content">
          <h4>${topic} - ${level}</h4>
          <div class="content">${formatAIContent(summary)}</div>
          <div class="ai-actions">
            <button class="btn btn--outline btn--sm" onclick="copyToClipboard(this.parentElement.parentElement.querySelector('.content').innerText)">
              📋 Copiar
            </button>
            <button class="btn btn--outline btn--sm" onclick="regenerateContent('${topic}', '${level}')">
              🔄 Regenerar
            </button>
          </div>
        </div>
      `;
    }
    
    showToast('Resumo gerado com sucesso!', 'success');
    
  } catch (error) {
    showToast('Erro ao gerar resumo: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function processAIQuestion() {
  const textarea = document.querySelector('#assistente-aluno-section textarea');
  
  if (!textarea || !textarea.value.trim()) {
    showToast('Digite sua pergunta', 'warning');
    return;
  }
  
  const question = textarea.value.trim();
  
  try {
    showLoading(true);
    
    const user = userManager.getCurrentUser();
    const prompt = `Como tutor de inglês para estudantes brasileiros preparando-se para ENEM/UFPR, responda esta pergunta de forma clara e educativa:

"${question}"

Contexto do aluno:
- Nível atual: ${user.progress.currentLevel}
- Pontos: ${user.progress.totalPoints}
- Foco: Vestibulares brasileiros

Forneça uma resposta didática com exemplos práticos.`;

    const defaultProvider = dataManager.data.settings.defaultProvider;
    const answer = await aiManager.makeRequest(defaultProvider, prompt);
    
    // Update the response display
    const responseDiv = document.querySelector('.assistente-resposta');
    if (responseDiv) {
      responseDiv.innerHTML = `
        <div class="ai-response">
          <div class="question-display">
            <strong>Sua pergunta:</strong> ${question}
          </div>
          <div class="answer-content">
            <strong>Resposta do Assistente IA:</strong>
            ${formatAIContent(answer)}
          </div>
          <div class="feedback-actions">
            <button class="btn btn--outline btn--sm" onclick="feedbackAI('positive')">👍 Útil</button>
            <button class="btn btn--outline btn--sm" onclick="feedbackAI('negative')">👎 Não útil</button>
            <button class="btn btn--outline btn--sm" onclick="copyToClipboard(this.parentElement.parentElement.querySelector('.answer-content').innerText)">📋 Copiar</button>
          </div>
        </div>
      `;
    }
    
    textarea.value = '';
    showToast('Resposta gerada!', 'success');
    
  } catch (error) {
    showToast('Erro ao processar pergunta: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// Helper Functions for AI and UI
function formatAIContent(content) {
  // Convert markdown-like formatting to HTML
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(\n|^)(\d+)\. (.+)$/gm, '<li>$3</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><li>/g, '<ul><li>')
    .replace(/<\/li><\/p>/g, '</li></ul>');
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copiado para a área de transferência!', 'success');
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copiado para a área de transferência!', 'success');
  }
}

function feedbackAI(type) {
  // Record feedback for future improvements
  const feedback = {
    type: type,
    timestamp: new Date().toISOString(),
    userId: userManager.getCurrentUser()?.id
  };
  
  // Store feedback in localStorage for analytics
  const feedbackData = JSON.parse(localStorage.getItem('edudash_ai_feedback') || '[]');
  feedbackData.push(feedback);
  localStorage.setItem('edudash_ai_feedback', JSON.stringify(feedbackData));
  
  showToast('Obrigado pelo feedback!', 'success');
}

function showLoading(show) {
  if (show) {
    appState.isLoading = true;
    document.body.classList.add('loading');
  } else {
    appState.isLoading = false;
    document.body.classList.remove('loading');
  }
}

// Settings Management Functions
function switchTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  // Show selected tab
  document.getElementById(tabId).classList.add('active');
  document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

function updateProviderSetting(provider, setting, value) {
  const settings = dataManager.data.settings.aiProviders[provider];
  settings[setting] = setting === 'enabled' ? value : value;
  dataManager.save();
  
  if (setting === 'enabled') {
    showToast(`${getProviderName(provider)} ${value ? 'habilitado' : 'desabilitado'}`, 'info');
  }
}

function updateGeneralSetting(setting, value) {
  dataManager.data.settings[setting] = value;
  dataManager.save();
  
  if (setting === 'theme') {
    applyTheme(value);
  }
  
  showToast('Configuração atualizada!', 'info');
}

function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('theme-light', 'theme-dark');
  
  if (theme === 'light') {
    body.classList.add('theme-light');
  } else if (theme === 'dark') {
    body.classList.add('theme-dark');
  }
  // 'auto' uses system preference (no class needed)
}

function handleRestore(input) {
  const file = input.files[0];
  if (!file) return;
  
  try {
    dataManager.restore(file);
    showToast('Backup restaurado com sucesso!', 'success');
  } catch (error) {
    showToast('Erro ao restaurar backup: ' + error.message, 'error');
  }
}

function confirmDataReset() {
  if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os dados permanentemente. Tem certeza?')) {
    if (confirm('Última confirmação: Todos os usuários, turmas e lições serão perdidos. Continuar?')) {
      localStorage.removeItem('edudash_data');
      sessionStorage.clear();
      location.reload();
    }
  }
}

// Initialize all features when the script loads
document.addEventListener('DOMContentLoaded', function() {
  setupLessonCreation();
  setupClassManagement();
  setupAIAssistant();
  
  // Apply saved theme
  const savedTheme = dataManager.data.settings.theme;
  applyTheme(savedTheme);
});

// Export functions for global access
window.showCreateLessonModal = showCreateLessonModal;
window.insertContent = insertContent;
window.generateContentWithAI = generateContentWithAI;
window.createLesson = createLesson;
window.saveLessonDraft = saveLessonDraft;
window.showCreateClassModal = showCreateClassModal;
window.createClass = createClass;
window.generateAISummary = generateAISummary;
window.processAIQuestion = processAIQuestion;
window.copyToClipboard = copyToClipboard;
window.feedbackAI = feedbackAI;
window.switchTab = switchTab;
window.updateProviderSetting = updateProviderSetting;
window.updateGeneralSetting = updateGeneralSetting;
window.handleRestore = handleRestore;
window.confirmDataReset = confirmDataReset;

console.log('🎯 Real Features System Loaded!');