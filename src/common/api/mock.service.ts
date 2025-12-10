import type { 
  User, 
  AuthTokens, 
  EditalResponse, 
  EngagementMetricsResponse,
  Message,
  ConversationSession 
} from '@/common/types/api.types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockService = {
  async login(username: string, password: string): Promise<{ token: string }> {
    await delay(500)
    
    // Accept any credentials for testing
    // Just validate that username and password are not empty
    if (!username || !password) {
      throw new Error('Usuário e senha são obrigatórios')
    }
    
    // Simulate Django token auth response
    return {
      token: 'mock-access-token-' + username,
    }
  },

  async getEditals(): Promise<EditalResponse[]> {
    await delay(300)
    return [
      {
        id: '1',
        title: 'Edital de Chamada Pública nº 001/2024',
        description: 'Edital para seleção de projetos de pesquisa em áreas estratégicas',
        status: 'open',
        metadata: { 
          'prazo': '31/01/2024', 
          'valor': 'R$ 50.000',
          'area': 'Ciências Exatas'
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        files: {
          main_pdf: 'edital-001.pdf',
          annexes: [
            { id: 'a1', name: 'Anexo I - Formulário', url: '/files/anexo1.pdf' }
          ],
          results: [],
        },
      },
      {
        id: '2',
        title: 'Edital de Seleção de Pesquisadores nº 002/2024',
        description: 'Seleção de pesquisadores para projetos de inovação tecnológica',
        status: 'open',
        metadata: { 
          'prazo': '15/02/2024', 
          'valor': 'R$ 80.000',
          'area': 'Tecnologia'
        },
        created_at: '2024-01-05T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z',
        files: {
          main_pdf: 'edital-002.pdf',
          annexes: [],
          results: [],
        },
      },
      {
        id: '3',
        title: 'Edital de Bolsas de Estudo nº 003/2024',
        description: 'Concessão de bolsas de estudo para mestrado e doutorado',
        status: 'analyzing',
        metadata: { 
          'prazo': '28/02/2024', 
          'valor': 'R$ 120.000',
          'area': 'Educação'
        },
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-25T00:00:00Z',
        files: {
          main_pdf: 'edital-003.pdf',
          annexes: [
            { id: 'a2', name: 'Anexo I - Critérios', url: '/files/anexo2.pdf' },
            { id: 'a3', name: 'Anexo II - Formulário', url: '/files/anexo3.pdf' }
          ],
          results: [
            { id: 'r1', name: 'Resultado Preliminar', url: '/files/resultado1.pdf' }
          ],
        },
      },
    ]
  },

  async getEngagementMetrics(): Promise<EngagementMetricsResponse> {
    await delay(400)
    return {
      total_messages: 760,
      total_users: 111,
      total_editals: 5,
      editals: [
        {
          id: '1',
          title: 'Edital de Chamada Pública nº 001/2024',
          messageCount: 245,
          uniqueUsers: 32,
          lastMessage: '2024-01-15',
        },
        {
          id: '2',
          title: 'Edital de Seleção de Pesquisadores nº 002/2024',
          messageCount: 189,
          uniqueUsers: 28,
          lastMessage: '2024-01-14',
        },
        {
          id: '3',
          title: 'Edital de Bolsas de Estudo nº 003/2024',
          messageCount: 156,
          uniqueUsers: 24,
          lastMessage: '2024-01-13',
        },
        {
          id: '4',
          title: 'Edital de Infraestrutura nº 004/2024',
          messageCount: 98,
          uniqueUsers: 15,
          lastMessage: '2024-01-12',
        },
        {
          id: '5',
          title: 'Edital de Extensão nº 005/2024',
          messageCount: 72,
          uniqueUsers: 12,
          lastMessage: '2024-01-11',
        },
      ],
    }
  },

  async getMessages(editalId?: string): Promise<Message[]> {
    await delay(300)
    
    const allMessages: Message[] = [
      {
        id: '1',
        userId: 'user_1',
        userEmail: 'maria.silva@example.com',
        question: 'Qual é a data limite para inscrição?',
        botResponse: 'A data limite para inscrição é 31 de janeiro de 2024.',
        timestamp: '2024-01-15T14:30:00Z',
        editalId: '1',
      },
      {
        id: '2',
        userId: 'user_2',
        userEmail: 'joao.santos@example.com',
        question: 'Quais documentos são necessários?',
        botResponse: 'São necessários: RG, CPF, comprovante de residência e currículo atualizado.',
        timestamp: '2024-01-15T15:00:00Z',
        editalId: '1',
      },
      {
        id: '3',
        userId: 'user_3',
        userEmail: 'ana.costa@example.com',
        question: 'Qual o valor da bolsa?',
        botResponse: 'O valor da bolsa é de R$ 2.500,00 mensais.',
        timestamp: '2024-01-14T10:20:00Z',
        editalId: '2',
      },
      {
        id: '4',
        userId: 'user_1',
        userEmail: 'maria.silva@example.com',
        question: 'Posso me inscrever em mais de um edital?',
        botResponse: 'Sim, você pode se inscrever em múltiplos editais simultaneamente.',
        timestamp: '2024-01-14T11:45:00Z',
        editalId: '2',
      },
      {
        id: '5',
        userId: 'user_4',
        userEmail: 'pedro.oliveira@example.com',
        question: 'Como faço para acompanhar o resultado?',
        botResponse: 'Os resultados serão divulgados no portal e enviados por email.',
        timestamp: '2024-01-13T16:30:00Z',
        editalId: '3',
      },
    ]
    
    if (editalId) {
      return allMessages.filter(m => m.editalId === editalId)
    }
    
    return allMessages
  },

  async getSessions(limit = 50, offset = 0): Promise<ConversationSession[]> {
    await delay(400)
    
    const allSessions: ConversationSession[] = [
      {
        id: 'sess_001',
        userId: 'user_1',
        userEmail: 'maria.silva@example.com',
        startTime: '2024-01-15T14:00:00Z',
        endTime: '2024-01-15T14:35:00Z',
        messageCount: 8,
        edital: 'Edital 001/2024',
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: 'Qual é a data limite para inscrição?',
            timestamp: '2024-01-15T14:00:00Z',
          },
          {
            id: 'msg_2',
            role: 'bot',
            content: 'A data limite para inscrição é 31 de janeiro de 2024.',
            timestamp: '2024-01-15T14:01:00Z',
          },
          {
            id: 'msg_3',
            role: 'user',
            content: 'Quais são os requisitos?',
            timestamp: '2024-01-15T14:05:00Z',
          },
          {
            id: 'msg_4',
            role: 'bot',
            content: 'Os requisitos incluem: ser maior de 18 anos, ter ensino superior completo e experiência na área.',
            timestamp: '2024-01-15T14:06:00Z',
          },
        ],
      },
      {
        id: 'sess_002',
        userId: 'user_2',
        userEmail: 'joao.santos@example.com',
        startTime: '2024-01-15T15:00:00Z',
        endTime: '2024-01-15T15:20:00Z',
        messageCount: 5,
        edital: 'Edital 001/2024',
        messages: [
          {
            id: 'msg_5',
            role: 'user',
            content: 'Quais documentos preciso enviar?',
            timestamp: '2024-01-15T15:00:00Z',
          },
          {
            id: 'msg_6',
            role: 'bot',
            content: 'Você precisa enviar: RG, CPF, comprovante de residência e currículo.',
            timestamp: '2024-01-15T15:01:00Z',
          },
        ],
      },
      {
        id: 'sess_003',
        userId: 'user_3',
        userEmail: 'ana.costa@example.com',
        startTime: '2024-01-14T10:00:00Z',
        endTime: '2024-01-14T10:30:00Z',
        messageCount: 6,
        edital: 'Edital 002/2024',
        messages: [
          {
            id: 'msg_7',
            role: 'user',
            content: 'Qual o valor da bolsa?',
            timestamp: '2024-01-14T10:00:00Z',
          },
          {
            id: 'msg_8',
            role: 'bot',
            content: 'O valor da bolsa é de R$ 2.500,00 mensais.',
            timestamp: '2024-01-14T10:01:00Z',
          },
        ],
      },
    ]
    
    // Apply pagination
    return allSessions.slice(offset, offset + limit)
  },

  async getSessionDetail(sessionId: string): Promise<ConversationSession> {
    await delay(300)
    
    const sessions = await this.getSessions()
    const session = sessions.find(s => s.id === sessionId)
    
    if (!session) {
      throw new Error('Session not found')
    }
    
    return session
  },

  async searchSessions(email?: string, userId?: string): Promise<ConversationSession[]> {
    await delay(400)
    
    const sessions = await this.getSessions()
    
    return sessions.filter(session => {
      if (email && !session.userEmail.toLowerCase().includes(email.toLowerCase())) {
        return false
      }
      if (userId && !session.userId.toLowerCase().includes(userId.toLowerCase())) {
        return false
      }
      return true
    })
  },

  // Simulate errors for testing
  async simulateTimeout(): Promise<never> {
    await delay(15000) // Longer than timeout
    throw new Error('Request timeout')
  },

  async simulate401(): Promise<never> {
    await delay(200)
    const error: any = new Error('Unauthorized')
    error.response = { status: 401 }
    throw error
  },

  async simulate500(): Promise<never> {
    await delay(200)
    const error: any = new Error('Internal Server Error')
    error.response = { status: 500 }
    throw error
  },
}
