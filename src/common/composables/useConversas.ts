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

  // Getters
  const hasMore = computed(() => {
    return conversas.value.length < total.value
  })

  const totalPages = computed(() => {
    return Math.ceil(total.value / perPage.value)
  })

  // Actions
  async function carregarConversas(page = 1, reset = false) {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      console.log('📱 Carregando conversas - página:', page)
      
      const response = await djangoService.getConversasAdaptadas(page, perPage.value)
      
      if (reset) {
        conversas.value = response.sessions
      } else {
        conversas.value.push(...response.sessions)
      }
      
      currentPage.value = response.meta.current_page
      total.value = response.meta.total
      
      console.log('✅ Conversas carregadas:', response.sessions.length, 'de', total.value)
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar conversas:', err)
      error.value = err.message || 'Erro ao carregar conversas'
    } finally {
      isLoading.value = false
    }
  }

  async function carregarMaisConversas() {
    if (!hasMore.value || isLoading.value) return
    
    await carregarConversas(currentPage.value + 1, false)
  }

  async function recarregarConversas() {
    currentPage.value = 1
    await carregarConversas(1, true)
  }

  async function carregarDetalhesConversa(conversaId: number) {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      console.log('🔍 Carregando detalhes da conversa:', conversaId)
      
      const conversa = await djangoService.getConversaCompleta(conversaId)
      conversaAtual.value = conversa
      
      console.log('✅ Detalhes carregados:', conversa.messageCount, 'mensagens')
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar detalhes:', err)
      error.value = err.message || 'Erro ao carregar detalhes da conversa'
    } finally {
      isLoading.value = false
    }
  }

  function limparConversaAtual() {
    conversaAtual.value = null
  }

  function buscarConversaPorId(id: string): ConversationSession | undefined {
    return conversas.value.find(c => c.id === id)
  }

  // Filtros e busca
  const filtrarPorUsuario = (email: string) => {
    return conversas.value.filter(c => 
      c.userEmail.toLowerCase().includes(email.toLowerCase())
    )
  }

  const filtrarPorPeriodo = (dataInicio: Date, dataFim: Date) => {
    return conversas.value.filter(c => {
      const dataConversa = new Date(c.startTime)
      return dataConversa >= dataInicio && dataConversa <= dataFim
    })
  }

  return {
    // Estado
    conversas: computed(() => conversas.value),
    conversaAtual: computed(() => conversaAtual.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentPage: computed(() => currentPage.value),
    perPage: computed(() => perPage.value),
    total: computed(() => total.value),
    hasMore,
    totalPages,

    // Actions
    carregarConversas,
    carregarMaisConversas,
    recarregarConversas,
    carregarDetalhesConversa,
    limparConversaAtual,
    buscarConversaPorId,
    filtrarPorUsuario,
    filtrarPorPeriodo
  }
}