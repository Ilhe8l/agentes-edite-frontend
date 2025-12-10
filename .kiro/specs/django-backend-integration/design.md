# Design Document - Django Backend Integration

## Overview

Este documento descreve o design da integração entre o frontend Vue.js 3 e o backend Django REST Framework. A solução implementa autenticação JWT com refresh automático, comunicação REST API com interceptors, modo mock para desenvolvimento offline, e gerenciamento completo de editais, métricas e histórico de conversas.

### Objetivos Principais

1. **Autenticação Segura**: Sistema JWT com refresh automático e tratamento de expiração
2. **Comunicação Robusta**: Cliente HTTP com interceptors, retry logic e tratamento de erros
3. **Desenvolvimento Offline**: Modo mock completo para trabalhar sem backend
4. **Experiência Fluida**: Renovação transparente de tokens sem interrupção do usuário
5. **Configuração Flexível**: Suporte a múltiplos ambientes via variáveis de ambiente

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vue.js Frontend                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              Presentation Layer                 │    │
│  │  - LoginPage.vue                                │    │
│  │  - HomePage.vue                                 │    │
│  │  - ManagementPage.vue                           │    │
│  │  - MetricsPage.vue                              │    │
│  │  - HistoryPage.vue                              │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌────────────────────────────────────────────────┐    │
│  │              State Management (Pinia)           │    │
│  │  - auth.ts (user, tokens, isAuthenticated)      │    │
│  │  - ui.ts (loading, errors, toasts)              │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌────────────────────────────────────────────────┐    │
│  │              Service Layer                      │    │
│  │  - auth.service.ts                              │    │
│  │  - edital.service.ts                            │    │
│  │  - mock.service.ts                              │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌────────────────────────────────────────────────┐    │
│  │              API Client (Axios)                 │    │
│  │  - Request Interceptor (add JWT)                │    │
│  │  - Response Interceptor (handle 401)            │    │
│  │  - Refresh Token Queue                          │    │
│  │  - Mock Mode Switch                             │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP/HTTPS + JWT
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Django Backend                          │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              API Endpoints                      │    │
│  │  - /api-token-auth/ (login)                     │    │
│  │  - /auth/refresh/ (refresh token)               │    │
│  │  - /edital/edital/ (CRUD editais)               │    │
│  │  - /metrics/engagement/ (métricas)              │    │
│  │  - /discussao/mensagem/ (mensagens)             │    │
│  │  - /discussao/conversa/ (conversas)             │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌────────────────────────────────────────────────┐    │
│  │              Middleware                         │    │
│  │  - CORS (allow localhost:3000)                  │    │
│  │  - JWT Authentication                           │    │
│  │  - Request Logging                              │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   View   │────>│  Store   │────>│ Service  │────>│API Client│
│          │     │ (Pinia)  │     │          │     │ (Axios)  │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                         │
                                                         │
                                              ┌──────────▼─────────┐
                                              │  Mock Mode?        │
                                              └──────┬─────┬───────┘
                                                     │     │
                                              Yes ───┘     └─── No
                                                     │           │
                                              ┌──────▼─────┐     │
                                              │Mock Service│     │
                                              └────────────┘     │
                                                                 │
                                                          ┌──────▼─────┐
                                                          │   Django   │
                                                          │   Backend  │
                                                          └────────────┘
```

## Components and Interfaces

### 1. API Client (client.ts)

**Responsabilidades:**
- Gerenciar instância Axios com configuração base
- Adicionar token JWT em todas as requisições
- Interceptar respostas 401 e renovar token automaticamente
- Enfileirar requisições durante refresh de token
- Rotear para Mock Service quando configurado

**Interface:**

```typescript
class ApiClient {
  // Configuração
  constructor()
  private setupInterceptors(): void
  
  // Métodos HTTP
  async get<T>(url: string, config?: any): Promise<T>
  async post<T>(url: string, data?: any, config?: any): Promise<T>
  async put<T>(url: string, data?: any, config?: any): Promise<T>
  async delete<T>(url: string, config?: any): Promise<T>
  async uploadFile(url: string, formData: FormData): Promise<any>
  
  // Mock handling
  private async handleMockRequest<T>(method: string, url: string, data?: any): Promise<T>
}

