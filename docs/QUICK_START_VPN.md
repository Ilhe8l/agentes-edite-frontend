# 🚀 Guia Rápido - Conectar ao Django via VPN

## ⚡ Início Rápido (3 passos)

### 1️⃣ Alternar para Modo VPN

```bash
cd vue-edital-frontend
./switch-mode.sh vpn
```

### 2️⃣ Reiniciar o Servidor

```bash
npm run dev
```

### 3️⃣ Fazer Login

Acesse `http://localhost:3000` e faça login com suas credenciais do Django Admin.

---

## 🔧 Configuração do Django (Primeira Vez)

### Passo 1: Instalar Dependências

```bash
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
```

### Passo 2: Configurar CORS

Edite `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Adicionar no topo
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

### Passo 3: Adicionar Endpoints

Copie o conteúdo de `django_api_example.py` para suas views Django e configure as URLs conforme documentado.

---

## 📋 Checklist de Verificação

Antes de conectar, verifique:

- [ ] Está conectado à VPN
- [ ] Django está rodando em `https://controlpanel.aws.leds.dev.br`
- [ ] CORS está configurado no Django
- [ ] Endpoints da API foram criados
- [ ] Modo VPN está ativado no frontend (`./switch-mode.sh vpn`)

---

## 🔄 Alternar Entre Modos

### Usar Dados Mock (Offline)

```bash
./switch-mode.sh mock
npm run dev
```

### Usar Django na VPN (Online)

```bash
./switch-mode.sh vpn
npm run dev
```

---

## 🐛 Problemas Comuns

### ❌ Erro: CORS blocked

**Solução:** Configure CORS no Django (veja Passo 2 acima)

### ❌ Erro: Network Error

**Solução:** 
1. Verifique se está conectado à VPN
2. Teste a URL: `https://controlpanel.aws.leds.dev.br/api/editals/`

### ❌ Erro: 401 Unauthorized

**Solução:** Verifique se o endpoint `/api/auth/login/` está funcionando

### ❌ Erro: 404 Not Found

**Solução:** Crie os endpoints no Django usando `django_api_example.py`

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `VPN_SETUP.md` - Guia completo de configuração
- `django_api_example.py` - Código de exemplo para Django
- `TESTING.md` - Guia de testes

---

## 🆘 Precisa de Ajuda?

1. Verifique o console do navegador (F12)
2. Verifique os logs do Django
3. Consulte `VPN_SETUP.md` para troubleshooting detalhado
