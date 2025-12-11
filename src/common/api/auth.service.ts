import { apiClient } from './client'
import type { User, AuthTokens, LoginCredentials } from '@/common/types/user.types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    console.log('[i] Tentando login com:', { username: credentials.username })
    
    // Django API usa username e password
    const response = await apiClient.post<{ token: string }>('/api-token-auth/', {
      username: credentials.username,
      password: credentials.password
    })
    
    console.log('[*] Login bem-sucedido, token recebido')
    
    // Adaptar resposta do Django para o formato esperado
    return {
      user: {
        id: '1',
        email: '', // Django pode retornar email se disponível
        name: credentials.username
      },
      tokens: {
        access: response.token,
        refresh: response.token // Django token auth não tem refresh
      }
    }
  },

  async logout(): Promise<void> {
    // Django token auth não tem endpoint de logout
    return Promise.resolve()
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Django token auth não tem refresh
    return Promise.resolve({ access: refreshToken, refresh: refreshToken })
  },

  async getCurrentUser(): Promise<User> {
    // Buscar do localStorage por enquanto
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
    throw new Error('User not found')
  },
}
