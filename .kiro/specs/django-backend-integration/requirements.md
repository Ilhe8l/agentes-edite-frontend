# Requirements Document

## Introduction

Este documento especifica os requisitos para integração completa entre o frontend Vue.js 3 e o painel de controle Django existente. O sistema permitirá autenticação segura, gerenciamento de editais, visualização de métricas e histórico de conversas do chatbot, com comunicação via API REST e suporte a modo mock para desenvolvimento offline.

## Glossary

- **Frontend**: Aplicação Vue.js 3 rodando em http://localhost:3000
- **Backend Django**: API Django REST Framework rodando em Docker com CORS configurado
- **API Client**: Módulo Axios responsável por comunicação HTTP com interceptors
- **JWT**: JSON Web Token usado para autenticação
- **Mock Service**: Serviço que simula respostas da API para desenvolvimento offline
- **Edital**: Documento de chamada pública com metadados, arquivos PDF e anexos
- **Conversa**: Sessão de interação entre usuário e chatbot sobre um edital
- **Mensagem**: Pergunta do usuário e resposta do bot dentro de uma conversa
- **Refresh Token**: Token de longa duração usado para renovar access tokens expirados
- **Access Token**: Token de curta duração usado para autenticar requisições
- **CORS**: Cross-Origin Resource Sharing - mecanismo de segurança HTTP

## Requirements

### Requirement 1

**User Story:** Como desenvolvedor, quero configurar a conexão com o backend Django através de variáveis de ambiente, para que eu possa alternar facilmente entre ambientes de desenvolvimento, staging e produção.

#### Acceptance Criteria

1. WHEN a variável VITE_API_BASE_URL é definida THEN the Frontend SHALL usar essa URL como base para todas as requisições API
2. WHEN a variável VITE_USE_MOCK é definida como 'true' THEN the Frontend SHALL usar o Mock Service ao invés de fazer requisições reais
3. WHEN nenhuma variável de ambiente é definida THEN the Frontend SHALL usar valores padrão seguros (mock mode ativado)
4. WHEN as variáveis de ambiente são alteradas THEN the Frontend SHALL aplicar as mudanças após rebuild da aplicação

### Requirement 2

**User Story:** Como usuário, quero fazer login no sistema usando minhas credenciais, para que eu possa acessar funcionalidades protegidas do painel de controle.

#### Acceptance Criteria

1. WHEN o usuário submete email e senha válidos THEN the Frontend SHALL enviar POST para /api-token-auth/ e receber JWT token
2. WHEN o login é bem-sucedido THEN the Frontend SHALL armazenar access_token e refresh_token no localStorage
3. WHEN o login é bem-sucedido THEN the Frontend SHALL armazenar dados do usuário no localStorage
4. WHEN o login é bem-sucedido THEN the Frontend SHALL redirecionar o usuário para a página inicial
5. WHEN credenciais inválidas são fornecidas THEN the Frontend SHALL exibir mensagem de erro clara ao usuário
6. WHEN o Backend Django retorna erro 401 THEN the Frontend SHALL exibir "Credenciais inválidas"

### Requirement 3

**User Story:** Como usuário autenticado, quero que minhas requisições incluam automaticamente o token de autenticação, para que eu não precise me autenticar manualmente em cada operação.

#### Acceptance Criteria

1. WHEN uma requisição é feita THEN the API Client SHALL adicionar header Authorization com Bearer token
2. WHEN o access_token não existe no localStorage THEN the API Client SHALL fazer requisição sem header Authorization
3. WHEN o Backend Django retorna 401 e existe refresh_token THEN the API Client SHALL tentar renovar o access_token automaticamente
4. WHEN a renovação de token é bem-sucedida THEN the API Client SHALL repetir a requisição original com novo token
5. WHEN a renovação de token falha THEN the API Client SHALL limpar localStorage e redirecionar para /login

### Requirement 4

**User Story:** Como desenvolvedor, quero que o sistema gerencie automaticamente a expiração e renovação de tokens, para que os usuários tenham uma experiência contínua sem interrupções.

#### Acceptance Criteria

