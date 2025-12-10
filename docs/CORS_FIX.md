# 🔧 Corrigir Erro de CORS

## ❌ Erro Atual

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at http://localhost:8002/api-token-auth/. 
(Reason: CORS request did not succeed)
```

## ✅ Solução

O Django precisa estar configurado para aceitar requisições do frontend em `http://localhost:3000`.

### 1. Verificar se django-cors-headers está instalado

No seu Django, verifique se o pacote está instalado:

```bash
pip list | grep django-cors-headers
```

Se não estiver instalado:

```bash
pip install django-cors-headers
```

### 2. Configurar settings.py do Django

Adicione/verifique estas configurações no arquivo `settings.py` (ou `settings/local.py`):

```python
# settings.py ou settings/local.py

INSTALLED_APPS = [
    # ... outras apps
    'corsheaders',  # ← Adicione isso
    # ... resto das apps
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← Adicione no TOPO
    'django.middleware.common.CommonMiddleware',
    # ... resto dos middlewares
]

# Configuração CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Ou, para desenvolvimento, pode usar (NÃO use em produção):
# CORS_ALLOW_ALL_ORIGINS = True

# Permitir credenciais (cookies, auth headers)
CORS_ALLOW_CREDENTIALS = True

# Headers permitidos
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

### 3. Verificar se o endpoint existe

Teste se o endpoint está funcionando:

```bash
curl -X POST http://localhost:8002/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"root8","password":"root8"}'
```

Resposta esperada:
```json
{
  "token": "abc123..."
}
```

### 4. Reiniciar o Django

Após fazer as alterações:

```bash
# Se estiver usando Docker
docker-compose restart

# Ou se estiver rodando direto
python manage.py runserver 0.0.0.0:8002
```

### 5. Reiniciar o Frontend

```bash
# No terminal do frontend
# Ctrl+C para parar
npm run dev
```

## 🔍 Debug Adicional

### Verificar se Django está rodando

```bash
curl http://localhost:8002/
```

Se não responder, o Django não está rodando na porta 8002.

### Verificar logs do Django

Olhe os logs do Django quando tentar fazer login. Você deve ver:

```
[timestamp] "POST /api-token-auth/ HTTP/1.1" 200
```

Se ver `404`, o endpoint não existe.
Se ver `403`, é problema de CORS ou CSRF.

### Testar com Postman/Insomnia

Teste o endpoint diretamente com Postman ou Insomnia:

```
POST http://localhost:8002/api-token-auth/
Content-Type: application/json

{
  "username": "root8",
  "password": "root8"
}
```

## 📝 Checklist

- [ ] django-cors-headers instalado
- [ ] 'corsheaders' em INSTALLED_APPS
- [ ] CorsMiddleware no topo de MIDDLEWARE
- [ ] CORS_ALLOWED_ORIGINS configurado com http://localhost:3000
- [ ] Django reiniciado
- [ ] Frontend reiniciado
- [ ] Endpoint /api-token-auth/ existe e responde

## 🆘 Se ainda não funcionar

1. **Verifique a porta do Django**:
   ```bash
   docker ps
   # ou
   netstat -tulpn | grep 8002
   ```

2. **Verifique se há proxy/firewall bloqueando**

3. **Tente com CORS_ALLOW_ALL_ORIGINS = True** (apenas para testar):
   ```python
   CORS_ALLOW_ALL_ORIGINS = True  # APENAS PARA TESTE
   ```

4. **Verifique se o Django está escutando em 0.0.0.0**:
   ```bash
   python manage.py runserver 0.0.0.0:8002
   ```
   
   Não use apenas `127.0.0.1:8002`

## 📚 Referências

- [django-cors-headers docs](https://github.com/adamchainz/django-cors-headers)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