export const apiClient: ApiClient
```

**Configuração:**

```typescript
// Variáveis de ambiente
VITE_API_BASE_URL: string // URL base do Django (vazio = proxy local)
VITE_USE_MOCK: 'true' | 'false' // Ativar modo mock
```

**Token Refresh Flow:**

```
Request → 401 → Check refresh_token
                      │
                      ├─ Exists → POST /auth/refresh/
                      │              │
                      │              ├─ Success → Update token → Retry request
                      │              │
                      │              └─ Fail → Logout → Redirect /login
                      │
                      └─ Not exists → Logout → Redirect /login
```

**Queue Management:**

```typescript
private isRefreshing: boolean = false
private failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

// Durante refresh, novas requisições 401 são enfileiradas
// Após refresh bem-sucedido, todas são processadas com novo token
// Se refresh falha, todas são rejeitadas
```

### 2. Auth Service (auth.service.ts)

**Responsabilidades:**
- Realizar login e processar resposta
- Fazer logout e limpar dados
- Renovar tokens expirados
- Obter usuário atual

**Interface:**

```typescript
interface LoginCredentials {
  email: string
  password: string
}

interface AuthTokens {
  access: string
  refresh: string
}

interface User {
  id: string
  email: string
  name: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }>
  async logout(): Promise<void>
  async refreshToken(refreshToken: string): Promise<AuthTokens>
  async getCurrentUser(): Promise<User>
}
```

**Login Flow:**

```
1. Recebe credentials (email, password)
2. POST /api-token-auth/ com { username: email, password }
3. Recebe { token: string }
4. Adapta para formato { user, tokens: { access, refresh } }
5. Retorna para store salvar no localStorage
```

**Logout Flow:**

```
1. Remove access_token do localStorage
2. Remove refresh_token do localStorage
3. Remove user do localStorage
4. Limpa stores Pinia
5. Redireciona para /login
```

### 3. Mock Service (mock.service.ts)

**Responsabilidades:**
- Simular respostas da API Django
- Fornecer dados realistas para desenvolvimento
- Suportar todos os endpoints principais

**Interface:**

```typescript
export const mockService = {
  // Auth
  login(username: string, password: string): { token: string }
  
  // Editais
  getEditals(): EditalResponse[]
  
  // Métricas
  getEngagementMetrics(): EngagementMetricsResponse
  getMessages(editalId?: string): Message[]
  
  // Conversas
  getSessions(limit: number, offset: number): ConversationSession[]
  getSessionDetail(sessionId: string): ConversationSession
  searchSessions(email?: string, userId?: string): ConversationSession[]
}
```

**Dados Mock:**

```typescript
// Editais simulados
const mockEditals = [
  {
    id: '1',
    title: 'Edital 001/2024',
    description: 'Chamada pública...',
    status: 'open',
    metadata: { prazo: '31/01/2024' },
    files: { main_pdf: 'url', annexes: [], results: [] }
  }
]

// Métricas simuladas
const mockMetrics = {
  total_messages: 760,
  total_users: 111,
  total_editals: 5,
  editals: [...]
}

// Conversas simuladas
const mockSessions = [
  {
    id: 'sess_001',
    userId: 'user_1',
    userEmail: 'maria@example.com',
    startTime: '2024-01-15T14:00:00Z',
    messageCount: 8,
    messages: [...]
  }
]
```

### 4. Edital Service (edital.service.ts)

**Responsabilidades:**
- Criar, atualizar, listar e deletar editais
- Fazer upload de arquivos PDF
- Transformar dados do formulário para payload da API

**Interface:**

```typescript
interface EditalFormData {
  title: string
  description: string
  status: 'open' | 'closed' | 'draft'
  dynamicFields: Array<{ id: string; key: string; value: string }>
  mainPDF?: UploadedFile
  annexes: UploadedFile[]
  results: UploadedFile[]
}

interface EditalPayload {
  title: string
  description: string
  status: string
  metadata: Record<string, string>
  files: {
    mainPDF?: { name: string; originalName: string }
    annexes: Array<{ id: string; name: string; originalName: string }>
    results: Array<{ id: string; name: string; originalName: string }>
  }
}

