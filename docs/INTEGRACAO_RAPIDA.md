# ⚡ Integração Rápida com Django

## ✅ Status: Django Acessível!

O Django está rodando em: `https://controlpanel.aws.leds.dev.br`

---

## 🔧 PASSO 1: Configurar CORS no Django

**IMPORTANTE:** O Django precisa permitir requisições do frontend.

### No Django, adicione ao `settings.py`:

```python
# 1. Instalar pacote
pip install django-cors-headers

# 2. Adicionar em INSTALLED_APPS
INSTALLED_APPS = [
    # ... suas apps ...
    'corsheaders',  # ← ADICIONAR
]

# 3. Adicionar em MIDDLEWARE (NO TOPO!)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← ADICIONAR NO TOPO
    'django.middleware.security.SecurityMiddleware',
    # ... resto ...
]

# 4. Configurar CORS (no final do arquivo)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### Reiniciar Django:
```bash
# Reinicie o servidor Django após fazer as mudanças
```

---

## 🔍 PASSO 2: Descobrir Endpoints do Django

Preciso saber quais endpoints você tem. Me diga:

### Endpoints de Autenticação:

Você tem estes endpoints no Django?

- [ ] Login: `/api/auth/login/` ou `/api/token/` ou outro?
- [ ] Logout: `/api/auth/logout/`
- [ ] Refresh: `/api/auth/refresh/` ou `/api/token/refresh/`
- [ ] User info: `/api/auth/me/` ou `/api/user/`

### Endpoints de Editais:

- [ ] Listar: `/api/editals/` ou `/api/edital/` ou outro?
- [ ] Criar: POST para qual URL?
- [ ] Detalhes: `/api/editals/{id}/`

### Endpoints de Mensagens/Discussão:

- [ ] Listar mensagens: Qual URL?
- [ ] Métricas: Qual URL?

### Endpoints de Conversas:

- [ ] Listar conversas: Qual URL?
- [ ] Detalhes: Qual URL?

---

## 🎯 PASSO 3: Adaptar Frontend aos Endpoints

Baseado nos screenshots do Django Admin que você mostrou, vejo:

- `apps_edital` - Editais
- `apps_discussao` - Mensagens e Conversas
- Usuários para autenticação

### Me diga:

1. **Qual é o endpoint de login?**
   - Exemplo: `/api/token/`, `/api/auth/login/`, `/admin/login/`

2. **Como é a resposta do login?**
   - Retorna JWT tokens?
   - Retorna session cookie?
   - Formato do JSON?

3. **Quais são as URLs dos outros endpoints?**

---

## 🚀 OPÇÃO RÁPIDA: Testar Agora

Se você já configurou CORS, podemos testar agora:

```bash
# 1. Reiniciar frontend
npm run dev

# 2. Acessar
http://localhost:3000

# 3. Tentar fazer login
```

**O que vai acontecer:**

- ✅ Se CORS estiver OK: Vai tentar fazer login
- ❌ Se CORS não estiver OK: Erro "CORS blocked"
- ❌ Se endpoint não existir: Erro 404

---

## 📝 Formato Esperado de Login

O frontend está esperando este formato:

### Request:
```json
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "senha123"
}
```

### Response:
```json
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  },
  "tokens": {
    "access": "jwt_token_aqui",
    "refresh": "jwt_refresh_token_aqui"
  }
}
```

**Se o seu Django retorna formato diferente, me diga qual é!**

---

## 🔧 Adaptação Rápida

Se os endpoints forem diferentes, posso adaptar o frontend em 5 minutos.

**Me envie:**

1. URL do endpoint de login
2. Formato da request (JSON que envia)
3. Formato da response (JSON que recebe)
4. URLs dos outros endpoints

---

## ⚡ Ação Imediata

**Faça agora:**

1. Configure CORS no Django (copie o código acima)
2. Reinicie o Django
3. Execute: `npm run dev`
4. Tente fazer login
5. Me diga o que aconteceu (erro ou sucesso)

**Estou pronto para adaptar o código assim que você me passar os detalhes dos endpoints!** 🚀
