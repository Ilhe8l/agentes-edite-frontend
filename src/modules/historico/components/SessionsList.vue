<template>
  <Card class="h-full flex flex-col">
    <CardHeader class="flex-shrink-0">
      <CardTitle>Sessões de Conversa</CardTitle>
      <CardDescription>
        Selecione uma sessão para visualizar a conversa completa
      </CardDescription>
    </CardHeader>
    <CardContent class="flex-1 flex flex-col overflow-hidden">
      <!-- Search and Filters -->
      <div class="mb-4 flex-shrink-0 space-y-3">
        <Input
          v-model="searchQuery"
          placeholder="Buscar por telefone ou ID de usuário..."
          @input="debouncedSearch"
        />
        
        <div class="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="clearFilters"
            v-if="searchQuery"
          >
            Limpar
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="sessions.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="mt-4 text-gray-600">Nenhuma sessão encontrada</p>
      </div>

      <!-- Sessions List -->
      <div v-else class="flex-1 overflow-hidden">
        <div class="space-y-2 h-full overflow-y-auto pr-2">
          <div
            v-for="session in paginatedSessions"
            :key="session.id"
            class="p-4 border rounded-lg cursor-pointer transition-all flex-shrink-0"
            :class="session.id === selectedSessionId 
              ? 'bg-primary/10 border-primary' 
              : 'hover:bg-gray-50 border-gray-200'"
            @click="selectSession(session.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ formatUserEmail(session.userEmail) }}
                  </p>
                  <Badge size="sm" variant="secondary">
                    {{ session.messageCount }} msgs
                  </Badge>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-gray-500">
                    ID: {{ session.userId }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatRelativeDate(session.startTime) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t flex-shrink-0">
        <div class="text-sm text-gray-700">
          Página {{ currentPage }} de {{ totalPages }} ({{ totalItems }} conversas)
        </div>
        <div class="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === 1 || isLoading"
            @click="emit('page-change', currentPage - 1)"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage === totalPages || isLoading"
            @click="emit('page-change', currentPage + 1)"
          >
            Próxima
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Card from '@/common/components/ui/Card.vue'
import CardHeader from '@/common/components/ui/CardHeader.vue'
import CardTitle from '@/common/components/ui/CardTitle.vue'
import CardDescription from '@/common/components/ui/CardDescription.vue'
import CardContent from '@/common/components/ui/CardContent.vue'
import Input from '@/common/components/ui/Input.vue'
import Badge from '@/common/components/ui/Badge.vue'
import Button from '@/common/components/ui/Button.vue'
import type { ConversationSession } from '@/common/types/api.types'

export interface SessionsListProps {
  sessions: ConversationSession[]
  selectedSessionId?: string
  isLoading: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
}

const props = withDefaults(defineProps<SessionsListProps>(), {
  isLoading: false,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
})

const emit = defineEmits<{
  'session-select': [id: string]
  'search': [query: string]
  'page-change': [page: number]
}>()

const searchQuery = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Não precisamos mais de paginação local - usamos diretamente as sessions da API
const paginatedSessions = computed(() => {
  return props.sessions
})

const selectSession = (id: string) => {
  emit('session-select', id)
}

const debouncedSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    emit('search', searchQuery.value)
  }, 300)
}

const clearFilters = () => {
  searchQuery.value = ''
  emit('search', '')
}

const formatRelativeDate = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: ptBR 
    })
  } catch {
    return timestamp
  }
}

const formatUserEmail = (contact: string): string => {
  // Se parece com telefone (só números), formatar como telefone
  if (/^\d+$/.test(contact)) {
    // Formatar telefone brasileiro: 11988887777 -> (11) 98888-7777
    if (contact.length === 11) {
      return `(${contact.slice(0, 2)}) ${contact.slice(2, 7)}-${contact.slice(7)}`
    }
    return contact
  }
  // Se é email, retornar como está
  return contact
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Estilo customizado para scroll */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
