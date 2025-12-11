import { apiClient } from '@/common/api/client'

export interface MessageMetrics {
  id: number
  texto: string
  criada_em: string
  conversa: {
    id: number
    iniciada_em: string
    encerrada_em: string | null
    ultima_mensagem_em: string
  }
  autor: {
    id: number
    nome: string
    contato: string
    papel: 'QUESTIONANTE' | 'RESPONDENTE'
  }
  itensdeconhecimento: Array<{
    id: number
    nome: string
    arquivo: string
  }>
}

export interface ConversationMetrics {
  id: number
  iniciada_em: string
  encerrada_em: string | null
  ultima_mensagem_em: string
  questionador: {
    id: number
    nome: string
    contato: string
    papel: string
  }
  respondente: {
    id: number
    nome: string
    contato: string
    papel: string
  }
}

export interface EditalMetrics {
  id: number
  nome: string
  arquivo: string
  metadata: {
    link: string
    nome?: string
    alteracoes?: any[]
    informacao_extra?: any
  }
  numero: string | null // TODO: Trocar por número quando disponível na API
  status: string
  tags: any
  setor_responsavel: {
    id: number
    nome: string
    telefone: string
  }
}

export interface ApiResponse<T> {
  meta: {
    current_page: number
    per_page: number
    max_per_page: number
    total: number
  }
  data: T[]
}

export interface TimeSeriesData {
  date: string
  count: number
}

export interface EditalDistribution {
  editalId: number
  editalName: string
  messageCount: number
  conversationCount: number
}

class MetricsService {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos em millisegundos