export const editalService = {
  async createEdital(formData: EditalFormData): Promise<EditalResponse>
  async updateEdital(id: string, formData: EditalFormData): Promise<EditalResponse>
  async getEditals(): Promise<EditalResponse[]>
  async getEdital(id: string): Promise<EditalResponse>
  async deleteEdital(id: string): Promise<void>
  async uploadFile(editalId: string, file: File, type: 'main' | 'annexe' | 'result'): Promise<{ url: string }>
}
```

**Payload Transformation:**

```typescript
// Formulário → API
function transformToPayload(formData: EditalFormData): EditalPayload {
  return {
    title: formData.title,
    description: formData.description,
    status: formData.status,
    // Campos dinâmicos viram objeto metadata
    metadata: formData.dynamicFields.reduce((acc, field) => ({
      ...acc,
      [field.key]: field.value
    }), {}),
    // Arquivos com informações de nome
    files: {
      mainPDF: formData.mainPDF ? {
        name: formData.mainPDF.name,
        originalName: formData.mainPDF.originalName
      } : undefined,
      annexes: formData.annexes.map(f => ({
        id: f.id,
        name: f.name,
        originalName: f.originalName
      })),
      results: formData.results.map(f => ({
        id: f.id,
        name: f.name,
        originalName: f.originalName
      }))
    }
  }
}
```

### 5. Auth Store (auth.ts)

**Responsabilidades:**
- Gerenciar estado de autenticação
- Persistir tokens e usuário no localStorage
- Fornecer getters para estado de autenticação

**Interface:**

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false
  }),
  
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(credentials: LoginCredentials): Promise<void>
    async logout(): Promise<void>
    setTokens(tokens: AuthTokens): void
    setUser(user: User): void
    loadFromStorage(): void
  }
})
```

**Persistência:**

```typescript
// Ao fazer login
localStorage.setItem('access_token', tokens.access)
localStorage.setItem('refresh_token', tokens.refresh)
localStorage.setItem('user', JSON.stringify(user))

// Ao carregar app
const token = localStorage.getItem('access_token')
const user = JSON.parse(localStorage.getItem('user') || 'null')
if (token && user) {
  this.setTokens({ access: token, refresh: refreshToken })
  this.setUser(user)
  this.isAuthenticated = true
}

// Ao fazer logout
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
localStorage.removeItem('user')
```

## Data Models

### User

```typescript
interface User {
  id: string
  email: string
  name: string
}
```

### Edital

```typescript
interface EditalResponse {
  id: string
  title: string
  description: string
  status: 'open' | 'closed' | 'draft'
  metadata: Record<string, string>
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
  files: {
    main_pdf?: string // URL
    annexes: Array<{
      id: string
      name: string
      url: string
    }>
    results: Array<{
      id: string
      name: string
      url: string
    }>
  }
}
```

### Engagement Metrics

```typescript
interface EngagementMetricsResponse {
  total_messages: number
  total_users: number
  total_editals: number
  editals: Array<{
    id: string
    title: string
    message_count: number
    unique_users: number
    last_message: string // ISO 8601 date
  }>
}
```

### Message

```typescript
interface Message {
  id: string
  user_id: string
  user_email: string
  question: string
  bot_response: string
  timestamp: string // ISO 8601
  edital_id?: string
}
```

### Conversation Session

