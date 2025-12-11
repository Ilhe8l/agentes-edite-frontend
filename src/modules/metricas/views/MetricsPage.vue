<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Button variant="ghost" size="sm" @click="router.push('/')">
              ← Voltar
            </Button>
            <h1 class="text-2xl font-bold text-gray-900">Métricas e Análises</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ authStore.user?.name }}</span>
            <Button variant="outline" size="sm" @click="handleLogout">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Info Alert -->
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Alert class="flex-1">
            <p class="text-sm">
              <strong>Dica:</strong> Visualize as métricas de mensagens e conversas ao longo do tempo e por edital.
              <span v-if="cacheStatus" class="text-xs text-gray-500 ml-2">
                (Cache: {{ Object.keys(cacheStatus).length }} itens)
              </span>
              <span v-if="selectedEmailFrequency" class="text-xs text-blue-600 ml-2">
                📧 Relatório {{ selectedEmailFrequency }} configurado
              </span>
            </p>
          </Alert>
          <div class="flex gap-2 flex-shrink-0 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              @click="clearCache"
              :disabled="isLoading"
              class="text-xs"
            >
              🗑️ Limpar Cache
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              @click="loadAllMetrics"
              :disabled="isLoading"
              class="text-xs"
            >
              🔄 Atualizar
            </Button>
            
            <!-- Dropdown de Relatório por Email -->
            <div class="relative">
              <Button 
                variant="outline" 
                size="sm" 
                @click="toggleEmailReportDropdown"
                :disabled="isLoading"
                class="text-xs"
              >
                📧 Relatório Email
                <svg class="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              <!-- Dropdown Menu -->
              <div 
                v-if="showEmailReportDropdown" 
                class="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
              >
                <div class="py-2">
                  <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Frequência do Relatório
                  </div>
                  <button
                    @click="selectEmailFrequency('semanal')"
                    class="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    :class="{ 'bg-blue-50 text-blue-700': selectedEmailFrequency === 'semanal' }"
                  >
                    <span class="mr-3">📅</span>
                    <div>
                      <div class="font-medium">Semanal</div>
                      <div class="text-xs text-gray-500">Toda segunda-feira</div>
                    </div>
                  </button>
                  <button
                    @click="selectEmailFrequency('quinzenal')"
                    class="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    :class="{ 'bg-blue-50 text-blue-700': selectedEmailFrequency === 'quinzenal' }"
                  >
                    <span class="mr-3">📆</span>
                    <div>
                      <div class="font-medium">Quinzenal</div>
                      <div class="text-xs text-gray-500">A cada 15 dias</div>
                    </div>
                  </button>
                  <button
                    @click="selectEmailFrequency('mensal')"
                    class="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    :class="{ 'bg-blue-50 text-blue-700': selectedEmailFrequency === 'mensal' }"
                  >
                    <span class="mr-3">🗓️</span>
                    <div>
                      <div class="font-medium">Mensal</div>
                      <div class="text-xs text-gray-500">Todo dia 1º do mês</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          <Card class="hover:shadow-lg transition-shadow duration-200">
            <CardContent class="p-4 lg:p-6">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">
                    Total de Mensagens
                  </p>
                  <p class="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {{ isLoading ? '...' : generalStats?.totalMessages || 0 }}
                  </p>
                </div>
                <div class="p-2 lg:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-3">
                  <svg class="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="hover:shadow-lg transition-shadow duration-200">
            <CardContent class="p-4 lg:p-6">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">
                    Total de Conversas
                  </p>
                  <p class="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {{ isLoading ? '...' : generalStats?.totalConversations || 0 }}
                  </p>
                </div>
                <div class="p-2 lg:p-3 bg-green-100 rounded-full flex-shrink-0 ml-3">
                  <svg class="h-6 w-6 lg:h-8 lg:w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="hover:shadow-lg transition-shadow duration-200">
            <CardContent class="p-4 lg:p-6">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">
                    Usuários Únicos
                  </p>
                  <p class="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {{ isLoading ? '...' : generalStats?.uniqueUsers || 0 }}
                  </p>
                </div>
                <div class="p-2 lg:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-3">
                  <svg class="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="hover:shadow-lg transition-shadow duration-200">
            <CardContent class="p-4 lg:p-6">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">
                    Total de Editais
                  </p>
                  <p class="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {{ isLoading ? '...' : generalStats?.totalEditals || 0 }}
                  </p>
                </div>
                <div class="p-2 lg:p-3 bg-orange-100 rounded-full flex-shrink-0 ml-3">
                  <svg class="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="hover:shadow-lg transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
            <CardContent class="p-4 lg:p-6">
              <div class="flex items-center justify-between">
                <div class="min-w-0 flex-1">
                  <p class="text-xs lg:text-sm font-medium text-gray-600 mb-1 lg:mb-2">
                    Média Msgs/Conversa
                  </p>
                  <p class="text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {{ isLoading ? '...' : generalStats?.averageMessagesPerConversation || 0 }}
                  </p>
                </div>
                <div class="p-2 lg:p-3 bg-indigo-100 rounded-full flex-shrink-0 ml-3">
                  <svg class="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <!-- Messages Time Series Chart -->
          <Card class="hover:shadow-lg transition-shadow duration-200">
            <CardHeader class="pb-3 lg:pb-4">
              <CardTitle class="text-lg lg:text-xl">Mensagens ao Longo do Tempo</CardTitle>
              <CardDescription class="text-sm">Quantidade de mensagens por dia</CardDescription>
            </CardHeader>
            <CardContent class="p-4 lg:p-6">
              <div v-if="isLoading" class="h-48 lg:h-64 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <LineChart
                v-else-if="messagesTimeSeries.length > 0"
                :data="messagesTimeSeries"
                :height="screenWidth < 1024 ? 250 : 300"
                color="#3B82F6"
              />
              <div v-else class="h-48 lg:h-64 flex items-center justify-center text-gray-500">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p class="text-sm">Nenhum dado disponível</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Conversations Time Series Chart -->
          <Card class="hover:shadow-lg transition-shadow duration-200">
            <CardHeader class="pb-3 lg:pb-4">
              <CardTitle class="text-lg lg:text-xl">Conversas ao Longo do Tempo</CardTitle>
              <CardDescription class="text-sm">Quantidade de conversas iniciadas por dia</CardDescription>
            </CardHeader>
            <CardContent class="p-4 lg:p-6">
              <div v-if="isLoading" class="h-48 lg:h-64 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
              <LineChart
                v-else-if="conversationsTimeSeries.length > 0"
                :data="conversationsTimeSeries"
                :height="screenWidth < 1024 ? 250 : 300"
                color="#10B981"
              />
              <div v-else class="h-48 lg:h-64 flex items-center justify-center text-gray-500">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <p class="text-sm">Nenhum dado disponível</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Edital Distribution Chart -->
        <Card class="hover:shadow-lg transition-shadow duration-200">
          <CardHeader class="pb-3 lg:pb-4">
            <CardTitle class="text-lg lg:text-xl">Distribuição de Mensagens por Edital</CardTitle>
            <CardDescription class="text-sm">Quantidade de mensagens relacionadas a cada edital</CardDescription>
          </CardHeader>
          <CardContent class="p-4 lg:p-6">
            <div v-if="isLoading" class="h-80 lg:h-96 flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <PieChart
              v-else-if="editalDistribution.length > 0"
              :data="editalDistribution"
              :height="screenWidth < 1024 ? 320 : 400"
            />
            <div v-else class="h-80 lg:h-96 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p class="text-sm">Nenhum dado disponível</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/common/store/auth'
