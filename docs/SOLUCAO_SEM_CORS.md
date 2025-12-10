# ✅ Solução: Proxy para Contornar CORS

## 🎯 Problema

Você não pode configurar CORS no Django, então o navegador bloqueia as requisições.

## ✅ Solução: Proxy no Vite

Configurei o Vite para fazer **proxy** das requisições. Agora funciona assim:

```
Frontend (localhost:3000)
    ↓
Vite Proxy (localhost:3000)
    ↓
Django (controlpanel.aws.leds.dev.br)
```

**Vantagem:** Não precisa configurar CORS no Django!

---

## 🔧 O que foi Configurado

### 1. `vite.config.ts`

```typescript
server: {
  port: 3000,
  proxy: {
    '/api-token-auth': {
      target: 'https://controlpanel.aws.leds.dev.br',
      changeOrigin: true,
      secure: false,
    },
    '/edital': {
      target: 'https://controlpanel.aws.leds.dev.br',
      changeOrigin: true,
      secure: false,
    },
    '/discussao': {
      target: 'https://controlpanel.aws.leds.dev.br',
      changeOrigin: true,
      secure: false,
    },
    '/core': {
      target: 'https://controlpanel.aws.leds.dev.br',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### 2. `.env.development`

```bash
# URL vazia = usa proxy local
VITE_API_BASE_URL=

# Desabilitar mock
VITE_USE_MOCK=false
```

### 3. `src/common/api/client.ts`

Atualizado para usar URL vazia (proxy local).

---

## 🚀 Como Usar

### 1. Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 2. Testar

```bash
# Acesse
http://localhost:3000

# Faça login com credenciais reais do Django
```

---

## 📝 Como Funciona

### Antes (com CORS bloqueado):

```
Frontend (localhost:3000)
    ↓ [BLOQUEADO pelo navegador]
Django (controlpanel.aws.leds.dev.br)
```

### Agora (com Proxy):

```
Frontend (localhost:3000)
    ↓ Requisição para /edital/edital/
Vite Proxy (localhost:3000)
    ↓ Encaminha para https://controlpanel.aws.leds.dev.br/edital/edital/
Django (controlpanel.aws.leds.dev.br)
    ↓ Responde
Vite Proxy
    ↓ Retorna para frontend
Frontend recebe dados ✅
```

**O navegador não bloqueia porque a requisição é para o mesmo domínio (localhost:3000)!**

---

## ✅ Vantagens

1. ✅ Não precisa configurar CORS no Django
2. ✅ Funciona imediatamente
3. ✅ Simples de configurar
4. ✅ Padrão em desenvolvimento

## ⚠️ Limitações

1. ⚠️ Só funciona em desenvolvimento (npm run dev)
2. ⚠️ Em produção, você vai precisar de CORS ou proxy reverso (nginx)

---

## 🔍 Testando

### 1. Verificar se o proxy está funcionando

Abra o console do navegador (F12) e veja as requisições:

```
Request URL: http://localhost:3000/api-token-auth/
```

Se aparecer `localhost:3000`, o proxy está funcionando! ✅

### 2. Fazer login

Use suas credenciais reais do Django:

```
Email/Username: seu_usuario
Senha: sua_senha
```

### 3. Verificar resposta

Se funcionar, você verá:

```json
{
  "token": "abc123..."
}
```

---

## 🐛 Troubleshooting

### Erro: Network Error

**Causa:** Não está conectado à VPN

**Solução:** Conecte-se à VPN

---

### Erro: 401 Unauthorized

**Causa:** Credenciais incorretas

**Solução:** Use credenciais corretas do Django Admin

---

### Erro: 404 Not Found

**Causa:** Endpoint não existe

**Solução:** Verifique se o endpoint existe no Django

---

### Erro: Proxy não funciona

**Causa:** Servidor não foi reiniciado

**Solução:**
```bash
# Parar servidor (Ctrl+C)
npm run dev
```

---

## 📊 Logs do Proxy

O Vite mostra logs do proxy no terminal:

```
[vite] http proxy: /edital/edital/ -> https://controlpanel.aws.leds.dev.br
```

Se você ver isso, o proxy está funcionando! ✅

---

## 🚀 Próximos Passos

1. ✅ Reiniciar servidor: `npm run dev`
2. ✅ Acessar: `http://localhost:3000`
3. ✅ Fazer login com credenciais reais
4. ✅ Testar funcionalidades

---

## 📞 Produção

Em produção, você tem 3 opções:

### Opção 1: Configurar CORS no Django
```python
CORS_ALLOWED_ORIGINS = [
    "https://seu-dominio.com",
]
```

### Opção 2: Usar Nginx como Proxy Reverso
```nginx
location /api/ {
    proxy_pass https://controlpanel.aws.leds.dev.br/;
}
```

### Opção 3: Hospedar Frontend e Backend no mesmo domínio

---

**Agora está tudo pronto! Reinicie o servidor e teste!** 🎉