```typescript
interface ConversationSession {
  id: string
  user_id: string
  user_email: string
  start_time: string // ISO 8601
  end_time: string // ISO 8601
  message_count: number
  edital?: string
  messages?: Array<{
    id: string
    role: 'user' | 'bot'
    content: string
    timestamp: string // ISO 8601
  }>
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Configuration Properties

**Property 1: Base URL Configuration**
*For any* valid URL string, when set as VITE_API_BASE_URL, all API requests should use that URL as the base path.
**Validates: Requirements 1.1**

**Property 2: Token Header Injection**
*For any* API request when an access_token exists in localStorage, the request should include an Authorization header with "Bearer {token}".
**Validates: Requirements 3.1**

### Authentication Properties

**Property 3: Login Token Storage**
*For any* successful login response containing tokens, both access_token and refresh_token should be stored in localStorage.
**Validates: Requirements 2.2**

**Property 4: Login User Storage**
*For any* successful login response containing user data, the user object should be stored in localStorage.
**Validates: Requirements 2.3**

**Property 5: Login Redirect**
*For any* successful login, the application should navigate to the home page.
**Validates: Requirements 2.4**

**Property 6: Invalid Credentials Error**
*For any* login attempt with invalid credentials, the system should display an error message to the user.
**Validates: Requirements 2.5**

**Property 7: Token Refresh on 401**
*For any* API request that returns 401 when a refresh_token exists, the system should attempt to refresh the access_token before failing.
**Validates: Requirements 3.3, 4.1**

**Property 8: Request Retry After Refresh**
*For any* original request that failed with 401, after successful token refresh, the original request should be retried with the new token.
**Validates: Requirements 3.4**

**Property 9: Token Refresh Queue**
*For any* set of concurrent requests that all fail with 401, only one token refresh request should be made, and all failed requests should be queued and retried after refresh.
**Validates: Requirements 4.4**

**Property 10: Refresh Token Update**
*For any* successful token refresh response, the new access_token should be stored in localStorage.
**Validates: Requirements 4.3**

**Property 11: Logout Cleanup**
*For any* logout action, all authentication data (access_token, refresh_token, user) should be removed from localStorage.
**Validates: Requirements 12.1, 12.2, 12.3**

**Property 12: Logout Redirect**
*For any* completed logout, the application should navigate to the login page.
**Validates: Requirements 12.4**

**Property 13: Logout Store Cleanup**
*For any* completed logout, all Pinia stores should be reset to initial state.
**Validates: Requirements 12.5**

### Edital Management Properties

**Property 14: Edital Creation Payload**
*For any* valid edital form data, the payload sent to the API should include title, description, status, metadata object, and files object.
**Validates: Requirements 5.1**

**Property 15: Dynamic Fields Serialization**
*For any* set of dynamic fields in the form, they should be serialized as key-value pairs in the metadata object.
**Validates: Requirements 5.2**

**Property 16: File Information Inclusion**
*For any* files included in the edital form, the payload should include name and originalName for each file.
**Validates: Requirements 5.3**

**Property 17: Edital Response Processing**
*For any* successful edital creation response, the frontend should process and store the returned edital with ID and timestamps.
**Validates: Requirements 5.4**

**Property 18: Edital Error Display**
*For any* failed edital creation, the frontend should display the error message returned by the backend.
**Validates: Requirements 5.5**

### File Upload Properties

**Property 19: File Validation**
*For any* file selected for upload, the system should validate its type and size before proceeding.
**Validates: Requirements 6.1**

**Property 20: FormData Creation**
*For any* valid file and upload type (main, annexe, result), the system should create FormData with both the file and type.
**Validates: Requirements 6.2**

**Property 21: Upload Request Format**
*For any* file upload to an edital, the request should be sent to /edital/edital/{id}/upload/ with Content-Type multipart/form-data.
**Validates: Requirements 6.3**

**Property 22: Upload Response Processing**
*For any* successful file upload, the frontend should process and store the returned file URL.
**Validates: Requirements 6.4**

**Property 23: Upload Error Handling**
*For any* failed file upload, the system should display an error message and provide a retry option.
**Validates: Requirements 6.5**

### Metrics Properties

**Property 24: Metrics Display**
*For any* valid engagement metrics response, the frontend should display total_messages, total_users, and total_editals.
**Validates: Requirements 7.2**

**Property 25: Edital Metrics List**
*For any* engagement metrics response containing an editals array, the frontend should display each edital with title, message count, and unique users.
**Validates: Requirements 7.3**

**Property 26: Edital Filtering**
*For any* edital selected by the user, the metrics should be filtered to show only data for that edital.
**Validates: Requirements 7.4**

**Property 27: Metrics Error Handling**
*For any* error in metrics request, the system should display an error message and retry option.
**Validates: Requirements 7.5**

**Property 28: Message Filter Parameter**
*For any* edital ID used to filter messages, the request should include edital_id as a query parameter.
**Validates: Requirements 8.2**

**Property 29: Message List Display**
*For any* valid messages response, the frontend should display user_email, question, bot_response, and timestamp for each message.
**Validates: Requirements 8.3**

**Property 30: Message Error Handling**
*For any* error in messages request, the system should display an error message with retry option.
**Validates: Requirements 8.5**

### History Properties

**Property 31: Session List Pagination**
*For any* combination of limit and offset values, the history request should include both as query parameters.
**Validates: Requirements 9.1**

**Property 32: Session List Display**
*For any* valid sessions response, the frontend should display user_email, start_time, message_count, and edital for each session.
**Validates: Requirements 9.2**

**Property 33: Session Detail Request**
*For any* session ID clicked by the user, the system should request details from /discussao/conversa/{id}/.
**Validates: Requirements 9.3**

**Property 34: Session Messages Display**
*For any* valid session detail response, the frontend should display all messages with role, content, and timestamp.
**Validates: Requirements 9.4**

**Property 35: Session Email Filter**
*For any* email used to search sessions, the request should include email as a query parameter.
**Validates: Requirements 9.5**

### Mock Mode Properties

**Property 36: Mock Request Interception**
*For any* API request when VITE_USE_MOCK is 'true', the request should be intercepted and handled by Mock Service instead of reaching the real backend.
**Validates: Requirements 10.1**

### Response Structure Properties

**Property 37: Success Response Structure**
*For any* successful API response, it should include a success field set to true and a data field with the payload.
**Validates: Requirements 13.1, 13.2**

**Property 38: Error Response Structure**
*For any* error API response, it should include a success field set to false and an error field with a descriptive message.
**Validates: Requirements 13.3, 13.4**

**Property 39: Timestamp Format**
*For any* timestamp in API responses, it should be in ISO 8601 UTC format.
**Validates: Requirements 13.5**

### Logging Properties

**Property 40: Mock Request Logging**
*For any* request in mock mode, the system should log the request details to the console.
**Validates: Requirements 14.1**

**Property 41: Request Failure Logging**
*For any* failed API request, the system should log the complete error with URL, method, and payload.
**Validates: Requirements 14.2**

**Property 42: Token Refresh Logging**
*For any* token refresh attempt, the system should log the refresh attempt.
**Validates: Requirements 14.3**

**Property 43: Network Error Logging**
*For any* network error, the system should log the connection failure details.
**Validates: Requirements 14.5**

## Error Handling

### Error Categories

```typescript
enum ErrorType {
  VALIDATION = 400,      // Dados inválidos
  UNAUTHORIZED = 401,    // Não autenticado ou token inválido
  FORBIDDEN = 403,       // Sem permissão
  NOT_FOUND = 404,       // Recurso não encontrado
  SERVER_ERROR = 500,    // Erro interno do servidor
  NETWORK_ERROR = 0,     // Erro de conexão
  TIMEOUT = -1           // Timeout da requisição
}
```

### Error Handling Strategy

```typescript
// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 401 - Token refresh flow
    if (error.response?.status === 401) {
      return handleTokenRefresh(error)
    }
    
    // 400 - Validation error
    if (error.response?.status === 400) {
      const message = error.response.data?.error || 'Dados inválidos'
      showError(message)
      return Promise.reject(error)
    }
    
    // 404 - Not found
    if (error.response?.status === 404) {
      showError('Recurso não encontrado')
      return Promise.reject(error)
    }
    
    // 500 - Server error
    if (error.response?.status === 500) {
      showError('Erro no servidor, tente novamente')
      return Promise.reject(error)
    }
    
    // Network error
    if (!error.response) {
      showError('Erro de conexão, verifique sua internet')
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)
```

### User-Facing Error Messages

```typescript
const ERROR_MESSAGES = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Credenciais inválidas. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  500: 'Erro no servidor. Tente novamente mais tarde.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  TIMEOUT: 'A requisição demorou muito. Tente novamente.'
}
```

### Retry Logic

```typescript
// Apenas para erros de rede e timeout
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      if (isNetworkError(error) || isTimeout(error)) {
        await sleep(delay * (i + 1)) // Exponential backoff
        continue
      }
      throw error // Não retry para outros erros
    }
  }
  throw new Error('Max retries reached')
}
```

## Testing Strategy

### Unit Testing

Utilizaremos **Vitest** como framework de testes unitários para o Vue.js 3.

**Áreas de Cobertura:**

1. **API Client**
   - Configuração de base URL
   - Adição de headers de autenticação
   - Interceptação de respostas 401
   - Gerenciamento de fila de requisições
   - Roteamento para mock service

2. **Auth Service**
   - Login com credenciais válidas/inválidas
   - Logout e limpeza de dados
   - Refresh de tokens
   - Obtenção de usuário atual

3. **Edital Service**
   - Transformação de form data para payload
   - Criação e atualização de editais
   - Upload de arquivos
   - Validação de arquivos

4. **Stores (Pinia)**
   - Atualização de estado de autenticação
   - Persistência em localStorage
   - Limpeza de estado no logout

5. **Mock Service**
   - Retorno de dados simulados
   - Simulação de erros
   - Cobertura de todos os endpoints

**Exemplo de Teste Unitário:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiClient } from '@/common/api/client'

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })
  
  it('should add Authorization header when token exists', async () => {
    localStorage.setItem('access_token', 'test-token')
    
    const mockAxios = vi.spyOn(apiClient['instance'], 'get')
    await apiClient.get('/test')
    
    expect(mockAxios).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    )
  })
  
  it('should refresh token on 401 response', async () => {
    localStorage.setItem('access_token', 'old-token')
    localStorage.setItem('refresh_token', 'refresh-token')
    
    // Mock 401 response then success
    const mockAxios = vi.spyOn(apiClient['instance'], 'get')
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({ data: { success: true } })
    
    const mockRefresh = vi.spyOn(apiClient['instance'], 'post')
      .mockResolvedValueOnce({ data: { access: 'new-token' } })
    
    await apiClient.get('/test')
    
    expect(mockRefresh).toHaveBeenCalledWith('/auth/refresh/', {
      refresh: 'refresh-token'
    })
    expect(localStorage.getItem('access_token')).toBe('new-token')
  })
})
```

