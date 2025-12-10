================================================================================
CONFIGURAÇÃO CORS NO DJANGO - COPIE E COLE NO SEU settings.py
================================================================================

1. INSTALAR PACOTE:
-------------------
pip install django-cors-headers


2. ADICIONAR NO settings.py:
-----------------------------

# Em INSTALLED_APPS, adicione:
INSTALLED_APPS = [
    # ... suas apps existentes ...
    'corsheaders',  # <-- ADICIONAR ESTA LINHA
]

# Em MIDDLEWARE, adicione NO TOPO (primeira linha):
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # <-- ADICIONAR ESTA LINHA NO TOPO
    'django.middleware.security.SecurityMiddleware',
    # ... resto do middleware ...
]

# No final do arquivo, adicione:
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


3. REINICIAR O DJANGO:
----------------------
Após fazer as mudanças, reinicie o servidor Django.


================================================================================
PRONTO! Agora o Django vai aceitar requisições do frontend Vue.js
================================================================================
