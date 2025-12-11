import { ref, computed } from 'vue'
import { djangoService } from '@/common/api/django.service'
import type { ConversationSession, ConversationMessage } from '@/common/types/api.types'

export function useConversas() {
  // Estado
  const conversas = ref<ConversationSession[]>([])
  const conversaAtual = ref<ConversationSession | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const perPage = ref(10)
  const total = ref(0)
  
  // Estado para filtros
  const searchQuery = ref('')

  // Getters
  const hasMore = computed(() => {
    return currentPage.value < totalPages.value
  })

  const totalPages = computed(() => {
    return Math.ceil(total.value / perPage.value)
  })

  // Actions
  async function carregarConversas(page = 1, reset = true) {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      console.log('[i] Carregando conversas - página:', page)
      
      const response = await djangoService.getConversasAdaptadas(page, perPage.value)
      
      // Sempre resetar para paginação real (não acumulativa)
      conversas.value = response.sessions
      
      currentPage.value = response.meta.current_page
      total.value = response.meta.total
      
      console.log('[*] Conversas carregadas:', response.sessions.length, 'página', page, 'de', Math.ceil(total.value / perPage.value))
      
    } catch (err: any) {
      console.error('[x] Erro ao carregar conversas:', err)
      error.value = err.message || 'Erro ao carregar conversas'
    } finally {
      isLoading.value = false
    }
  }

  async function carregarProximaPagina() {
    if (!hasMore.value || isLoading.value) return
    
    await carregarConversas(currentPage.value + 1)
  }

  async function carregarPaginaAnterior() {
    if (currentPage.value <= 1 || isLoading.value) return
    
    await carregarConversas(currentPage.value - 1)
  }

  async function irParaPagina(page: number) {
    if (page < 1 || page > totalPages.value || isLoading.value) return
    
    await carregarConversas(page)
  }

  async function recarregarConversas() {
    await carregarConversas(currentPage.value)
  }

  async function carregarDetalhesConversa(conversaId: number) {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      console.log('[i] Carregando detalhes da conversa:', conversaId)
      
      const conversa = await djangoService.getConversaCompleta(conversaId)
      conversaAtual.value = conversa
      
      console.log('[*] Detalhes carregados:', conversa.messageCount, 'mensagens')
      
    } catch (err: any) {
      console.error('[x] Erro ao carregar detalhes:', err)
      error.value = err.message || 'Erro ao carregar detalhes da conversa'
    } finally {
      isLoading.value = false
    }
  }

  function limparConversaAtual() {
    conversaAtual.value = null
  }

  function buscarConversaPorId(id: string): ConversationSession | undefined {
    return conversas.value.find((c: ConversationSession) => c.id === id)
  }

  // Conversas filtradas
  const conversasFiltradas = computed(() => {
    let resultado = conversas.value
    
    // Filtrar por busca (telefone/contato)
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      resultado = resultado.filter((c: ConversationSession) => {
        const userEmail = c.userEmail?.toLowerCase() || ''
        const userId = c.userId?.toLowerCase() || ''
        const phoneOnly = c.userEmail?.replace(/\D/g, '') || ''
        
        return userEmail.includes(query) || 
               userId.includes(query) || 
               phoneOnly.includes(query.replace(/\D/g, ''))
      })
    }
    
    return resultado
  })

  // Filtros e busca (mantidos para compatibilidade)
  const filtrarPorUsuario = (email: string) => {
    searchQuery.value = email
    return conversasFiltradas.value
  }

  const filtrarPorPeriodo = (dataInicio: Date, dataFim: Date) => {
    return conversas.value.filter((c: ConversationSession) => {
      const dataConversa = new Date(c.startTime)
      return dataConversa >= dataInicio && dataConversa <= dataFim
    })
  }

  return {
    // Estado
    conversas: computed(() => conversas.value),
    conversasFiltradas,
    conversaAtual: computed(() => conversaAtual.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentPage: computed(() => currentPage.value),
    perPage: computed(() => perPage.value),
    total: computed(() => total.value),
    hasMore,
    totalPages,

    // Filtros
    searchQuery,

    // Actions
    carregarConversas,
    carregarProximaPagina,
    carregarPaginaAnterior,
    irParaPagina,
    recarregarConversas,
    carregarDetalhesConversa,
    limparConversaAtual,
    buscarConversaPorId,
    filtrarPorUsuario,
    filtrarPorPeriodo
  }
}