### Property-Based Testing

Utilizaremos **fast-check** como biblioteca de property-based testing para TypeScript.

**Configuração:**

```bash
npm install --save-dev fast-check
```

Cada property-based test deve rodar no mínimo **100 iterações** para garantir cobertura adequada de casos aleatórios.

**Áreas de Cobertura:**

1. **Configuration Properties** (Properties 1-2)
2. **Authentication Properties** (Properties 3-13)
3. **Edital Management Properties** (Properties 14-18)
4. **File Upload Properties** (Properties 19-23)
5. **Metrics Properties** (Properties 24-30)
6. **History Properties** (Properties 31-35)
7. **Mock Mode Properties** (Property 36)
8. **Response Structure Properties** (Properties 37-39)
9. **Logging Properties** (Properties 40-43)

**Exemplo de Property-Based Test:**

```typescript
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { apiClient } from '@/common/api/client'

describe('Property-Based Tests', () => {
  it('Property 1: Base URL Configuration', () => {
    /**
     * Feature: django-backend-integration, Property 1: Base URL Configuration
     * For any valid URL string, when set as VITE_API_BASE_URL,
     * all API requests should use that URL as the base path.
     */
    fc.assert(
      fc.property(
        fc.webUrl(), // Gera URLs válidas aleatórias
        (baseUrl) => {
          // Configura cliente com URL
          const client = new ApiClient(baseUrl)
          
          // Verifica que a URL base está configurada
          expect(client.getBaseURL()).toBe(baseUrl)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('Property 15: Dynamic Fields Serialization', () => {
    /**
     * Feature: django-backend-integration, Property 15: Dynamic Fields Serialization
     * For any set of dynamic fields in the form, they should be serialized
     * as key-value pairs in the metadata object.
     */
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            key: fc.string({ minLength: 1, maxLength: 50 }),
            value: fc.string({ maxLength: 1000 })
          })
        ),
        (dynamicFields) => {
          const payload = transformToPayload({ dynamicFields, /* ... */ })
          
          // Verifica que cada campo está no metadata
          dynamicFields.forEach(field => {
            expect(payload.metadata[field.key]).toBe(field.value)
          })
          
          // Verifica que não há campos extras
          expect(Object.keys(payload.metadata).length).toBe(dynamicFields.length)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('Property 9: Token Refresh Queue', () => {
    /**
     * Feature: django-backend-integration, Property 9: Token Refresh Queue
     * For any set of concurrent requests that all fail with 401,
     * only one token refresh request should be made.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }), // Número de requisições concorrentes
        async (numRequests) => {
          localStorage.setItem('refresh_token', 'refresh-token')
          
          // Mock para contar chamadas de refresh
          let refreshCallCount = 0
          const mockRefresh = vi.spyOn(apiClient['instance'], 'post')
            .mockImplementation(async () => {
              refreshCallCount++
              return { data: { access: 'new-token' } }
            })
          
          // Mock 401 para todas as requisições
          vi.spyOn(apiClient['instance'], 'get')
            .mockRejectedValue({ response: { status: 401 } })
          
          // Faz múltiplas requisições concorrentes
          const promises = Array(numRequests).fill(null).map(() =>
            apiClient.get('/test').catch(() => {})
          )
          
          await Promise.all(promises)
          
          // Verifica que apenas um refresh foi feito
          expect(refreshCallCount).toBe(1)
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Integration Testing

**Escopo:**

1. **Fluxo completo de autenticação**
   - Login → Requisição autenticada → Token expira → Refresh → Requisição bem-sucedida

2. **Fluxo de criação de edital**
   - Preencher formulário → Criar edital → Upload de arquivos → Verificar persistência

3. **Fluxo de visualização de métricas**
   - Carregar métricas → Filtrar por edital → Visualizar mensagens

4. **Modo mock vs modo real**
   - Alternar entre modos → Verificar comportamento consistente

### Test Coverage Goals

- **Unit Tests**: 80% de cobertura de código
- **Property-Based Tests**: 100% das propriedades de corretude
- **Integration Tests**: Cobertura dos fluxos principais de usuário

## Security Considerations

### 1. Token Storage

**Decisão:** Armazenar tokens no localStorage (não em cookies)

**Justificativa:**
- Aplicação SPA sem SSR
- Necessidade de acesso JavaScript aos tokens
- CORS configurado adequadamente no backend
- Tokens JWT com expiração curta (1h para access, 7d para refresh)

**Mitigações:**
- HTTPS obrigatório em produção
- Content Security Policy (CSP) configurado
- Sanitização de inputs para prevenir XSS
- Tokens com tempo de expiração curto

### 2. CORS Configuration

**Backend Django deve configurar:**

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Desenvolvimento
    "https://app.exemplo.com"  # Produção
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
]
```