import { useUiStore } from '@/common/store/ui'
import { metricsService } from '@/services/metrics.service'
import Card from '@/common/components/ui/Card.vue'
import CardHeader from '@/common/components/ui/CardHeader.vue'
import CardTitle from '@/common/components/ui/CardTitle.vue'
import CardDescription from '@/common/components/ui/CardDescription.vue'
import CardContent from '@/common/components/ui/CardContent.vue'
import Button from '@/common/components/ui/Button.vue'
import Alert from '@/common/components/ui/Alert.vue'
import LineChart from '@/modules/metricas/components/LineChart.vue'
import PieChart from '@/modules/metricas/components/PieChart.vue'
import type { TimeSeriesData, EditalDistribution } from '@/services/metrics.service'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const generalStats = ref<any>(null)
const messagesTimeSeries = ref<TimeSeriesData[]>([])
const conversationsTimeSeries = ref<TimeSeriesData[]>([])
const editalDistribution = ref<EditalDistribution[]>([])
const isLoading = ref(false)
const cacheStatus = ref<any>(null)
const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const showEmailReportDropdown = ref(false)
const selectedEmailFrequency = ref<string | null>(null)

const loadAllMetrics = async () => {
  isLoading.value = true
  try {
    console.log('[i] Carregando todas as métricas...')
    
    // Carregar todos os dados de uma vez (otimizado)
    const { messages, conversations, editals } = await metricsService.getAllData()
    
    // Processar métricas localmente (mais rápido que fazer múltiplas chamadas)
    const stats = {
      totalMessages: messages.length,
      totalConversations: conversations.length,
      totalEditals: editals.length,
      uniqueUsers: new Set(conversations.map(c => c.questionador.contato)).size,
      averageMessagesPerConversation: conversations.length > 0 
        ? Math.round((messages.length / conversations.length) * 100) / 100 
        : 0
    }
    
    // Processar séries temporais
    const messagesSeries = processMessagesTimeSeries(messages)
    const conversationsSeries = processConversationsTimeSeries(conversations)
    const distribution = processEditalDistribution(messages, editals)

    generalStats.value = stats
    messagesTimeSeries.value = messagesSeries
    conversationsTimeSeries.value = conversationsSeries
    editalDistribution.value = distribution

    // Atualizar status do cache
    cacheStatus.value = metricsService.getCacheStatus()

    console.log('[*] Métricas carregadas:', {
      stats,
      messagesSeries: messagesSeries.length,
      conversationsSeries: conversationsSeries.length,
      distribution: distribution.length,
      cache: cacheStatus.value
    })

    uiStore.showToast({
      type: 'success',
      message: 'Métricas carregadas com sucesso',
    })
  } catch (error) {
    console.error('[x] Erro ao carregar métricas:', error)
    uiStore.showToast({
      type: 'error',
      message: 'Erro ao carregar métricas',
    })
  } finally {
    isLoading.value = false
  }
}

