import { apiClient } from './client'
import type { 
  DjangoApiResponse, 
  DjangoConversa, 
  DjangoMensagem,
  ConversationSession,
  ConversationMessage 
} from '@/common/types/api.types'

class DjangoService {
  // Cache para todas as conversas (workaround para problema de paginação do backend)
  private allConversationsCache: ConversationSession[] | null = null
  private cacheTimestamp: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
  


  // Buscar conversas do Django
  async getConversas(page = 1, perPage = 10): Promise<DjangoApiResponse<DjangoConversa>> {
    // Tentar diferentes formatos de parâmetros para ver qual o Django aceita
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    })
    
    const url = `/discussao/conversa/?${params.toString()}`
    console.log('[i] Buscando conversas do Django...', { page, perPage, url })
    
    try {
      const response = await apiClient.get<DjangoApiResponse<DjangoConversa>>(url)
      
      console.log('[*] Conversas recebidas:', {
        total: response.meta.total,
        current_page: response.meta.current_page,
        per_page: response.meta.per_page,
        data_length: response.data.length,
        first_id: response.data[0]?.id,
        last_id: response.data[response.data.length - 1]?.id
      })
      
      // Verificar se a página retornada é a solicitada
      if (response.meta.current_page !== page) {
        console.warn(`[!] PROBLEMA: Página solicitada: ${page}, mas API retornou página: ${response.meta.current_page}`)
        console.warn('[!] Isso indica que o backend Django não está respeitando o parâmetro page')
      }
      
      return response
    } catch (error: any) {
      console.error('[x] Erro ao buscar conversas:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.')
      }
      
      if (error.response?.status === 403) {
        throw new Error('Acesso negado. Você não tem permissão para ver as conversas.')
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Erro ao buscar conversas')
    }
  }

  // Buscar conversa específica por ID
  async getConversa(id: number): Promise<DjangoConversa> {
    console.log('[i] Buscando conversa ID:', id)
    
    const response = await apiClient.get<DjangoConversa>(`/discussao/conversa/${id}/`)
    
    console.log('[*] Conversa recebida:', response.id)
    return response
  }

  // Buscar mensagens do Django
  async getMensagens(page = 1, perPage = 10, conversaId?: number): Promise<DjangoApiResponse<DjangoMensagem>> {
    console.log('[i] Buscando mensagens do Django...')
    
    let url = `/discussao/mensagem/?page=${page}&per_page=${perPage}`
    if (conversaId) {
      url += `&conversa=${conversaId}`
    }
    
    const response = await apiClient.get<DjangoApiResponse<DjangoMensagem>>(url)
    
    console.log('[*] Mensagens recebidas:', response.meta.total, 'total')
    return response
  }

  // Buscar mensagem específica por ID
  async getMensagem(id: number): Promise<DjangoMensagem> {
    console.log('[i] Buscando mensagem ID:', id)
    
    const response = await apiClient.get<DjangoMensagem>(`/discussao/mensagem/${id}/`)
    
    console.log('[*] Mensagem recebida:', response.id)
    return response
  }

  // Adaptar conversa do Django para formato do frontend
  adaptConversa(djangoConversa: DjangoConversa): ConversationSession {
    console.log(`[#] Adaptando conversa ${djangoConversa.id}`)
    
    return {
      id: djangoConversa.id.toString(),
      userId: djangoConversa.questionador.id.toString(),
      userEmail: djangoConversa.questionador.contato, // Usando contato como email
      startTime: djangoConversa.iniciada_em,
      endTime: djangoConversa.encerrada_em || djangoConversa.ultima_mensagem_em,
      messageCount: 0, // Será preenchido quando buscar mensagens
    }
  }

  // Adaptar mensagem do Django para formato do frontend
  adaptMensagem(djangoMensagem: DjangoMensagem): ConversationMessage {
    const isBot = djangoMensagem.autor.papel === 'RESPONDENTE'
    
    return {
      id: djangoMensagem.id.toString(),
      role: isBot ? 'bot' : 'user',
      content: djangoMensagem.texto,
      timestamp: djangoMensagem.criada_em,
    }
  }

  // Buscar conversas adaptadas para o frontend
  async getConversasAdaptadas(page = 1, perPage = 10): Promise<{
    sessions: ConversationSession[]
    meta: { current_page: number; per_page: number; total: number }
  }> {
    try {
      console.log(`[i] Buscando conversas - página ${page}, ${perPage} por página`)
      const response = await this.getConversas(page, perPage)
      
      // Verificar se o backend está respeitando a paginação
      const backendRespectsPagination = response.meta.current_page === page
      
      if (!backendRespectsPagination) {
        console.warn('[!] Backend não respeita paginação, implementando workaround no frontend')
        return await this.getConversasComPaginacaoLocal(page, perPage)
      }
      
      // Se o backend respeita paginação, usar normalmente
      const sessionsWithMessageCount = await Promise.all(
        response.data.map(async (conversa) => {
          const adaptedSession = this.adaptConversa(conversa)
          
          try {
            // Buscar apenas a primeira página para obter o total
            const mensagensResponse = await this.getMensagens(1, 1, conversa.id)
            adaptedSession.messageCount = mensagensResponse.meta.total
            
            console.log(`[#] Conversa ${conversa.id}: ${mensagensResponse.meta.total} mensagens`)
          } catch (error) {
            console.warn(`[!] Erro ao buscar contagem de mensagens da conversa ${conversa.id}:`, error)
            adaptedSession.messageCount = 0
          }
          
          return adaptedSession
        })
      )
      
      console.log(`[*] ${sessionsWithMessageCount.length} conversas carregadas da página ${page}`)
      
      return {
        sessions: sessionsWithMessageCount,
        meta: {
          current_page: response.meta.current_page,
          per_page: response.meta.per_page,
          total: response.meta.total
        }
      }
    } catch (error: any) {
      console.error('[x] Falha ao buscar conversas do Django:', error.message)
      throw error
    }
  }

  // Workaround: Implementar paginação local quando o backend não funciona
  async getConversasComPaginacaoLocal(page = 1, perPage = 10): Promise<{
    sessions: ConversationSession[]
    meta: { current_page: number; per_page: number; total: number }
  }> {
    const now = Date.now()
    
    // Verificar se o cache ainda é válido
    if (!this.allConversationsCache || (now - this.cacheTimestamp) > this.CACHE_DURATION) {
      console.log('[i] Carregando todas as conversas para cache...')
      
      // Carregar todas as conversas
      const allConversations: ConversationSession[] = []
      let currentPage = 1
      let hasMore = true
      
      while (hasMore) {
        try {
          const response = await this.getConversas(currentPage, 100) // Usar páginas grandes
          
          const adaptedSessions = await Promise.all(
            response.data.map(async (conversa) => {
              try {
                const mensagensResponse = await this.getMensagens(1, 1, conversa.id)
                
                const adaptedSession = this.adaptConversa(conversa)
                adaptedSession.messageCount = mensagensResponse.meta.total
                
                return adaptedSession
              } catch (error) {
                console.warn(`[!] Erro ao processar conversa ${conversa.id}:`, error)
                const adaptedSession = this.adaptConversa(conversa)
                adaptedSession.messageCount = 0
                return adaptedSession
              }
            })
          )
          
          allConversations.push(...adaptedSessions)
          
          // Verificar se há mais conversas
          hasMore = allConversations.length < response.meta.total
          currentPage++
          
          console.log(`[#] Carregadas ${allConversations.length}/${response.meta.total} conversas`)
          
          // Proteção contra loop infinito
          if (currentPage > 20) {
            console.warn('[!] Limite de páginas atingido ao carregar todas as conversas')
            break
          }
          
        } catch (error) {
          console.error(`[x] Erro ao carregar página ${currentPage} de conversas:`, error)
          break
        }
      }
      
      this.allConversationsCache = allConversations
      this.cacheTimestamp = now
      
      console.log(`[*] Cache atualizado com ${allConversations.length} conversas`)
    }
    
    // Aplicar paginação local
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedSessions = this.allConversationsCache.slice(startIndex, endIndex)
    
    console.log(`[#] Página ${page}: mostrando conversas ${startIndex + 1}-${Math.min(endIndex, this.allConversationsCache.length)} de ${this.allConversationsCache.length}`)
    
    return {
      sessions: paginatedSessions,
      meta: {
        current_page: page,
        per_page: perPage,
        total: this.allConversationsCache.length
      }
    }
  }

  // Buscar mensagens de uma conversa específica - TODAS as mensagens
  async getMensagensConversa(conversaId: number): Promise<ConversationMessage[]> {
    const allMessages: DjangoMensagem[] = []
    let currentPage = 1
    let hasMore = true
    const perPage = 100 // Usar páginas menores para melhor performance
    
    console.log(`[i] Carregando todas as mensagens da conversa ${conversaId}...`)
    
    while (hasMore) {
      try {
        const response = await this.getMensagens(currentPage, perPage, conversaId)
        
        allMessages.push(...response.data)
        
        console.log(`[#] Página ${currentPage}: ${response.data.length} mensagens (${allMessages.length}/${response.meta.total})`)
        
        // Verificar se há mais páginas
        hasMore = allMessages.length < response.meta.total
        currentPage++
        
        // Proteção contra loop infinito
        if (currentPage > 100) {
          console.warn('[!] Limite de páginas atingido, interrompendo carregamento')
          break
        }
        
      } catch (error) {
        console.error(`[x] Erro ao carregar página ${currentPage} da conversa ${conversaId}:`, error)
        break
      }
    }
    
    console.log(`[*] Total de mensagens carregadas: ${allMessages.length}`)
    
    return allMessages
      .map(mensagem => this.adaptMensagem(mensagem))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Ordenar por timestamp
  }



  // Buscar detalhes completos de uma conversa (com mensagens)
  async getConversaCompleta(conversaId: number): Promise<ConversationSession> {
    const [conversa, mensagens] = await Promise.all([
      this.getConversa(conversaId),
      this.getMensagensConversa(conversaId)
    ])
    
    const conversaAdaptada = this.adaptConversa(conversa)
    conversaAdaptada.messages = mensagens
    conversaAdaptada.messageCount = mensagens.length
    
    return conversaAdaptada
  }
}

export const djangoService = new DjangoService()