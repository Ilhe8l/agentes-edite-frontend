# 🔧 Como Criar API no Django

## 📋 Situação Atual

O Django Control Panel **não tem API REST exposta** ainda. Você tem duas opções:

---

## ✅ OPÇÃO 1: Criar API REST (Recomendado)

### Passo 1: Instalar Django REST Framework

```bash
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
```

### Passo 2: Configurar settings.py

```python
INSTALLED_APPS = [
    # ... suas apps existentes ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # NO TOPO!
    # ... resto do middleware ...
]

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]
CORS_ALLOW_CREDENTIALS = True

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

### Passo 3: Criar Serializers

Crie `api/serializers.py`:

```python
from rest_framework import serializers
from apps_edital.models import Edital
from apps_discussao.models import Mensagem, Conversa

class EditalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Edital
        fields = '__all__'

class MensagemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensagem
        fields = '__all__'

class ConversaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversa
        fields = '__all__'
```

### Passo 4: Criar Views

Crie `api/views.py`:

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps_edital.models import Edital
from apps_discussao.models import Mensagem, Conversa
from .serializers import EditalSerializer, MensagemSerializer, ConversaSerializer

class EditalViewSet(viewsets.ModelViewSet):
    queryset = Edital.objects.all()
    serializer_class = EditalSerializer
    permission_classes = [IsAuthenticated]

class MensagemViewSet(viewsets.ModelViewSet):
    queryset = Mensagem.objects.all()
    serializer_class = MensagemSerializer
    permission_classes = [IsAuthenticated]

class ConversaViewSet(viewsets.ModelViewSet):
    queryset = Conversa.objects.all()
    serializer_class = ConversaSerializer
    permission_classes = [IsAuthenticated]
```

### Passo 5: Configurar URLs

Crie `api/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register('editals', views.EditalViewSet)
router.register('messages', views.MensagemViewSet)
router.register('conversations', views.ConversaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

No `urls.py` principal:

```python
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # ADICIONAR ESTA LINHA
]
```

### Passo 6: Testar

```bash
# Reiniciar Django
python manage.py runserver

# Testar
curl http://localhost:8000/api/
```

---

## ✅ OPÇÃO 2: Usar Django Admin como API (Temporário)

Se você não pode modificar o Django agora, posso criar um **adapter** no frontend que:

1. Faz scraping do Django Admin
2. Extrai dados das páginas HTML
3. Simula uma API

**Desvantagens:**
- Mais lento
- Menos confiável
- Difícil de manter

---

## ✅ OPÇÃO 3: Usar Dados Mock (Atual)

Continue usando dados fictícios até a API estar pronta:

```bash
# .env.development
VITE_USE_MOCK=true
```

---

## 🎯 Qual Opção Escolher?

### Se você pode modificar o Django:
→ **OPÇÃO 1** (Criar API REST) - 30 minutos de trabalho

### Se não pode modificar agora:
→ **OPÇÃO 3** (Mock) - Continue testando com dados fictícios

### Se precisa urgente e não pode modificar:
→ **OPÇÃO 2** (Adapter) - Posso criar, mas não é ideal

---

## 📞 Me Diga:

1. **Você tem acesso ao código do Django?**
   - Sim → Vou te dar o código completo para copiar/colar
   - Não → Vou criar um adapter ou você usa mock

2. **Qual é a estrutura dos models?**
   - Edital tem quais campos?
   - Mensagem tem quais campos?
   - Conversa tem quais campos?

3. **Você quer que eu crie o código da API para você?**
   - Sim → Me diga os campos dos models
   - Não → Continue com mock

---

## 🚀 Código Pronto para Copiar

Se você quiser, posso gerar o código completo da API baseado nos screenshots que você mostrou do Django Admin. Só me confirme:

1. Você tem acesso ao código?
2. Quer que eu crie a API completa?
3. Quais são os campos dos models (ou me mostre um screenshot)?

**Com essas informações, crio a API completa em 5 minutos!** 🎉
