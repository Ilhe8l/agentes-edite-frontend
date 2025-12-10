# 🔧 Configurar Autenticação por Token no Django

## ❌ Problema Atual

Os endpoints `/discussao/conversa/` e `/discussao/mensagem/` estão retornando:
```json
{"detail": "As credenciais de autenticação não foram fornecidas."}
```

Mesmo enviando o token correto: `Authorization: Token 7986e8a74e27350bcbd12fe5ea354a8fe504f07a`

## ✅ Solução

### 1. Verificar se `rest_framework.authtoken` está instalado

No seu `settings.py` (ou `settings/local.py`):

```python
INSTALLED_APPS = [
    # ... outras apps
    'rest_framework',
    'rest_framework.authtoken',  # ← Certifique-se que está aqui
    # ... suas apps
    'apps_discussao',  # ou como você nomeou
]
```

### 2. Configurar autenticação no DRF

Adicione/verifique no `settings.py`:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # Para admin
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### 3. Verificar as Views de Discussão

No arquivo onde estão definidas as views de `/discussao/conversa/` e `/discussao/mensagem/`, certifique-se que estão usando DRF:

```python
from rest_framework import viewsets, permissions
from rest_framework.authentication import TokenAuthentication

class ConversaViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Retornar apenas conversas do usuário autenticado
        return Conversa.objects.filter(questionador=self.request.user)

class MensagemViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Retornar apenas mensagens das conversas do usuário
        return Mensagem.objects.filter(conversa__questionador=self.request.user)
```

### 4. Verificar URLs

No `urls.py` da app discussao:

```python
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'conversa', views.ConversaViewSet, basename='conversa')
router.register(r'mensagem', views.MensagemViewSet, basename='mensagem')

urlpatterns = [
    # ... outras URLs
] + router.urls
```

### 5. Migrar para criar tabelas de token

Se ainda não fez:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Criar token para usuário existente (se necessário)

No shell do Django:

```python
python manage.py shell

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Criar token para o usuário root8
user = User.objects.get(username='root8')
token, created = Token.objects.get_or_create(user=user)
print(f"Token: {token.key}")
```

## 🔍 Testar

Depois das configurações:

```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST http://localhost:8002/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"root8","password":"root8"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Testar conversas
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8002/discussao/conversa/

# 3. Testar mensagens  
curl -H "Authorization: Token $TOKEN" \
  http://localhost:8002/discussao/mensagem/
```

## 📝 Exemplo Completo de ViewSet

```python
# apps_discussao/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Conversa, Mensagem
from .serializers import ConversaSerializer, MensagemSerializer

class ConversaViewSet(viewsets.ModelViewSet):
    serializer_class = ConversaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filtrar por usuário autenticado
        user = self.request.user
        return Conversa.objects.filter(
            Q(questionador=user) | Q(respondente=user)
        ).order_by('-iniciada_em')
    
    def list(self, request):
        queryset = self.get_queryset()
        
        # Paginação
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 10)), 1000)
        
        start = (page - 1) * per_page
        end = start + per_page
        
        total = queryset.count()
        data = queryset[start:end]
        
        serializer = self.get_serializer(data, many=True)
        
        return Response({
            'meta': {
                'current_page': page,
                'per_page': per_page,
                'max_per_page': 1000,
                'total': total
            },
            'data': serializer.data
        })

class MensagemViewSet(viewsets.ModelViewSet):
    serializer_class = MensagemSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Mensagem.objects.filter(
            Q(conversa__questionador=user) | Q(conversa__respondente=user)
        ).order_by('-criada_em')
        
        # Filtrar por conversa se especificado
        conversa_id = self.request.GET.get('conversa')
        if conversa_id:
            queryset = queryset.filter(conversa_id=conversa_id)
            
        return queryset
    
    def list(self, request):
        queryset = self.get_queryset()
        
        # Paginação
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 10)), 1000)
        
        start = (page - 1) * per_page
        end = start + per_page
        
        total = queryset.count()
        data = queryset[start:end]
        
        serializer = self.get_serializer(data, many=True)
        
        return Response({
            'meta': {
                'current_page': page,
                'per_page': per_page,
                'max_per_page': 1000,
                'total': total
            },
            'data': serializer.data
        })
```

## 🚨 Importante

1. **Reinicie o Django** após as mudanças
2. **Faça as migrações** se adicionou `rest_framework.authtoken`
3. **Teste com curl** antes de testar no frontend
4. **Verifique os logs** do Django para ver erros detalhados

## 🔧 Se ainda não funcionar

Verifique:

1. **Logs do Django** quando faz a requisição
2. **Se o usuário root8 existe** e tem token
3. **Se as URLs estão corretas** no `urls.py`
4. **Se não há middleware bloqueando**

Quer que eu ajude com alguma parte específica?