  private getCacheKey(endpoint: string): string {
    return `metrics_${endpoint}`
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    
    const now = Date.now()
    const isValid = (now - cached.timestamp) < this.CACHE_DURATION
    
    if (!isValid) {
      this.cache.delete(key)
    }
    
    return isValid
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key)
    return cached ? cached.data : null
  }

  // Buscar todas as mensagens (com paginação otimizada em paralelo)
  async getAllMessages(): Promise<MessageMetrics[]> {
    const cacheKey = this.getCacheKey('messages')
    
    // Verificar cache primeiro
    if (this.isValidCache(cacheKey)) {
      console.log('[i] Usando mensagens do cache')
      return this.getCache(cacheKey)
    }

    try {
      // Primeira requisição para descobrir quantas páginas existem
      const firstResponse = await apiClient.get<ApiResponse<MessageMetrics>>(
        `/discussao/mensagem/?page=1&page_size=100`
      )
      
      const meta = firstResponse.meta || { total: 0, per_page: 100, current_page: 1 }
      const totalPages = Math.ceil(meta.total / meta.per_page)
      
      console.log(`[i] Total de ${meta.total} mensagens em ${totalPages} páginas`)
      
      // Se só tem uma página, retorna direto
      if (totalPages <= 1) {
        const result = firstResponse.data || []
        this.setCache(cacheKey, result)
        return result
      }
      
      // Criar array de promises para todas as páginas restantes
      const pagePromises: Promise<ApiResponse<MessageMetrics>>[] = []
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          apiClient.get<ApiResponse<MessageMetrics>>(
            `/discussao/mensagem/?page=${page}&page_size=100`
          )
        )
      }
      
      // Executar todas as requisições em paralelo
      console.log(`[i] Carregando ${pagePromises.length} páginas em paralelo...`)
      const responses = await Promise.all(pagePromises)
      
      // Combinar todos os resultados
      const allMessages: MessageMetrics[] = [...(firstResponse.data || [])]
      responses.forEach(response => {
        if (response.data && Array.isArray(response.data)) {
          allMessages.push(...response.data)
        }
      })
      
      console.log(`[*] Total de ${allMessages.length} mensagens carregadas`)
      
      // Salvar no cache
      this.setCache(cacheKey, allMessages)
      
      return allMessages
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      return []
    }
  }

  // Buscar todas as conversas (com paginação otimizada em paralelo)
  async getAllConversations(): Promise<ConversationMetrics[]> {
    const cacheKey = this.getCacheKey('conversations')
    
    // Verificar cache primeiro
    if (this.isValidCache(cacheKey)) {
      console.log('[i] Usando conversas do cache')
      return this.getCache(cacheKey)
    }

    try {
      // Primeira requisição para descobrir quantas páginas existem
      const firstResponse = await apiClient.get<ApiResponse<ConversationMetrics>>(
        `/discussao/conversa/?page=1&page_size=100`
      )
      
      const meta = firstResponse.meta || { total: 0, per_page: 100, current_page: 1 }
      const totalPages = Math.ceil(meta.total / meta.per_page)
      
      console.log(`[i] Total de ${meta.total} conversas em ${totalPages} páginas`)
      
      // Se só tem uma página, retorna direto
      if (totalPages <= 1) {
        const result = firstResponse.data || []
        this.setCache(cacheKey, result)
        return result
      }
      
      // Criar array de promises para todas as páginas restantes
      const pagePromises: Promise<ApiResponse<ConversationMetrics>>[] = []
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          apiClient.get<ApiResponse<ConversationMetrics>>(
            `/discussao/conversa/?page=${page}&page_size=100`
          )
        )
      }
      
      // Executar todas as requisições em paralelo
      console.log(`[i] Carregando ${pagePromises.length} páginas em paralelo...`)
      const responses = await Promise.all(pagePromises)
      
      // Combinar todos os resultados
      const allConversations: ConversationMetrics[] = [...(firstResponse.data || [])]
      responses.forEach(response => {
        if (response.data && Array.isArray(response.data)) {
          allConversations.push(...response.data)
        }
      })
      
      console.log(`[*] Total de ${allConversations.length} conversas carregadas`)
      
      // Salvar no cache
      this.setCache(cacheKey, allConversations)
      
      return allConversations
    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
      return []
    }
  }

  // Buscar todos os editais
  async getAllEditals(): Promise<EditalMetrics[]> {
    const cacheKey = this.getCacheKey('editals')
    
    // Verificar cache primeiro
    if (this.isValidCache(cacheKey)) {
      console.log('[i] Usando editais do cache')
      return this.getCache(cacheKey)
    }

    try {
      const response = await apiClient.get<ApiResponse<EditalMetrics>>('/edital/edital/?page_size=100')
      
      console.log('[#] Resposta da API de editais:', response)
      
      // A resposta já vem como { meta: {...}, data: [...] }
      const data = response.data || []
      
      if (Array.isArray(data)) {
        console.log(`[*] ${data.length} editais carregados`)
        
        // Salvar no cache
        this.setCache(cacheKey, data)
        
        return data
      }
      
      console.log('[!] Resposta de editais não é um array:', data)
      return []
    } catch (error) {
      console.error('Erro ao carregar editais:', error)
      return []
    }
  }

  // Método otimizado para carregar todos os dados de uma vez
  async getAllData() {
    console.log('[i] Carregando todos os dados em paralelo...')
    const [messages, conversations, editals] = await Promise.all([
      this.getAllMessages(),
      this.getAllConversations(),
      this.getAllEditals()
    ])
    
    return { messages, conversations, editals }
  }

  // Limpar cache manualmente
  clearCache(): void {
    this.cache.clear()
    console.log('[i] Cache de métricas limpo')
  }

  // Verificar status do cache
  getCacheStatus(): { [key: string]: { age: number, valid: boolean } } {
    const status: { [key: string]: { age: number, valid: boolean } } = {}
    const now = Date.now()
    
    this.cache.forEach((value, key) => {
      const age = now - value.timestamp
      const valid = age < this.CACHE_DURATION
      status[key] = { age: Math.round(age / 1000), valid } // idade em segundos
    })
    
    return status
  }
}

export const metricsService = new MetricsService()