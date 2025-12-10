import axios, { AxiosInstance, AxiosError } from 'axios'

class ApiClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || ''

    this.instance = axios.create({
      baseURL,
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
          config.headers.Authorization = `Token ${token}`
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

  // Métodos HTTP
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
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
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  async uploadFile(url: string, formData: FormData): Promise<any> {
    const response = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }


}

export const apiClient = new ApiClient()