// Métodos de processamento local para otimizar performance
const processMessagesTimeSeries = (messages: any[]): TimeSeriesData[] => {
  const messagesByDate = new Map<string, number>()
  
  messages.forEach(message => {
    const date = new Date(message.criada_em).toISOString().split('T')[0]
    messagesByDate.set(date, (messagesByDate.get(date) || 0) + 1)
  })

  return Array.from(messagesByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const processConversationsTimeSeries = (conversations: any[]): TimeSeriesData[] => {
  const conversationsByDate = new Map<string, number>()
  
  conversations.forEach(conversation => {
    const date = new Date(conversation.iniciada_em).toISOString().split('T')[0]
    conversationsByDate.set(date, (conversationsByDate.get(date) || 0) + 1)
  })

  return Array.from(conversationsByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

const processEditalDistribution = (messages: any[], editals: any[]): EditalDistribution[] => {
  const editalMap = new Map<number, any>()
  editals.forEach(edital => {
    editalMap.set(edital.id, edital)
  })

  const editalCounts = new Map<number, { messageCount: number, conversationIds: Set<number> }>()
  
  messages.forEach(message => {
    message.itensdeconhecimento.forEach((item: any) => {
      if (!editalCounts.has(item.id)) {
        editalCounts.set(item.id, { messageCount: 0, conversationIds: new Set() })
      }
      const counts = editalCounts.get(item.id)!
      counts.messageCount++
      counts.conversationIds.add(message.conversa.id)
    })
  })

  return Array.from(editalCounts.entries())
    .map(([editalId, counts]) => {
      const edital = editalMap.get(editalId)
      return {
        editalId,
        // TODO: Usar edital.numero quando disponível na API ao invés de edital.nome
        editalName: edital?.nome || `Edital ${editalId}`,
        messageCount: counts.messageCount,
        conversationCount: counts.conversationIds.size
      }
    })
    .sort((a, b) => b.messageCount - a.messageCount)
}

const clearCache = () => {
  metricsService.clearCache()
  cacheStatus.value = metricsService.getCacheStatus()
  uiStore.showToast({
    type: 'success',
    message: 'Cache limpo com sucesso',
  })
}

const toggleEmailReportDropdown = () => {
  showEmailReportDropdown.value = !showEmailReportDropdown.value
}

const selectEmailFrequency = (frequency: string) => {
  selectedEmailFrequency.value = frequency
  showEmailReportDropdown.value = false
  
  console.log(`[i] Relatório por email selecionado: ${frequency}`)
  
  uiStore.showToast({
    type: 'info',
    message: `Relatório ${frequency} configurado! (Funcionalidade em desenvolvimento)`,
  })
}

const handleLogout = () => {
  authStore.logout()
  uiStore.showToast({
    type: 'success',
    message: 'Logout realizado com sucesso',
  })
  router.push('/login')
}

// Função para atualizar o tamanho da tela
const updateScreenWidth = () => {
  if (typeof window !== 'undefined') {
    screenWidth.value = window.innerWidth
  }
}

// Função para fechar dropdown ao clicar fora
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showEmailReportDropdown.value = false
  }
}

onMounted(() => {
  console.log('[i] Iniciando página de métricas...')
  
  // Configurar listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateScreenWidth)
    document.addEventListener('click', handleClickOutside)
    updateScreenWidth() // Atualizar valor inicial
  }
  
  loadAllMetrics()
})

onUnmounted(() => {
  // Limpar listeners
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateScreenWidth)
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
