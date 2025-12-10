# Configuração de Conexão com Django via VPN

## 🔐 Visão Geral

Este guia explica como conectar o frontend Vue.js ao backend Django que está rodando dentro da VPN.

## 📋 Pré-requisitos

1. Estar conectado à VPN
2. Ter acesso ao Django Admin (conforme screenshots)
3. Conhecer a URL do Django na VPN

## 🔧 Configuração

### 1. Identificar a URL do Django

Baseado nos screenshots, sua URL do Django é:
```
https://controlpanel.aws.leds.dev.br
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.development`:

```bash
# API Base URL - Django na VPN
VITE_API_BASE_URL=https://controlpanel.aws.leds.dev.br/api

# Desabilitar mock para usar dados reais
VITE_USE_MOCK=false
```

### 3. Configurar CORS no Django

O Django precisa permitir requisições do frontend. Adicione no `settings.py`:

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Adicionar no topo
    'django.middleware.common.CommonMiddleware',
    # ...
]

# Configuração CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
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

Instale o pacote CORS:
```bash
pip install django-cors-headers
```

## 🔌 Endpoints Necessários no Django

Baseado na estrutura do Django Admin, você precisa criar/expor estes endpoints:

### 1. Autenticação

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/auth/login/', views.login_view, name='login'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/auth/refresh/', views.refresh_token_view, name='refresh'),
    path('api/auth/me/', views.current_user_view, name='current_user'),
]
```

**POST /api/auth/login/**
```json
Request:
{
  "email": "user@example.com",
  "password": "senha123"
}

Response:
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. Editais (APPS_EDITAL)

```python
# urls.py
urlpatterns += [
    path('api/editals/', views.edital_list_create, name='edital-list'),
    path('api/editals/<int:pk>/', views.edital_detail, name='edital-detail'),
    path('api/editals/<int:pk>/upload/', views.edital_upload, name='edital-upload'),
]
```

**GET /api/editals/**
```json
Response:
[
  {
    "id": "1",
    "title": "Edital de Chamada Pública nº 001/2024",
    "description": "Descrição do edital",
    "status": "open",
    "metadata": {
      "prazo": "31/01/2024",
      "valor": "R$ 50.000"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z",
    "files": {
      "main_pdf": "url_do_pdf",
      "annexes": [],
      "results": []
    }
  }
]
```

### 3. Métricas (APPS_DISCUSSAO)

```python
# urls.py
urlpatterns += [
    path('api/metrics/engagement/', views.engagement_metrics, name='engagement'),
    path('api/metrics/messages/', views.messages_list, name='messages'),
]
```

**GET /api/metrics/engagement/**
```json
Response:
{
  "total_messages": 760,
  "total_users": 111,
  "total_editals": 5,
  "editals": [
    {
      "id": "1",
      "title": "Edital 001/2024",
      "messageCount": 245,
      "uniqueUsers": 32,
      "lastMessage": "2024-01-15"
    }
  ]
}
```

**GET /api/metrics/messages/?edital_id=1**
```json
Response:
[
  {
    "id": "1",
    "userId": "user_1",
    "userEmail": "maria@example.com",
    "question": "Qual é a data limite?",
    "botResponse": "A data limite é 31/01/2024",
    "timestamp": "2024-01-15T14:30:00Z",
    "editalId": "1"
  }
]
```

### 4. Histórico de Conversas

```python
# urls.py
urlpatterns += [
    path('api/history/sessions/', views.sessions_list, name='sessions'),
    path('api/history/sessions/<int:pk>/', views.session_detail, name='session-detail'),
    path('api/history/sessions/search/', views.sessions_search, name='sessions-search'),
]
```

**GET /api/history/sessions/?limit=50&offset=0**
```json
Response:
[
  {
    "id": "1",
    "userId": "user_1",
    "userEmail": "maria@example.com",
    "startTime": "2024-01-15T14:00:00Z",
    "endTime": "2024-01-15T14:35:00Z",
    "messageCount": 8,
    "edital": "Edital 001/2024"
  }
]
```

**GET /api/history/sessions/1/**
```json
Response:
{
  "id": "1",
  "userId": "user_1",
  "userEmail": "maria@example.com",
  "startTime": "2024-01-15T14:00:00Z",
  "endTime": "2024-01-15T14:35:00Z",
  "messageCount": 8,
  "edital": "Edital 001/2024",
  "messages": [
    {
      "id": "1",
      "role": "user",
      "content": "Qual é a data limite?",
      "timestamp": "2024-01-15T14:00:00Z"
    },
    {
      "id": "2",
      "role": "bot",
      "content": "A data limite é 31/01/2024",
      "timestamp": "2024-01-15T14:01:00Z"
    }
  ]
}
```

## 🔍 Mapeamento Django Admin → API

Baseado nos screenshots do Django Admin:

| Django Admin | API Endpoint | Descrição |
|--------------|--------------|-----------|
| Usuários | `/api/auth/login/` | Autenticação |
| Editais | `/api/editals/` | Gestão de editais |
| Mensagens | `/api/metrics/messages/` | Mensagens do chatbot |
| Conversas | `/api/history/sessions/` | Histórico de conversas |

## 🧪 Testando a Conexão

### 1. Desabilitar Mock Mode

```bash
cd vue-edital-frontend
```

Edite `.env.development`:
```bash
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://controlpanel.aws.leds.dev.br/api
```

### 2. Reiniciar o Servidor

```bash
npm run dev
```

### 3. Testar Login

Acesse `http://localhost:3000` e tente fazer login com suas credenciais do Django Admin.

### 4. Verificar Console do Navegador

Abra o DevTools (F12) e verifique:
- Network tab: veja as requisições para o Django
- Console tab: veja logs de erro

## 🐛 Troubleshooting

### Erro: CORS blocked

**Problema:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solução:** Configure CORS no Django (veja seção 3)

### Erro: 401 Unauthorized

**Problema:** Token de autenticação inválido

**Solução:** 
1. Verifique se o endpoint `/api/auth/login/` está retornando tokens JWT
2. Verifique se o Django está validando o token corretamente

### Erro: Network Error

**Problema:** Não consegue conectar ao Django

**Solução:**
1. Verifique se está conectado à VPN
2. Teste a URL no navegador: `https://controlpanel.aws.leds.dev.br/api/editals/`
3. Verifique se o Django está rodando

### Erro: 404 Not Found

**Problema:** Endpoint não existe

**Solução:** Crie os endpoints no Django conforme documentado acima

## 📝 Exemplo de View Django

```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=email, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.get_full_name() or user.username
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })
    
    return Response(
        {'error': 'Credenciais inválidas'},
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def edital_list_create(request):
    from .models import Edital
    
    editals = Edital.objects.all()
    data = [
        {
            'id': str(e.id),
            'title': e.title,
            'description': e.description,
            'status': e.status,
            'metadata': e.metadata,
            'created_at': e.created_at.isoformat(),
            'updated_at': e.updated_at.isoformat(),
            'files': {
                'main_pdf': e.main_pdf.url if e.main_pdf else None,
                'annexes': [],
                'results': []
            }
        }
        for e in editals
    ]
    
    return Response(data)
```

## 🚀 Próximos Passos

1. ✅ Configurar CORS no Django
2. ✅ Criar endpoints de API no Django
3. ✅ Desabilitar mock mode no frontend
4. ✅ Testar autenticação
5. ✅ Testar listagem de editais
6. ✅ Testar métricas e histórico

## 📞 Suporte

Se encontrar problemas, verifique:
1. Console do navegador (F12)
2. Logs do Django
3. Status da VPN
4. Configuração de CORS