### 3. Input Validation

**Frontend:**
- Validação de tipos de arquivo (apenas PDF)
- Validação de tamanho de arquivo (max 10MB)
- Sanitização de campos de texto
- Validação de formato de email

**Backend:**
- Validação adicional de todos os inputs
- Sanitização de SQL (via ORM)
- Rate limiting
- CSRF protection

### 4. Error Messages

**Não expor informações sensíveis:**
- ❌ "Usuário admin@example.com não encontrado"
- ✅ "Credenciais inválidas"

**Logar detalhes apenas no servidor:**
- Frontend: mensagens genéricas
- Backend: logs detalhados com stack traces

## Performance Optimization

### 1. Request Optimization

```typescript
// Debounce para buscas
const debouncedSearch = debounce(async (query: string) => {
  const results = await apiClient.get(`/search?q=${query}`)
  return results
}, 300)

// Cancelamento de requisições
const cancelToken = axios.CancelToken.source()
apiClient.get('/data', { cancelToken: cancelToken.token })
// Se usuário navega para outra página
cancelToken.cancel('Navigation')
```

### 2. Caching Strategy

```typescript
// Cache simples em memória para dados que mudam pouco
const cache = new Map<string, { data: any; timestamp: number }>()

async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000 // 1 minuto
): Promise<T> {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  
  const data = await fetcher()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

// Uso
const editals = await getCachedData(
  'editals',
  () => apiClient.get('/edital/edital/'),
  300000 // 5 minutos
)
```

