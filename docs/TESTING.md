# 🧪 Guia de Teste - Sistema de Gestão de Editais

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- Node.js 18+ ou 20+
- pnpm (recomendado) ou npm

## 🚀 Passo 1: Instalação

```bash
cd vue-edital-frontend

# Instalar dependências
pnpm install

# OU com npm
npm install
```

## ⚙️ Passo 2: Configuração

O arquivo `.env.development` já está configurado para usar o **mock server** (dados simulados), então você pode testar sem precisar de acesso à API real:

```env
VITE_USE_MOCK=true
```

## 🎯 Passo 3: Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev

# OU com npm
npm run dev
```

O servidor estará disponível em: **http://localhost:5173**

## 🔐 Passo 4: Fazer Login

Abra o navegador em `http://localhost:5173` e você verá a tela de login.

**Credenciais de teste (qualquer email/senha funciona no mock):**
- Email: `teste@example.com`
- Senha: `123456` (mínimo 6 caracteres)

## ✅ Passo 5: Testar as Funcionalidades

### 1. HomePage (Página Inicial)
Após o login, você verá 3 cards:
- ✅ **Gestão de Editais** - Clique para criar editais
- ✅ **Métricas e Análises** - Clique para ver gráficos
- ✅ **Histórico de Conversas** - Clique para ver conversas

### 2. Gestão de Editais (`/management`)
Teste o formulário de criação:
- ✅ Preencha título e descrição
- ✅ Selecione um status (Aberto/Fechado/Em Análise)
- ✅ Adicione campos dinâmicos (ex: prazo, valor)
- ✅ Faça upload de PDFs (arraste ou clique)
- ✅ Teste as 3 abas: Principal, Anexos, Resultados
- ✅ Clique em "Criar Edital"

**Validações para testar:**
- Tente enviar sem título → deve mostrar erro
- Tente enviar sem descrição → deve mostrar erro
- Tente fazer upload de arquivo não-PDF → deve rejeitar

### 3. Métricas (`/metrics`)
Visualize os dados:
- ✅ Veja os cards de totais (mensagens, usuários, editais)
- ✅ Veja o gráfico de barras de engajamento
- ✅ Veja o gráfico de pizza de distribuição
- ✅ **Clique em uma barra do gráfico** → filtra mensagens
- ✅ Veja a tabela de mensagens filtrada
- ✅ Clique em "Limpar Filtro" → volta ao estado original

### 4. Histórico (`/history`)
Explore as conversas:
- ✅ Veja a lista de sessões à esquerda
- ✅ Use a busca para filtrar por email
- ✅ **Clique em uma sessão** → visualiza a conversa
- ✅ Veja as mensagens do usuário (azul) e bot (branco)
- ✅ Veja informações da sessão (duração, edital)
- ✅ Clique em "Limpar Seleção"

### 5. Navegação
- ✅ Use o menu superior para navegar entre páginas
- ✅ Clique no logo para voltar à home
- ✅ Teste o botão "Voltar" em cada página
- ✅ Clique em "Sair" para fazer logout

## 📱 Passo 6: Testar Responsividade

Abra as DevTools do navegador (F12) e teste em diferentes tamanhos:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

Verifique se:
- Menu mobile aparece em telas pequenas
- Cards se reorganizam em grid
- Tabelas ficam scrollable
- Formulários se ajustam

## 🎨 Passo 7: Testar Interações

### Hover Effects
- ✅ Passe o mouse sobre os cards da home
- ✅ Passe o mouse sobre botões
- ✅ Passe o mouse sobre linhas de tabelas

### Loading States
- ✅ Veja os spinners ao carregar dados
- ✅ Veja os skeletons nas listas

### Toasts (Notificações)
- ✅ Faça login → veja toast de sucesso
- ✅ Crie um edital → veja toast de sucesso
- ✅ Faça logout → veja toast de sucesso

## 🐛 Passo 8: Testar Cenários de Erro

