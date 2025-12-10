# 🔧 Corrigir Erro 400 - CSRF Token

## ❌ Problema

O Django está retornando erro 400 para requisições do frontend, mas funciona com curl.
Isso geralmente indica problema com CSRF token.

## ✅ Solução

### Opção 1: Desabilitar CSRF para API de login (Recomendado)

No seu Django, adicione esta configuração no `settings.py`:

```python
# settings.py ou settings/local.py

# Desabilitar CSRF para endpoints de API
CSRF_EXEMPT_URLS = [
    r'^/api-token-auth/$',
]

# Ou, se estiver usando Django REST Framework:
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# Para endpoints de autenticação, desabilite CSRF
from django.views.decorators.csrf import csrf_exempt
```

### Opção 2: Configurar CSRF corretamente

Se quiser manter CSRF ativo, adicione estas configurações:

```python
# settings.py
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Permitir CSRF cookie ser lido pelo JavaScript
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
```

E no frontend, você precisaria obter o CSRF token primeiro.

### Opção 3: Verificar se o endpoint está usando @csrf_exempt

No arquivo onde está definido o endpoint `/api-token-auth/`, verifique se tem:

```python
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class YourLoginView(APIView):
    # ...
```

## 🔍 Debug

### 1. Verificar logs do Django

Olhe os logs do Django quando o erro 400 acontece. Deve mostrar algo como:

```
Forbidden (CSRF token missing or incorrect)
```

### 2. Testar com CSRF desabilitado temporariamente

Adicione temporariamente no `settings.py`:

```python
# APENAS PARA TESTE - NÃO USE EM PRODUÇÃO
CSRF_COOKIE_SECURE = False
CSRF_USE_SESSIONS = False
```

### 3. Verificar se é Django REST Framework

Se estiver usando DRF, o endpoint pode estar configurado diferente.
Verifique se tem `rest_framework.authtoken` em `INSTALLED_APPS`.

## 📝 Recomendação

Para APIs, é comum desabilitar CSRF e usar autenticação por token.
A **Opção 1** é a mais recomendada para APIs REST.