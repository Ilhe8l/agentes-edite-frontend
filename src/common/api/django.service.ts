import { apiClient } from './client'
import type { 
  DjangoApiResponse, 
  DjangoConversa, 
  DjangoMensagem,
  ConversationSession,
  ConversationMessage 
} from '@/common/types/api.types'

export const djangoService = {
  // Buscar conversas do Django
  async getConversas(page = 1, perPage = 10): Promise<DjangoApiResponse<DjangoConversa>> {
    console.log('🔍 Buscando conversas do Django...', { page, perPage })
    
    try {
      const response = await apiClient.get<DjangoApiResponse<DjangoConversa>>(
        `/discussao/conversa/?page=${page}&per_page=${perPage}`
      )
      
      console.log('✅ Conversas recebidas:', response.meta.total, 'total')
      return response
    } catch (error: any) {
      console.error('❌ Erro ao buscar conversas:', error)
      
      if (error.response?.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.')
      }
      
      if (error.response?.status === 403) {
        throw new Error('Acesso negado. Você não tem permissão para ver as conversas.')
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Erro ao buscar conversas')
    }
  },

  // Buscar conversa específica por ID
  async getConversa(id: number): Promise<DjangoConversa> {
    console.log('🔍 Buscando conversa ID:', id)
    
    const response = await apiClient.get<DjangoConversa>(`/discussao/conversa/${id}/`)
    
    console.log('✅ Conversa recebida:', response.id)
    return response
  },

  // Buscar mensagens do Django
  async getMensagens(page = 1, perPage = 10, conversaId?: number): Promise<DjangoApiResponse<DjangoMensagem>> {
    console.log('🔍 Buscando mensagens do Django...')
    
    let url = `/discussao/mensagem/?page=${page}&per_page=${perPage}`
    if (conversaId) {
      url += `&conversa=${conversaId}`
    }
    
    const response = await apiClient.get<DjangoApiResponse<DjangoMensagem>>(url)
    
    console.log('✅ Mensagens recebidas:', response.meta.total, 'total')
    return response
  },

  // Buscar mensagem específica por ID
  async getMensagem(id: number): Promise<DjangoMensagem> {
    console.log('🔍 Buscando mensagem ID:', id)
    
    const response = await apiClient.get<DjangoMensagem>(`/discussao/mensagem/${id}/`)
    
    console.log('✅ Mensagem recebida:', response.id)
    return response
  },

  // Adaptar conversa do Django para formato do frontend
  adaptConversa(djangoConversa: DjangoConversa): ConversationSession {
    return {
      id: djangoConversa.id.toString(),
      userId: djangoConversa.questionador.id.toString(),
      userEmail: djangoConversa.questionador.contato, // Usando contato como email
      startTime: djangoConversa.iniciada_em,
      endTime: djangoConversa.encerrada_em || djangoConversa.ultima_mensagem_em,
      messageCount: 0, // Será preenchido quando buscar mensagens
      edital: 'FAPES', // Padrão, pode ser adaptado depois
    }
  },

  // Adaptar mensagem do Django para formato do frontend
  adaptMensagem(djangoMensagem: DjangoMensagem): ConversationMessage {
    const isBot = djangoMensagem.autor.papel === 'RESPONDENTE'
    
    return {
      id: djangoMensagem.id.toString(),
      role: isBot ? 'bot' : 'user',
      content: djangoMensagem.texto,
      timestamp: djangoMensagem.criada_em,
    }
  },

  // Buscar conversas adaptadas para o frontend
  async getConversasAdaptadas(page = 1, perPage = 10): Promise<{
    sessions: ConversationSession[]
    meta: { current_page: number; per_page: number; total: number }
  }> {
    try {
      const response = await this.getConversas(page, perPage)
      
      // Buscar contagem de mensagens para cada conversa
      const sessionsWithMessageCount = await Promise.all(
        response.data.map(async (conversa) => {
          const adaptedSession = this.adaptConversa(conversa)
          
          try {
            // Buscar mensagens desta conversa para contar
            const mensagensResponse = await this.getMensagens(1, 1000, conversa.id)
            adaptedSession.messageCount = mensagensResponse.meta.total
          } catch (error) {
            console.warn(`Erro ao buscar mensagens da conversa ${conversa.id}:`, error)
            adaptedSession.messageCount = 0
          }
          
          return adaptedSession
        })
      )
      
      return {
        sessions: sessionsWithMessageCount,
        meta: {
          current_page: response.meta.current_page,
          per_page: response.meta.per_page,
          total: response.meta.total
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Falha ao buscar do Django, usando dados mock:', error.message)
      
      // Fallback para dados mock se Django falhar
      const { mockService } = await import('./mock.service')
      const mockSessions = await mockService.getSessions(perPage, (page - 1) * perPage)
      
      return {
        sessions: mockSessions,
        meta: {
          current_page: page,
          per_page: perPage,
          total: mockSessions.length
        }
      }
    }
  },

  // Buscar mensagens de uma conversa específica
  async getMensagensConversa(conversaId: number): Promise<ConversationMessage[]> {
    const response = await this.getMensagens(1, 1000, conversaId) // Buscar todas as mensagens
    
    return response.data
      .map(mensagem => this.adaptMensagem(mensagem))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Ordenar por timestamp
  },

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