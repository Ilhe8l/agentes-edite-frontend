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
            <h1 class="text-2xl font-bold text-gray-900">Histórico de Conversas</h1>
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
        <Alert>
          <p class="text-sm">
            <strong>Dica:</strong> Use a busca para filtrar sessões por número de usuário. Clique em uma sessão para visualizar a conversa completa.
          </p>
        </Alert>

        <!-- Clear Selection Button -->
        <div v-if="selectedSessionId" class="flex justify-end">
          <Button variant="outline" @click="clearSelection">
            Limpar Seleção
          </Button>
        </div>

        <!-- Grid Layout com altura fixa -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-20px)]">
          <!-- Sessions List -->
          <div class="flex flex-col overflow-y-auto h-full">
            <SessionsList
              :sessions="sessions"
              :selected-session-id="selectedSessionId"
              :is-loading="isLoadingSessions"
              :current-page="currentPage"
              :total-pages="totalPages"
              :total-items="total"
              @session-select="handleSessionSelect"
              @search="handleSearch"
              @page-change="handlePageChange"
            />
          </div>

          <!-- Chat Viewer -->
          <div class="flex flex-col overflow-y-auto h-full">
            <ChatViewer
              :session="selectedSession"
              :is-loading="isLoadingSession"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/common/store/auth'
import { useUiStore } from '@/common/store/ui'
import { useConversas } from '@/common/composables/useConversas'
import Button from '@/common/components/ui/Button.vue'
import Alert from '@/common/components/ui/Alert.vue'
import SessionsList from '@/modules/historico/components/SessionsList.vue'
import ChatViewer from '@/modules/historico/components/ChatViewer.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Usar o composable de conversas com dados reais do Django
const {
  conversas,
  conversasFiltradas,
  conversaAtual,
  isLoading,
  error,
  currentPage,
  totalPages,
  total,
  searchQuery,
  carregarConversas,
  carregarDetalhesConversa,
  limparConversaAtual,
  irParaPagina,
  filtrarPorUsuario
} = useConversas()

const selectedSessionId = ref<string | null>(null)

// Computed properties para compatibilidade com o template
const sessions = computed(() => conversasFiltradas.value)
const selectedSession = computed(() => conversaAtual.value)
const isLoadingSessions = computed(() => isLoading.value)
const isLoadingSession = computed(() => isLoading.value)

const loadSessions = async (page = 1) => {
  try {
    console.log('[i] Carregando conversas do Django...')
    await carregarConversas(page)
    
    uiStore.showToast({
      type: 'success',
      message: `${conversas.value.length} conversas carregadas (página ${currentPage.value} de ${totalPages.value})`,
    })
  } catch (err: any) {
    console.error('[x] Erro ao carregar conversas:', err)
    uiStore.showToast({
      type: 'error',
      message: err.message || 'Erro ao carregar conversas do Django',
    })
  }
}

const loadSessionDetail = async (sessionId: string) => {
  try {
    console.log('[i] Carregando detalhes da conversa:', sessionId)
    await carregarDetalhesConversa(parseInt(sessionId))
    
    if (error.value) {
      throw new Error(error.value)
    }
    
    console.log('[*] Detalhes carregados com sucesso')
  } catch (err: any) {
    console.error('[x] Erro ao carregar detalhes:', err)
    uiStore.showToast({
      type: 'error',
      message: err.message || 'Erro ao carregar detalhes da conversa',
    })
  }
}

const handleSessionSelect = (sessionId: string) => {
  selectedSessionId.value = sessionId
  loadSessionDetail(sessionId)
}

const handlePageChange = async (page: number) => {
  await loadSessions(page)
}

const handleSearch = async (query: string) => {
  searchQuery.value = query
  console.log('[i] Buscando por:', query)
}



const clearSelection = () => {
  selectedSessionId.value = null
  limparConversaAtual()
}

const handleLogout = () => {
  authStore.logout()
  uiStore.showToast({
    type: 'success',
    message: 'Logout realizado com sucesso',
  })
  router.push('/login')
}

onMounted(() => {
  console.log('[i] Iniciando página de histórico...')
  loadSessions()
})
</script>