### Validação de Formulários
```
1. Tente fazer login com email inválido
2. Tente fazer login com senha curta (< 6 caracteres)
3. Tente criar edital sem título
4. Tente adicionar campo dinâmico com chave duplicada
```

### Upload de Arquivos
```
1. Tente fazer upload de arquivo .txt → deve rejeitar
2. Tente fazer upload de imagem .jpg → deve rejeitar
3. Faça upload de PDF válido → deve aceitar
```

## 🔄 Passo 9: Testar com API Real (Opcional)

Se você tiver acesso à API Django:

1. **Edite `.env.development`:**
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000/api
```

2. **Configure o túnel SSH (se necessário):**
```bash
ssh -L 8000:django-server-internal:8000 usuario@bastion.example.com -p 2222 -N
```

3. **Reinicie o servidor:**
```bash
pnpm dev
```

## 📊 Passo 10: Verificar Console

Abra o Console do navegador (F12 → Console) e verifique:
- ✅ Não há erros em vermelho
- ✅ Requisições à API estão funcionando
- ✅ Dados estão sendo carregados corretamente

## 🎯 Checklist de Teste Completo

### Autenticação
- [ ] Login com credenciais válidas
- [ ] Validação de email
- [ ] Validação de senha
- [ ] Logout
- [ ] Redirecionamento após login
- [ ] Proteção de rotas (tentar acessar /management sem login)

### Gestão de Editais
- [ ] Criar edital com todos os campos
- [ ] Validação de campos obrigatórios
- [ ] Adicionar campos dinâmicos
- [ ] Remover campos dinâmicos
- [ ] Upload de PDF principal
- [ ] Upload de múltiplos anexos
- [ ] Upload de múltiplos resultados
- [ ] Validação de tipo de arquivo
- [ ] Preview do payload JSON

### Métricas
- [ ] Visualizar cards de totais
- [ ] Visualizar gráfico de barras
- [ ] Visualizar gráfico de pizza
- [ ] Clicar em barra para filtrar
- [ ] Ver tabela de mensagens
- [ ] Paginação da tabela
- [ ] Limpar filtro

### Histórico
- [ ] Listar sessões
- [ ] Buscar por email
- [ ] Buscar por ID de usuário
- [ ] Selecionar sessão
- [ ] Visualizar conversa
- [ ] Ver diferenciação user/bot
- [ ] Ver informações da sessão
- [ ] Limpar seleção
- [ ] Paginação de sessões

### UI/UX
- [ ] Navegação entre páginas
- [ ] Responsividade mobile
- [ ] Hover effects
- [ ] Loading states
- [ ] Toasts de notificação
- [ ] Empty states
- [ ] Mensagens de erro

## 🚨 Problemas Comuns

### Erro: "Cannot find module"
```bash
rm -rf node_modules
pnpm install
```

### Erro: "Port 5173 already in use"
```bash
# Mate o processo na porta 5173
lsof -ti:5173 | xargs kill -9

# Ou use outra porta
pnpm dev --port 3000
```

### Erro: "Failed to fetch"
```bash
# Verifique se VITE_USE_MOCK=true no .env.development
# Ou verifique se a API Django está rodando
```

### Página em branco
```bash
# Limpe o cache do navegador
# Ou abra em modo anônimo
# Ou verifique o console por erros
```

## 📝 Relatando Bugs

Se encontrar algum problema, anote:
1. O que você estava fazendo
2. O que esperava que acontecesse
3. O que realmente aconteceu
4. Mensagens de erro no console
5. Screenshots (se possível)

## ✅ Teste Concluído!

Se todos os itens do checklist estão funcionando, o sistema está pronto! 🎉

## 🔗 Próximos Passos

1. Testar com API real (se disponível)
2. Testar em diferentes navegadores (Chrome, Firefox, Safari)
3. Fazer testes de performance
4. Preparar para deploy em produção
