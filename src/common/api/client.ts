import axios, { AxiosInstance, AxiosError } from 'axios'
import { mockService } from './mock.service'

class ApiClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private useMock: boolean
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    // Se VITE_API_BASE_URL estiver vazio, usa proxy local (sem baseURL)
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''
    this.useMock = import.meta.env.VITE_USE_MOCK === 'true'

    this.instance = axios.create({
      baseURL: this.useMock ? 'http://localhost:3001/api' : baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - adiciona token
    this.instance.interceptors.request.use(
      (config) => {
        // Import dynamically to avoid circular dependency
        const token = localStorage.getItem('access_token')

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - trata erros e refresh token
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Se erro 401 e não é retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Adiciona à fila de requisições pendentes
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return this.instance(originalRequest)
              })
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          this.isRefreshing = true

          const refreshToken = localStorage.getItem('refresh_token')

          if (!refreshToken) {
            // Clear auth and redirect to login
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return Promise.reject(error)
          }

          try {
            // Tenta refresh token
            const response = await axios.post(
              `${this.instance.defaults.baseURL}/auth/refresh/`,
              { refresh: refreshToken }
            )

            const { access } = response.data
            localStorage.setItem('access_token', access)

            // Processa fila de requisições pendentes
            this.failedQueue.forEach((prom) => prom.resolve(access))
            this.failedQueue = []

            originalRequest.headers.Authorization = `Bearer ${access}`
            return this.instance(originalRequest)
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.reject(refreshError))
            this.failedQueue = []
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP com suporte a mock
  async get<T>(url: string, config?: any): Promise<T> {
    if (this.useMock) {
      return this.handleMockRequest<T>('GET', url, undefined)
    }
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    if (this.useMock) {
      return this.handleMockRequest<T>('POST', url, data)
    }
    
    // Debug log para login
    if (url === '/api-token-auth/') {
      console.log('🌐 Enviando requisição para Django:', {
        url: `${this.instance.defaults.baseURL}${url}`,
        data,
        headers: this.instance.defaults.headers
      })
    }
    
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    if (this.useMock) {
      return this.handleMockRequest<T>('PUT', url, data)
    }
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    if (this.useMock) {
      return this.handleMockRequest<T>('DELETE', url, undefined)
    }
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  async uploadFile(url: string, formData: FormData): Promise<any> {
    if (this.useMock) {
      // Mock file upload - just return success
      return { success: true, message: 'File uploaded (mock)' }
    }
    const response = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Handle mock requests
  private async handleMockRequest<T>(method: string, url: string, data?: any): Promise<T> {
    console.log(`[MOCK] ${method} ${url}`, data)

    // Login
    if (url === '/api-token-auth/' && method === 'POST') {
      return mockService.login(data.username || data.email, data.password) as T
    }

    // Get editals
    if (url === '/edital/edital/' && method === 'GET') {
      return mockService.getEditals() as T
    }

    // Get engagement metrics
    if (url === '/metrics/engagement/' && method === 'GET') {
      return mockService.getEngagementMetrics() as T
    }

    // Get messages
    if (url.startsWith('/discussao/mensagem') && method === 'GET') {
      const urlParams = new URLSearchParams(url.split('?')[1])
      const editalId = urlParams.get('edital_id') || undefined
      return mockService.getMessages(editalId) as T
    }

    // Get sessions/conversations
    if (url.startsWith('/discussao/conversa') && method === 'GET') {
      const urlParams = new URLSearchParams(url.split('?')[1])
      const limit = parseInt(urlParams.get('limit') || '50')
      const offset = parseInt(urlParams.get('offset') || '0')
      return mockService.getSessions(limit, offset) as T
    }

    // Get session detail
    if (url.match(/\/discussao\/conversa\/[^/]+\/$/) && method === 'GET') {
      const sessionId = url.split('/').filter(Boolean).pop() || ''
      return mockService.getSessionDetail(sessionId) as T
    }

    // Search sessions
    if (url === '/discussao/conversa/search/' && method === 'GET') {
      const urlParams = new URLSearchParams(url.split('?')[1])
      const email = urlParams.get('email') || undefined
      const userId = urlParams.get('user_id') || undefined
      return mockService.searchSessions(email, userId) as T
    }

    // Default mock response
    return { success: true, message: 'Mock response' } as T
  }
}

export const apiClient = new ApiClient()