### 3. Lazy Loading

```typescript
// Rotas com lazy loading
const routes = [
  {
    path: '/metrics',
    component: () => import('@/modules/metricas/views/MetricsPage.vue')
  },
  {
    path: '/history',
    component: () => import('@/modules/historico/views/HistoryPage.vue')
  }
]
```

### 4. Pagination

```typescript
// Paginação para listas grandes
interface PaginationParams {
  limit: number
  offset: number
}

async function getSessionsPaginated(params: PaginationParams) {
  return apiClient.get(
    `/discussao/conversa/?limit=${params.limit}&offset=${params.offset}`
  )
}

// Infinite scroll
const loadMore = async () => {
  const newSessions = await getSessionsPaginated({
    limit: 50,
    offset: sessions.value.length
  })
  sessions.value.push(...newSessions)
}
```

## Deployment Configuration

### Environment Variables

**Development (.env.development):**
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=false
```

**Staging (.env.staging):**
```bash
VITE_API_BASE_URL=https://staging-api.exemplo.com
VITE_USE_MOCK=false
```

**Production (.env.production):**
```bash
VITE_API_BASE_URL=https://api.exemplo.com
VITE_USE_MOCK=false
```

**Mock Mode (.env.mock):**
```bash
VITE_API_BASE_URL=
VITE_USE_MOCK=true
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      // Proxy para desenvolvimento sem CORS
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'axios': ['axios'],
          'ui': ['@/common/components/ui']
        }
      }
    }
  }
})
```

## Monitoring and Logging

### Frontend Logging

```typescript
// Logger service
class Logger {
  private isDevelopment = import.meta.env.DEV
  
  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data)
    }
  }
  
  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error)
    // Em produção, enviar para serviço de monitoramento
    if (!this.isDevelopment) {
      this.sendToMonitoring({ level: 'error', message, error })
    }
  }
  
  warn(message: string, data?: any) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data)
    }
  }
  
  private sendToMonitoring(log: any) {
    // Integração com Sentry, LogRocket, etc.
  }
}

