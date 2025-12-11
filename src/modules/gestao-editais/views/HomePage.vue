<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Logo :width="120" :height="48" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Gestão de Editais</h1>
              <p class="text-sm text-gray-600">Sistema de Gerenciamento FAPES</p>
            </div>
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
    <main class="container mx-auto px-4 py-12">
      <div class="max-w-6xl mx-auto">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Sistema de Gestão de Editais
          </h2>
          <p class="text-lg text-gray-600">
            Escolha uma das opções abaixo para começar
          </p>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <!-- Management Card -->
          <Card :hover="true" class="cursor-pointer hover:shadow-lg transition-shadow duration-200" @click="navigateTo('/management')">
            <CardContent class="p-8">
              <div class="flex flex-col items-center text-center h-full">
                <div class="p-5 bg-blue-100 rounded-full mb-6">
                  <FileText class="h-10 w-10 text-blue-600" />
                </div>
                <div class="flex-1 flex flex-col justify-center space-y-4">
                  <h3 class="text-xl font-semibold text-gray-900">
                    Gestão de Editais
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed">
                    Crie e gerencie editais, faça upload de documentos e configure metadados
                  </p>
                </div>
                <Button variant="outline" class="w-full mt-6">
                  Acessar
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Metrics Card -->
          <Card :hover="true" class="cursor-pointer hover:shadow-lg transition-shadow duration-200" @click="navigateTo('/metrics')">
            <CardContent class="p-8">
              <div class="flex flex-col items-center text-center h-full">
                <div class="p-5 bg-green-100 rounded-full mb-6">
                  <BarChart3 class="h-10 w-10 text-green-600" />
                </div>
                <div class="flex-1 flex flex-col justify-center space-y-4">
                  <h3 class="text-xl font-semibold text-gray-900">
                    Métricas e Análises
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed">
                    Visualize estatísticas de engajamento e mensagens por edital
                  </p>
                </div>
                <Button variant="outline" class="w-full mt-6">
                  Acessar
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- History Card -->
          <Card :hover="true" class="cursor-pointer hover:shadow-lg transition-shadow duration-200" @click="navigateTo('/history')">
            <CardContent class="p-8">
              <div class="flex flex-col items-center text-center h-full">
                <div class="p-5 bg-purple-100 rounded-full mb-6">
                  <MessageSquare class="h-10 w-10 text-purple-600" />
                </div>
                <div class="flex-1 flex flex-col justify-center space-y-4">
                  <h3 class="text-xl font-semibold text-gray-900">
                    Histórico de Conversas
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed">
                    Acesse o histórico completo de conversas entre usuários e chatbot
                  </p>
                </div>
                <Button variant="outline" class="w-full mt-6">
                  Acessar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Editais Disponíveis Section -->
        <div class="mt-16">
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              Editais Disponíveis
            </h3>
            <p class="text-gray-600">
              Visualize e gerencie todos os editais cadastrados no sistema
            </p>
          </div>

          <!-- Editais List -->
          <Card>
            <CardContent class="p-0">
              <div v-if="isLoadingEditals" class="p-8 text-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="text-gray-500 mt-4">Carregando editais...</p>
              </div>
              
              <div v-else-if="editals.length === 0" class="p-8 text-center">
                <FileText class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-500">Nenhum edital encontrado</p>
              </div>

              <div v-else class="divide-y divide-gray-200">
                <div
                  v-for="edital in editals"
                  :key="edital.id"
                  class="p-6 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 mb-3">
                        <h4 class="text-lg font-semibold text-gray-900 truncate" :title="edital.nome">
                          {{ truncateText(edital.nome, 60) }}
                        </h4>
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
                          :class="getStatusClass(edital.status)"
                        >
                          {{ edital.status }}
                        </span>
                      </div>
                      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-1 sm:space-y-0 text-sm text-gray-500">
                        <span class="flex items-center">
                          <span class="font-medium">ID:</span>
                          <span class="ml-1">{{ edital.id }}</span>
                          <!-- TODO: Usar edital.numero quando disponível na API -->
                        </span>
                        <span v-if="edital.setor_responsavel" class="flex items-center">
                          <span class="font-medium">Setor:</span>
                          <span class="ml-1">{{ edital.setor_responsavel.nome }}</span>
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 lg:ml-4 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        @click="viewEdital(edital)"
                        class="flex items-center space-x-2 text-xs lg:text-sm"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span class="hidden sm:inline">Ver Detalhes</span>
                        <span class="sm:hidden">Ver</span>
                      </Button>
                      <!-- TODO: Implementar funcionalidade de edição -->
                      <Button 
                        variant="outline" 
                        size="sm"
                        @click="editEdital(edital)"
                        class="flex items-center space-x-2 text-xs lg:text-sm"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span class="hidden sm:inline">Editar</span>
                        <span class="sm:hidden">Edit</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Info Alert -->
        <div class="mt-8">
          <Alert>
            <p class="text-sm">
              <strong>Dica:</strong> Use a navegação acima para acessar rapidamente as diferentes seções do sistema.
            </p>
          </Alert>
        </div>
      </div>
    </main>

    <!-- Modal de Visualização do Edital -->
    <div 
      v-if="showViewModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeViewModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900">Detalhes do Edital</h3>
          <button 
            @click="closeViewModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div v-if="selectedEdital" class="space-y-6">
            <!-- Informações Básicas -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Edital</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ selectedEdital.nome }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(selectedEdital.status)"
                >
                  {{ selectedEdital.status }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ID</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ selectedEdital.id }}</p>
                <!-- TODO: Mostrar número do edital quando disponível -->
              </div>
              <div v-if="selectedEdital.setor_responsavel">
                <label class="block text-sm font-medium text-gray-700 mb-2">Setor Responsável</label>
                <p class="text-gray-900 bg-gray-50 p-3 rounded-md">{{ selectedEdital.setor_responsavel.nome }}</p>
              </div>
            </div>

            <!-- Metadados -->
            <div v-if="selectedEdital.metadata">
              <label class="block text-sm font-medium text-gray-700 mb-2">Link do Edital</label>
              <a 
                v-if="selectedEdital.metadata.link"
                :href="selectedEdital.metadata.link" 
                target="_blank"
                class="text-blue-600 hover:text-blue-800 underline bg-gray-50 p-3 rounded-md block"
              >
                {{ selectedEdital.metadata.link }}
              </a>
              <p v-else class="text-gray-500 bg-gray-50 p-3 rounded-md">Nenhum link disponível</p>
            </div>

            <!-- Arquivo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Arquivo</label>
              <a 
                v-if="selectedEdital.arquivo"
                :href="selectedEdital.arquivo" 
                target="_blank"
                class="text-blue-600 hover:text-blue-800 underline bg-gray-50 p-3 rounded-md block"
              >
                Visualizar Arquivo PDF
              </a>
              <p v-else class="text-gray-500 bg-gray-50 p-3 rounded-md">Nenhum arquivo disponível</p>
            </div>

            <!-- Alterações (se houver) -->
            <div v-if="selectedEdital.metadata?.alteracoes && selectedEdital.metadata.alteracoes.length > 0">
              <label class="block text-sm font-medium text-gray-700 mb-2">Alterações</label>
              <div class="bg-gray-50 p-4 rounded-md">
                <div 
                  v-for="(alteracao, index) in selectedEdital.metadata.alteracoes" 
                  :key="index"
                  class="mb-3 last:mb-0"
                >
                  <p class="font-medium text-gray-900">{{ alteracao.numero || `Alteração ${index + 1}` }}</p>
                  <p class="text-sm text-gray-600">{{ alteracao.data }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" @click="closeViewModal">
            Fechar
          </Button>
        </div>
      </div>
    </div>

    <!-- Modal de Edição do Edital -->
    <div 
      v-if="showEditModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeEditModal"
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-semibold text-gray-900">Editar Edital</h3>
          <button 
            @click="closeEditModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div v-if="selectedEdital" class="space-y-6">
            <!-- Formulário de Edição -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Edital</label>
                <input 
                  v-model="editForm.nome"
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do edital"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  v-model="editForm.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ABERTO">Aberto</option>
                  <option value="FECHADO">Fechado</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="SUSPENSO">Suspenso</option>
                </select>
              </div>
              <div class="lg:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Link do Edital</label>
                <input 
                  v-model="editForm.link"
                  type="url" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://exemplo.com/edital.pdf"
                />
              </div>
            </div>

            <!-- TODO: Adicionar mais campos conforme necessário -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-yellow-800">Funcionalidade em Desenvolvimento</h4>
                  <p class="text-sm text-yellow-700 mt-1">
                    A funcionalidade de edição ainda não está conectada ao backend. 
                    As alterações não serão salvas permanentemente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" @click="closeEditModal">
            Cancelar
          </Button>
          <!-- TODO: Implementar salvamento no backend -->
          <Button @click="saveEdital" class="bg-blue-600 hover:bg-blue-700 text-white">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/common/store/auth'
import { useUiStore } from '@/common/store/ui'
import { metricsService } from '@/services/metrics.service'
import Card from '@/common/components/ui/Card.vue'
import CardContent from '@/common/components/ui/CardContent.vue'
import Button from '@/common/components/ui/Button.vue'
import Alert from '@/common/components/ui/Alert.vue'
import Logo from '@/common/components/ui/Logo.vue'
import { FileText, BarChart3, MessageSquare } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const editals = ref<any[]>([])
const isLoadingEditals = ref(false)
const showViewModal = ref(false)
const showEditModal = ref(false)
const selectedEdital = ref<any>(null)
const editForm = ref({
  nome: '',
  status: '',
  link: ''
})

const navigateTo = (path: string) => {
  router.push(path)
}

const handleLogout = () => {
  authStore.logout()
  uiStore.showToast({
    type: 'success',
    message: 'Logout realizado com sucesso',
  })
  router.push('/login')
}

// Carregar editais disponíveis
const loadEditals = async () => {
  isLoadingEditals.value = true
  try {
    console.log('[i] Carregando editais disponíveis...')
    const editalsData = await metricsService.getAllEditals()
    editals.value = editalsData
    console.log(`[*] ${editalsData.length} editais carregados`)
  } catch (error) {
    console.error('[x] Erro ao carregar editais:', error)
    uiStore.showToast({
      type: 'error',
      message: 'Erro ao carregar editais',
    })
  } finally {
    isLoadingEditals.value = false
  }
}

// Função para truncar texto
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Função para obter classe CSS do status
const getStatusClass = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'ABERTO':
      return 'bg-green-100 text-green-800'
    case 'FECHADO':
      return 'bg-red-100 text-red-800'
    case 'EM_ANDAMENTO':
      return 'bg-yellow-100 text-yellow-800'
    case 'SUSPENSO':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

// Visualizar edital
const viewEdital = (edital: any) => {
  console.log('[i] Visualizando edital:', edital)
  selectedEdital.value = edital
  showViewModal.value = true
}

// Editar edital
const editEdital = (edital: any) => {
  console.log('[i] Editando edital:', edital)
  selectedEdital.value = edital
  
  // Preencher formulário com dados atuais
  editForm.value = {
    nome: edital.nome || '',
    status: edital.status || '',
    link: edital.metadata?.link || ''
  }
  
  showEditModal.value = true
}

// Fechar modal de visualização
const closeViewModal = () => {
  showViewModal.value = false
  selectedEdital.value = null
}

// Fechar modal de edição
const closeEditModal = () => {
  showEditModal.value = false
  selectedEdital.value = null
  editForm.value = { nome: '', status: '', link: '' }
}

// TODO: Implementar salvamento no backend
const saveEdital = () => {
  console.log('[i] Salvando alterações do edital:', {
    id: selectedEdital.value?.id,
    changes: editForm.value
  })
  
  uiStore.showToast({
    type: 'success',
    message: `Alterações salvas localmente! (Backend em desenvolvimento)`,
  })
  
  // TODO: Fazer requisição PUT/PATCH para o backend Django
  // await apiClient.put(`/edital/edital/${selectedEdital.value.id}/`, editForm.value)
  
  closeEditModal()
}

onMounted(() => {
  console.log('[i] Iniciando página inicial...')
  loadEditals()
})
</script>
