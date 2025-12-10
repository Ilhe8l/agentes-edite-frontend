export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface EditalMetrics {
  id: string
  title: string
  messageCount: number
  uniqueUsers: number
  lastMessage: string
}

export interface EngagementMetricsResponse {
  total_messages: number
  total_users: number
  total_editals: number
  editals: EditalMetrics[]
}

export interface Message {
  id: string
  userId: string
  userEmail: string
  question: string
  botResponse: string
  timestamp: string
  editalId?: string
}

// Tipos baseados na API real do Django
export interface DjangoApiResponse<T> {
  meta: {
    current_page: number
    per_page: number
    max_per_page: number
    total: number
  }
  data: T[]
}

export interface DjangoUser {
  id: number
  nome: string
  contato: string
  papel: 'QUESTIONANTE' | 'RESPONDENTE'
  polymorphic_ctype: number
}

export interface DjangoConversa {
  id: number
  session_id: string | null
  iniciada_em: string
  encerrada_em: string | null
  ultima_mensagem_em: string
  questionador: DjangoUser
  respondente: DjangoUser
}

export interface DjangoMensagem {
  id: number
  texto: string
  payload: any
  criada_em: string
  conversa: {
    id: number
    session_id: string | null
    iniciada_em: string
    encerrada_em: string | null
    ultima_mensagem_em: string
    polymorphic_ctype: number
    questionador: number
    respondente: number
  }
  autor: DjangoUser
  itensdeconhecimento: any[]
}

// Tipos adaptados para o frontend (mantendo compatibilidade)
export interface ConversationSession {
  id: string
  userId: string
  userEmail: string
  startTime: string
  endTime: string
  messageCount: number
  edital?: string
  messages?: ConversationMessage[]
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: string
}

// Re-export types from other files for convenience
export type { User, AuthTokens, LoginCredentials } from './user.types'
export type { 
  DynamicField, 
  UploadedFile, 
  EditalFormData, 
  EditalPayload, 
  EditalResponse 
} from './edital.types'