export const logger = new Logger()
```

### Request Logging

```typescript
// Request interceptor com logging
instance.interceptors.request.use((config) => {
  logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    params: config.params,
    data: config.data
  })
  return config
})

// Response interceptor com logging
instance.interceptors.response.use(
  (response) => {
    logger.info(`API Response: ${response.config.url}`, {
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    logger.error(`API Error: ${error.config?.url}`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    return Promise.reject(error)
  }
)
```

## Future Enhancements

### 1. WebSocket Support

Para notificações em tempo real:

```typescript
class WebSocketClient {
  private ws: WebSocket | null = null
  
  connect(token: string) {
    this.ws = new WebSocket(`wss://api.exemplo.com/ws?token=${token}`)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }
  }
  
  private handleMessage(data: any) {
    // Atualizar stores com novos dados
    if (data.type === 'new_message') {
      // Atualizar lista de mensagens
    }
  }
}
```

### 2. Offline Support

Service Worker para cache de requisições:

```typescript
// service-worker.ts
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

### 3. Request Batching

Agrupar múltiplas requisições:

```typescript
class RequestBatcher {
  private queue: Array<{ url: string; resolve: Function }> = []
  private timer: NodeJS.Timeout | null = null
  
  add(url: string): Promise<any> {
    return new Promise((resolve) => {
      this.queue.push({ url, resolve })
      
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 50)
      }
    })
  }
  
  private async flush() {
    const batch = this.queue.splice(0)
    const urls = batch.map(item => item.url)
    
    const results = await apiClient.post('/batch', { urls })
    
    batch.forEach((item, index) => {
      item.resolve(results[index])
    })
    
    this.timer = null
  }
}
```

### 4. GraphQL Migration

Considerar migração para GraphQL para queries mais eficientes:

```typescript
// Exemplo de query GraphQL
const GET_EDITAL = gql`
  query GetEdital($id: ID!) {
    edital(id: $id) {
      id
      title
      description
      files {
        mainPdf
        annexes {
          name
          url
        }
      }
    }
  }
`
```

## Conclusion

Este design fornece uma arquitetura robusta e escalável para integração entre o frontend Vue.js 3 e o backend Django. As principais características incluem:

1. **Autenticação segura** com JWT e refresh automático
2. **Tratamento robusto de erros** com mensagens claras ao usuário
3. **Modo mock** para desenvolvimento offline
4. **Testes abrangentes** com unit tests e property-based tests
5. **Performance otimizada** com caching e lazy loading
6. **Segurança** com validação de inputs e HTTPS
7. **Monitoramento** com logging estruturado

A implementação seguirá as tarefas definidas no documento de tasks, garantindo que cada componente seja desenvolvido e testado de forma incremental.
