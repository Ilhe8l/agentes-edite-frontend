# 🔗 Mapeamento de Endpoints Django → Frontend

## 📋 O que o Frontend Precisa

O frontend Vue.js precisa destes endpoints. Marque ✅ os que você já tem no Django:

### 1. Autenticação

| Endpoint | Método | O que faz | Tem no Django? |
|----------|--------|-----------|----------------|
| `/api/auth/login/` | POST | Login com email/senha, retorna JWT tokens | [ ] |
| `/api/auth/logout/` | POST | Logout | [ ] |
| `/api/auth/refresh/` | POST | Renovar access token | [ ] |
| `/api/auth/me/` | GET | Dados do usuário logado | [ ] |

**Request de Login:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response de Login:**
```json
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Nome do Usuário"
  },
  "tokens": {
    "access": "jwt_token...",
    "refresh": "jwt_token..."
  }
}
```

---

### 2. Editais

| Endpoint | Método | O que faz | Tem no Django? |
|----------|--------|-----------|----------------|
| `/api/editals/` | GET | Listar todos os editais | [ ] |
| `/api/editals/` | POST | Criar novo edital | [ ] |
| `/api/editals/{id}/` | GET | Detalhes de um edital | [ ] |
| `/api/editals/{id}/` | PUT | Atualizar edital | [ ] |
| `/api/editals/{id}/` | DELETE | Deletar edital | [ ] |

**Response de Listagem:**
```json
[
  {
    "id": "1",
    "title": "Edital 001/2024",
    "description": "Descrição...",
    "status": "open",
    "metadata": {},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z",
    "files": {
      "main_pdf": "url",
      "annexes": [],
      "results": []
    }
  }
]
```

---

### 3. Métricas

| Endpoint | Método | O que faz | Tem no Django? |
|----------|--------|-----------|----------------|
| `/api/metrics/engagement/` | GET | Métricas de engajamento | [ ] |
| `/api/metrics/messages/` | GET | Listar mensagens do chatbot | [ ] |

**Response de Engagement:**
```json
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

**Response de Messages:**
```json
[
  {
    "id": "1",
    "userId": "user_1",
    "userEmail": "maria@example.com",
    "question": "Pergunta...",
    "botResponse": "Resposta...",
    "timestamp": "2024-01-15T14:30:00Z",
    "editalId": "1"
  }
]
```

---

### 4. Histórico de Conversas

| Endpoint | Método | O que faz | Tem no Django? |
|----------|--------|-----------|----------------|
| `/api/history/sessions/` | GET | Listar sessões de conversa | [ ] |
| `/api/history/sessions/{id}/` | GET | Detalhes de uma sessão | [ ] |
| `/api/history/sessions/search/` | GET | Buscar sessões | [ ] |

**Response de Sessions:**
```json
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

**Response de Session Detail:**
```json
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
      "content": "Pergunta...",
      "timestamp": "2024-01-15T14:00:00Z"
    },
    {
      "id": "2",
      "role": "bot",
      "content": "Resposta...",
      "timestamp": "2024-01-15T14:01:00Z"
    }
  ]
}
```

---

## 🔄 Mapeamento dos Seus Endpoints

Preencha abaixo com os endpoints que você JÁ TEM no Django:

### Seus Endpoints Atuais:

**Autenticação:**
- Login: _______________________________________________
- Logout: ______________________________________________
- Refresh: _____________________________________________
- User Info: ___________________________________________

**Editais:**
- Listar: ______________________________________________
- Criar: _______________________________________________
- Detalhes: ____________________________________________
- Atualizar: ___________________________________________
- Deletar: _____________________________________________

**Mensagens/Discussão:**
- Listar mensagens: ____________________________________
- Métricas: ____________________________________________

**Conversas:**
- Listar conversas: ____________________________________
- Detalhes conversa: ___________________________________
- Buscar: ______________________________________________

---

## 🛠️ Próximos Passos

1. **Marque os endpoints que você JÁ TEM** no Django
2. **Anote os endpoints reais** na seção "Seus Endpoints Atuais"
3. **Me envie essa informação** para eu adaptar o frontend

Se os endpoints do Django forem diferentes dos que o frontend espera, eu vou:
- Criar um adapter/mapper no frontend
- Ou te dar o código para criar os endpoints faltantes no Django

---

## 💡 Dica

Se você não tem certeza de quais endpoints existem, rode no Django:

```bash
python manage.py show_urls
```

Ou veja o arquivo `urls.py` do seu projeto Django.
