# 🔄 Plano de Reestruturação - Padrão LEDS

## 📁 Nova Estrutura (Seguindo Template LEDS)

```
gestao-de-editais-fapes/
├── src/
│   ├── common/                    # Código compartilhado
│   │   ├── api/                   # Configuração de API
│   │   │   └── client.ts          # Axios client
│   │   ├── assets/                # Imagens, fontes, etc
│   │   ├── components/            # Componentes globais
│   │   │   └── ui/                # Componentes UI base
│   │   ├── constants/             # Constantes globais
│   │   ├── plugins/               # Plugins Vue (router, pinia, etc)
│   │   │   ├── index.ts
│   │   │   ├── router.ts
│   │   │   └── pinia.ts
│   │   ├── router/                # Configuração de rotas
│   │   │   └── index.ts
│   │   ├── store/                 # Stores Pinia globais
│   │   │   ├── auth.ts
│   │   │   └── ui.ts
│   │   ├── types/                 # Types TypeScript globais
│   │   │   ├── api.types.ts
│   │   │   └── user.types.ts
│   │   ├── utils/                 # Funções utilitárias
│   │   └── globalComponents.ts   # Registro de componentes globais
│   │
│   ├── layouts/                   # Layouts da aplicação
│   │   └── LayoutBase.vue
│   │
│   ├── modules/                   # Módulos da aplicação
│   │   ├── autenticacao/          # Módulo de autenticação
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   │   └── LoginPage.vue
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── router.ts
│   │   │
│   │   ├── gestao-editais/        # Módulo de gestão de editais
│   │   │   ├── components/
│   │   │   │   ├── DynamicFieldsRepeater.vue
│   │   │   │   └── FileUploaderCard.vue
│   │   │   ├── views/
│   │   │   │   ├── HomePage.vue
│   │   │   │   └── ManagementPage.vue
│   │   │   ├── services/
│   │   │   │   └── edital.service.ts
│   │   │   ├── store/
│   │   │   │   └── edital.store.ts
│   │   │   ├── types/
│   │   │   │   └── edital.types.ts
│   │   │   └── router.ts
│   │   │
│   │   ├── metricas/              # Módulo de métricas
│   │   │   ├── components/
│   │   │   │   ├── EngagementChart.vue
│   │   │   │   └── MessagesList.vue
│   │   │   ├── views/
│   │   │   │   └── MetricsPage.vue
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── router.ts
│   │   │
│   │   └── historico/             # Módulo de histórico
│   │       ├── components/
│   │       │   ├── ChatViewer.vue
│   │       │   └── SessionsList.vue
│   │       ├── views/
│   │       │   └── HistoryPage.vue
│   │       ├── services/
│   │       ├── store/
│   │       └── router.ts
│   │
│   ├── App.vue                    # Componente raiz
│   ├── main.ts                    # Entry point
│   └── style.css                  # Estilos globais
│
├── public/                        # Assets estáticos
├── .env.development               # Variáveis de ambiente
├── index.html                     # HTML template
├── vite.config.ts                 # Configuração Vite
├── tailwind.config.js             # Configuração Tailwind
├── tsconfig.json                  # Configuração TypeScript
└── package.json                   # Dependências
```

## 🔄 Mapeamento Atual → Novo

### Arquivos Comuns (common/)

| Atual | Novo |
|-------|------|
| `src/services/api-client.ts` | `src/common/api/client.ts` |
| `src/services/mock.service.ts` | `src/common/api/mock.service.ts` |
| `src/stores/auth.store.ts` | `src/common/store/auth.ts` |
| `src/stores/ui.store.ts` | `src/common/store/ui.ts` |
| `src/types/api.types.ts` | `src/common/types/api.types.ts` |
| `src/types/user.types.ts` | `src/common/types/user.types.ts` |
| `src/router/index.ts` | `src/common/router/index.ts` |
| `src/composables/*` | `src/common/utils/*` |
| `src/components/ui/*` | `src/common/components/ui/*` |
| `src/components/layout/*` | `src/layouts/*` |

### Módulo: Autenticação

| Atual | Novo |
|-------|------|
| `src/views/LoginPage.vue` | `src/modules/autenticacao/views/LoginPage.vue` |

### Módulo: Gestão de Editais

| Atual | Novo |
|-------|------|
| `src/views/HomePage.vue` | `src/modules/gestao-editais/views/HomePage.vue` |
| `src/views/ManagementPage.vue` | `src/modules/gestao-editais/views/ManagementPage.vue` |
| `src/components/management/*` | `src/modules/gestao-editais/components/*` |
| `src/services/edital.service.ts` | `src/modules/gestao-editais/services/edital.service.ts` |
| `src/stores/edital.store.ts` | `src/modules/gestao-editais/store/edital.store.ts` |

### Módulo: Métricas

| Atual | Novo |
|-------|------|
| `src/views/MetricsPage.vue` | `src/modules/metricas/views/MetricsPage.vue` |
| `src/components/metrics/*` | `src/modules/metricas/components/*` |

### Módulo: Histórico

| Atual | Novo |
|-------|------|
| `src/views/HistoryPage.vue` | `src/modules/historico/views/HistoryPage.vue` |
| `src/components/history/*` | `src/modules/historico/components/*` |

## ✅ Benefícios da Nova Estrutura

1. **Modularidade**: Cada módulo é independente
2. **Escalabilidade**: Fácil adicionar novos módulos
3. **Manutenibilidade**: Código organizado por funcionalidade
4. **Padrão LEDS**: Segue o template oficial
5. **Lazy Loading**: Módulos podem ser carregados sob demanda

## 🚀 Próximos Passos

1. Criar estrutura de pastas
2. Mover arquivos para nova estrutura
3. Atualizar imports
4. Configurar router modular
5. Testar aplicação
