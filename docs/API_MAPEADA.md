# ✅ API Django Mapeada!

## 🎉 Endpoints Descobertos

Base URL: `https://controlpanel.aws.leds.dev.br`

### 🔐 Autenticação

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api-token-auth/` | POST | Login (retorna token) |

**Request:**
```json
{
  "username": "user@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "abc123..."
}
```

---

### 📄 Editais

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/edital/edital/` | GET | Listar editais |
| `/edital/edital/` | POST | Criar edital |
| `/edital/edital/{id}/` | GET | Detalhes do edital |
| `/edital/edital/{id}/` | PUT | Atualizar edital |
| `/edital/edital/{id}/` | PATCH | Atualizar parcial |
| `/edital/edital/{id}/` | DELETE | Deletar edital |

---

### 💬 Discussão - Mensagens

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/discussao/mensagem/` | GET | Listar mensagens |
| `/discussao/mensagem/` | POST | Criar mensagem |
| `/discussao/mensagem/{id}/` | GET | Detalhes da mensagem |
| `/discussao/mensagem/{id}/` | PUT | Atualizar mensagem |
| `/discussao/mensagem/{id}/` | PATCH | Atualizar parcial |
| `/discussao/mensagem/{id}/` | DELETE | Deletar mensagem |

---

### 💬 Discussão - Conversas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/discussao/conversa/` | GET | Listar conversas |
| `/discussao/conversa/` | POST | Criar conversa |
| `/discussao/conversa/{id}/` | GET | Detalhes da conversa |
| `/discussao/conversa/{id}/` | PUT | Atualizar conversa |
| `/discussao/conversa/{id}/` | PATCH | Atualizar parcial |
| `/discussao/conversa/{id}/` | DELETE | Deletar conversa |

---

## ✅ Adaptações Feitas no Frontend

### 1. Auth Service (`src/common/api/auth.service.ts`)
- ✅ Mudado de `/auth/login/` para `/api-token-auth/`
- ✅ Adaptado para usar `username` em vez de `email`
- ✅ Adaptado resposta do Django (token único)

### 2. Edital Service (`src/modules/gestao-editais/services/edital.service.ts`)
- ✅ Mudado de `/editals/` para `/edital/edital/`
- ✅ Atualizado todos os endpoints

### 3. API Client (`src/common/api/client.ts`)
- ✅ Atualizado mapeamento de mock
- ✅ Suporte para novos endpoints

---

## 🚀 Como Usar Agora

### 1. Configurar CORS no Django

**IMPORTANTE:** Adicione no `settings.py`:

```python
pip install django-cors-headers

INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # NO TOPO!
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

CORS_ALLOW_CREDENTIALS = True
```

### 2. Reiniciar Django

```bash
# Reinicie o servidor Django
```

### 3. Testar Frontend

```bash
# Modo real (Django)
npm run dev

# Acesse http://localhost:3000
# Faça login com credenciais reais do Django
```

---

## 🔧 Configuração Atual

### `.env.development`

```bash
VITE_API_BASE_URL=https://controlpanel.aws.leds.dev.br
VITE_USE_MOCK=false
```

---

## 📝 Formato de Autenticação

O Django usa **Token Authentication**, não JWT.

**Como funciona:**

1. Login: `POST /api-token-auth/` → Retorna `{ token: "..." }`
2. Requests: Header `Authorization: Token abc123...`
3. Não tem refresh token
4. Token não expira (ou expira em muito tempo)

---

## ✅ Checklist

- [x] Endpoints descobertos
- [x] Frontend adaptado
- [ ] CORS configurado no Django
- [ ] Testar login
- [ ] Testar listagem de editais
- [ ] Testar criação de edital
- [ ] Testar mensagens
- [ ] Testar conversas

---

## 🚀 Próximos Passos

1. **Configure CORS no Django** (copie o código acima)
2. **Reinicie o Django**
3. **Execute:** `npm run dev`
4. **Teste o login** com credenciais reais
5. **Me avise** se funcionar ou se der erro!

---

## 🆘 Se Der Erro

### CORS blocked
→ Configure CORS no Django (veja acima)

### 401 Unauthorized
→ Verifique se as credenciais estão corretas

### 404 Not Found
→ Verifique se o endpoint existe no Django

### Network Error
→ Verifique se está conectado à VPN

---

**Tudo pronto para testar!** 🎉
