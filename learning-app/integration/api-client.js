/**
 * Unified API Client for Frontend-Backend Integration
 * Bridges Track 1 (Frontend) with Track 2 (Backend)
 */

class APIClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'http://localhost:3001/api';
    this.wsURL = config.wsURL || 'ws://localhost:3001';
    this.token = null;
    this.interceptors = {
      request: [],
      response: []
    };
  }

  /**
   * Authentication
   */
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    this.token = response.token;
    localStorage.setItem('authToken', this.token);
    return response;
  }

  async logout() {
    await this.post('/auth/logout');
    this.token = null;
    localStorage.removeItem('authToken');
  }

  /**
   * Progress Management - Integrates with Track 1's ProgressTracker
   */
  async syncProgress(progressData) {
    return this.post('/progress/sync', progressData);
  }

  async getProgress() {
    return this.get('/progress');
  }

  async updateModuleProgress(moduleId, progress) {
    return this.patch(`/progress/modules/${moduleId}`, { progress });
  }

  async completeExercise(moduleId, exerciseId, data) {
    return this.post(`/progress/modules/${moduleId}/exercises/${exerciseId}`, data);
  }

  /**
   * Content Management - Bridges Track 3 content with Track 1 components
   */
  async getWeekContent(weekId) {
    return this.get(`/content/weeks/${weekId}`);
  }

  async getQuiz(quizId) {
    return this.get(`/content/quizzes/${quizId}`);
  }

  async submitQuiz(quizId, answers) {
    return this.post(`/content/quizzes/${quizId}/submit`, { answers });
  }

  /**
   * Lab Management - Connects Track 4 infrastructure
   */
  async startLab(weekId) {
    return this.post(`/labs/${weekId}/start`);
  }

  async stopLab(weekId) {
    return this.post(`/labs/${weekId}/stop`);
  }

  async getLabStatus(weekId) {
    return this.get(`/labs/${weekId}/status`);
  }

  /**
   * Terminal Management
   */
  createTerminalSession(containerId) {
    return new WebSocket(`${this.wsURL}/terminal?container=${containerId}`);
  }

  /**
   * HTTP Methods
   */
  async request(method, path, data = null) {
    const url = `${this.baseURL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add auth token
    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add body for POST/PUT/PATCH
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data);
    }

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      await interceptor(options);
    }

    try {
      const response = await fetch(url, options);
      
      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        await interceptor(response);
      }

      if (!response.ok) {
        throw new APIError(response.status, await response.text());
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(0, error.message);
    }
  }

  get(path) {
    return this.request('GET', path);
  }

  post(path, data) {
    return this.request('POST', path, data);
  }

  put(path, data) {
    return this.request('PUT', path, data);
  }

  patch(path, data) {
    return this.request('PATCH', path, data);
  }

  delete(path) {
    return this.request('DELETE', path);
  }

  /**
   * Add interceptor
   */
  addInterceptor(type, fn) {
    this.interceptors[type].push(fn);
  }
}

/**
 * Custom API Error
 */
class APIError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

/**
 * Singleton instance
 */
const apiClient = new APIClient();

// Auto-restore token
const savedToken = localStorage.getItem('authToken');
if (savedToken) {
  apiClient.token = savedToken;
}

// Export for use
export { apiClient, APIClient, APIError };