1. WHEN o Backend Django retorna 401 em qualquer requisição THEN the API Client SHALL verificar se existe refresh_token válido
2. WHEN existe refresh_token válido THEN the API Client SHALL enviar POST para /auth/refresh/ com o refresh_token
3. WHEN o refresh é bem-sucedido THEN the API Client SHALL atualizar access_token no localStorage
4. WHEN múltiplas requisições falham simultaneamente com 401 THEN the API Client SHALL enfileirar requisições e processar após refresh único
5. WHEN o refresh_token está expirado ou inválido THEN the API Client SHALL fazer logout e redirecionar para login

### Requirement 5

**User Story:** Como administrador, quero criar novos editais com metadados personalizados e arquivos, para que eu possa disponibilizar informações para o chatbot e usuários.

#### Acceptance Criteria

1. WHEN o usuário submete formulário de edital THEN the Frontend SHALL enviar POST para /edital/edital/ com payload JSON estruturado
2. WHEN o payload inclui campos dinâmicos THEN the Frontend SHALL serializar como objeto metadata com pares chave-valor
3. WHEN o payload inclui arquivos THEN the Frontend SHALL incluir informações de arquivo (name, originalName) no objeto files
4. WHEN a criação é bem-sucedida THEN the Backend Django SHALL retornar edital criado com ID e timestamps
5. WHEN a criação falha THEN the Frontend SHALL exibir mensagem de erro específica retornada pelo Backend Django

### Requirement 6

**User Story:** Como administrador, quero fazer upload de arquivos PDF para editais, para que os documentos fiquem disponíveis para consulta e processamento pelo chatbot.

#### Acceptance Criteria

1. WHEN o usuário seleciona arquivo PDF THEN the Frontend SHALL validar tipo e tamanho do arquivo
2. WHEN o arquivo é válido THEN the Frontend SHALL criar FormData com arquivo e tipo (main, annexe, result)
3. WHEN o upload é iniciado THEN the Frontend SHALL enviar POST para /edital/edital/{id}/upload/ com Content-Type multipart/form-data
4. WHEN o upload é bem-sucedido THEN the Backend Django SHALL retornar URL do arquivo armazenado
5. WHEN o upload falha THEN the Frontend SHALL exibir mensagem de erro e permitir retry

### Requirement 7

**User Story:** Como administrador, quero visualizar métricas de engajamento dos editais, para que eu possa entender como os usuários estão interagindo com o sistema.

#### Acceptance Criteria

1. WHEN a página de métricas é carregada THEN the Frontend SHALL enviar GET para /metrics/engagement/
2. WHEN a resposta é recebida THEN the Frontend SHALL exibir total_messages, total_users e total_editals
3. WHEN a resposta inclui array de editais THEN the Frontend SHALL exibir lista com título, contagem de mensagens e usuários únicos por edital
4. WHEN o usuário seleciona um edital THEN the Frontend SHALL filtrar métricas para mostrar apenas dados daquele edital
5. WHEN ocorre erro na requisição THEN the Frontend SHALL exibir mensagem de erro e opção de retry

### Requirement 8

**User Story:** Como administrador, quero visualizar mensagens trocadas entre usuários e o chatbot, para que eu possa monitorar a qualidade das respostas e identificar problemas.

#### Acceptance Criteria

1. WHEN a página de métricas carrega mensagens THEN the Frontend SHALL enviar GET para /discussao/mensagem/
2. WHEN o usuário filtra por edital THEN the Frontend SHALL enviar query parameter edital_id na requisição
3. WHEN a resposta é recebida THEN the Frontend SHALL exibir lista com user_email, question, bot_response e timestamp
4. WHEN a lista está vazia THEN the Frontend SHALL exibir mensagem "Nenhuma mensagem encontrada"
5. WHEN ocorre erro THEN the Frontend SHALL exibir mensagem de erro com opção de retry

### Requirement 9

**User Story:** Como administrador, quero visualizar histórico de conversas dos usuários, para que eu possa analisar padrões de uso e sessões completas de interação.

#### Acceptance Criteria

