# ✅ Checklist de Configuração Django

Use este checklist para garantir que o Django está configurado corretamente para integração com o frontend Vue.js.

## 📦 1. Instalação de Pacotes

```bash
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
```

- [ ] Django REST Framework instalado
- [ ] SimpleJWT instalado
- [ ] CORS Headers instalado

---

## ⚙️ 2. Configuração do settings.py

### 2.1 INSTALLED_APPS

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    
    # Your apps
    'apps_core',
    'apps_edital',
    'apps_discussao',
]
```

- [ ] `rest_framework` adicionado
- [ ] `corsheaders` adicionado

### 2.2 MIDDLEWARE

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ⚠️ Deve ser o primeiro!
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

- [ ] `CorsMiddleware` adicionado no topo

### 2.3 CORS Configuration

```python
# CORS Settings
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

- [ ] `CORS_ALLOWED_ORIGINS` configurado
- [ ] `CORS_ALLOW_CREDENTIALS = True`
- [ ] Headers permitidos configurados

### 2.4 REST Framework Configuration

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}
```

- [ ] JWT Authentication configurado
- [ ] Permissions configuradas
- [ ] Paginação configurada

### 2.5 SimpleJWT Configuration

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

- [ ] Token lifetime configurado
- [ ] Refresh token configurado

---

## 🔗 3. URLs Configuration

### 3.1 Criar arquivo de URLs da API

Crie `api/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    # Autenticação
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', views.refresh_token_view, name='refresh'),
    path('auth/me/', views.current_user_view, name='current_user'),
    
    # Editais
    path('editals/', views.edital_list_create, name='edital-list'),
    path('editals/<int:pk>/', views.edital_detail, name='edital-detail'),
    
    # Métricas
    path('metrics/engagement/', views.engagement_metrics, name='engagement'),
    path('metrics/messages/', views.messages_list, name='messages'),
    
    # Histórico
    path('history/sessions/', views.sessions_list, name='sessions'),
    path('history/sessions/<int:pk>/', views.session_detail, name='session-detail'),
    path('history/sessions/search/', views.sessions_search, name='sessions-search'),
]
```

- [ ] Arquivo `api/urls.py` criado
- [ ] Endpoints de autenticação configurados
- [ ] Endpoints de editais configurados
- [ ] Endpoints de métricas configurados
- [ ] Endpoints de histórico configurados

### 3.2 Incluir URLs no projeto principal

Em `project/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # ⚠️ Adicionar esta linha
]
```

- [ ] URLs da API incluídas no projeto principal

---

## 📝 4. Views Implementation

Copie o conteúdo de `django_api_example.py` para suas views.

- [ ] `login_view` implementada
- [ ] `logout_view` implementada
- [ ] `refresh_token_view` implementada
- [ ] `current_user_view` implementada
- [ ] `edital_list_create` implementada
- [ ] `edital_detail` implementada
- [ ] `engagement_metrics` implementada
- [ ] `messages_list` implementada
- [ ] `sessions_list` implementada
- [ ] `session_detail` implementada
- [ ] `sessions_search` implementada

---

## 🗄️ 5. Models Verification

Verifique se seus models têm os campos necessários:

### Edital Model

```python
class Edital(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    main_pdf = models.FileField(upload_to='editals/', null=True, blank=True)
```

- [ ] Model Edital existe
- [ ] Campos necessários presentes

### Mensagem Model

```python
class Mensagem(models.Model):
    user_id = models.CharField(max_length=255)
    user_email = models.EmailField()
    question = models.TextField()
    bot_response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    edital = models.ForeignKey(Edital, on_delete=models.CASCADE)
```

- [ ] Model Mensagem existe
- [ ] Campos necessários presentes

### Conversa Model

```python
class Conversa(models.Model):
    user_id = models.CharField(max_length=255)
    user_email = models.EmailField()
    iniciado_em = models.DateTimeField(auto_now_add=True)
    encerrado_em = models.DateTimeField(null=True, blank=True)
    edital = models.ForeignKey(Edital, on_delete=models.CASCADE, null=True)
```

- [ ] Model Conversa existe
- [ ] Campos necessários presentes

---

## 🧪 6. Testes

### 6.1 Testar Endpoints Manualmente

Use o Django Admin ou curl para testar:

```bash
# Testar login
curl -X POST https://controlpanel.aws.leds.dev.br/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'

# Testar listagem de editais (com token)
curl -X GET https://controlpanel.aws.leds.dev.br/api/editals/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

- [ ] Endpoint de login testado
- [ ] Endpoint de editais testado
- [ ] Endpoint de métricas testado
- [ ] Endpoint de histórico testado

### 6.2 Testar CORS

Abra o console do navegador em `http://localhost:3000` e execute:

```javascript
fetch('https://controlpanel.aws.leds.dev.br/api/editals/')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

- [ ] CORS funcionando (sem erro de CORS no console)

---

## 🔐 7. Segurança

```python
# settings.py

# HTTPS
SECURE_SSL_REDIRECT = True  # Em produção
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CSRF
CSRF_TRUSTED_ORIGINS = [
    'https://controlpanel.aws.leds.dev.br',
]
```

- [ ] HTTPS configurado (produção)
- [ ] Security headers configurados
- [ ] CSRF trusted origins configurado

---

## 🚀 8. Deploy

### 8.1 Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

- [ ] Migrations criadas
- [ ] Migrations aplicadas

### 8.2 Collect Static

```bash
python manage.py collectstatic --noinput
```

- [ ] Static files coletados

### 8.3 Restart Server

```bash
# Gunicorn
sudo systemctl restart gunicorn

# ou Docker
docker-compose restart django
```

- [ ] Servidor reiniciado

---

## ✅ Verificação Final

Teste o fluxo completo:

1. [ ] Frontend consegue fazer login
2. [ ] Frontend consegue listar editais
3. [ ] Frontend consegue ver métricas
4. [ ] Frontend consegue ver histórico
5. [ ] Tokens são renovados automaticamente
6. [ ] Logout funciona corretamente

---

## 📞 Troubleshooting

### Erro: CORS blocked

- Verifique se `corsheaders` está instalado
- Verifique se `CorsMiddleware` está no topo do MIDDLEWARE
- Verifique se a origem está em `CORS_ALLOWED_ORIGINS`

### Erro: 401 Unauthorized

- Verifique se JWT está configurado
- Verifique se o token está sendo enviado no header
- Verifique se o token não expirou

### Erro: 404 Not Found

- Verifique se as URLs estão configuradas corretamente
- Verifique se `api/urls.py` está incluído no projeto principal
- Verifique se as views existem

### Erro: 500 Internal Server Error

- Verifique os logs do Django
- Verifique se os models existem
- Verifique se as migrations foram aplicadas

---

## 📚 Recursos

- `django_api_example.py` - Código completo de exemplo
- `VPN_SETUP.md` - Guia de configuração VPN
- `QUICK_START_VPN.md` - Guia rápido de início