1. WHEN a página de histórico é carregada THEN the Frontend SHALL enviar GET para /discussao/conversa/ com limit e offset
2. WHEN a resposta é recebida THEN the Frontend SHALL exibir lista de sessões com user_email, start_time, message_count e edital
3. WHEN o usuário clica em uma sessão THEN the Frontend SHALL enviar GET para /discussao/conversa/{id}/ para obter detalhes
4. WHEN os detalhes são recebidos THEN the Frontend SHALL exibir mensagens completas com role (user/bot), content e timestamp
5. WHEN o usuário busca por email THEN the Frontend SHALL enviar query parameter email na requisição

### Requirement 10

**User Story:** Como desenvolvedor, quero trabalhar offline usando dados mock, para que eu possa desenvolver e testar funcionalidades sem depender do backend Django.

#### Acceptance Criteria

1. WHEN VITE_USE_MOCK é 'true' THEN the API Client SHALL interceptar todas as requisições e retornar dados do Mock Service
2. WHEN Mock Service recebe requisição de login THEN the Mock Service SHALL retornar token fake e dados de usuário simulados
3. WHEN Mock Service recebe requisição de editais THEN the Mock Service SHALL retornar lista de editais simulados
4. WHEN Mock Service recebe requisição de métricas THEN the Mock Service SHALL retornar métricas simuladas realistas
5. WHEN Mock Service recebe requisição de conversas THEN the Mock Service SHALL retornar histórico simulado com mensagens

### Requirement 11

**User Story:** Como desenvolvedor, quero tratamento consistente de erros em todas as requisições, para que os usuários recebam feedback claro quando algo der errado.

#### Acceptance Criteria

1. WHEN o Backend Django retorna erro 400 THEN the Frontend SHALL exibir mensagem de validação específica
2. WHEN o Backend Django retorna erro 404 THEN the Frontend SHALL exibir "Recurso não encontrado"
3. WHEN o Backend Django retorna erro 500 THEN the Frontend SHALL exibir "Erro no servidor, tente novamente"
4. WHEN ocorre erro de rede THEN the Frontend SHALL exibir "Erro de conexão, verifique sua internet"
5. WHEN o timeout é atingido (10s) THEN the Frontend SHALL cancelar requisição e exibir mensagem de timeout

### Requirement 12

**User Story:** Como usuário, quero fazer logout do sistema, para que eu possa encerrar minha sessão de forma segura.

#### Acceptance Criteria

1. WHEN o usuário clica em logout THEN the Frontend SHALL remover access_token do localStorage
2. WHEN o usuário clica em logout THEN the Frontend SHALL remover refresh_token do localStorage
3. WHEN o usuário clica em logout THEN the Frontend SHALL remover dados do usuário do localStorage
4. WHEN o logout é concluído THEN the Frontend SHALL redirecionar para página de login
5. WHEN o logout é concluído THEN the Frontend SHALL limpar estado da aplicação (Pinia stores)

### Requirement 13

**User Story:** Como desenvolvedor, quero que todas as respostas da API sigam estrutura consistente, para que eu possa processar dados de forma uniforme no frontend.

#### Acceptance Criteria

1. WHEN o Backend Django retorna sucesso THEN the response SHALL incluir campo success: true
2. WHEN o Backend Django retorna sucesso THEN the response SHALL incluir campo data com payload
3. WHEN o Backend Django retorna erro THEN the response SHALL incluir campo success: false
4. WHEN o Backend Django retorna erro THEN the response SHALL incluir campo error com mensagem descritiva
5. WHEN timestamps são incluídos THEN the Backend Django SHALL usar formato ISO 8601 UTC

### Requirement 14

**User Story:** Como desenvolvedor, quero logs detalhados de requisições em modo desenvolvimento, para que eu possa debugar problemas de integração facilmente.

#### Acceptance Criteria

1. WHEN VITE_USE_MOCK é 'true' THEN the API Client SHALL logar todas as requisições mock no console
2. WHEN uma requisição falha THEN the API Client SHALL logar erro completo com URL, método e payload
3. WHEN refresh token é acionado THEN the API Client SHALL logar tentativa de renovação
4. WHEN modo produção está ativo THEN the API Client SHALL suprimir logs detalhados
5. WHEN erro de rede ocorre THEN the API Client SHALL logar detalhes da falha de conexão
