#!/bin/bash

echo "🔐 Testando autenticação Django..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Fazer login e obter token
echo "1️⃣ Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8002/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"root8","password":"root8"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha no login${NC}"
    echo "Resposta: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido${NC}"
echo "Token: ${TOKEN:0:20}..."

# 2. Testar endpoint de conversas
echo ""
echo "2️⃣ Testando endpoint /discussao/conversa/..."
CONVERSA_RESPONSE=$(curl -s -H "Authorization: Token $TOKEN" \
  http://localhost:8002/discussao/conversa/)

echo "Resposta:"
echo $CONVERSA_RESPONSE | python3 -m json.tool 2>/dev/null || echo $CONVERSA_RESPONSE

# 3. Testar endpoint de mensagens
echo ""
echo "3️⃣ Testando endpoint /discussao/mensagem/..."
MENSAGEM_RESPONSE=$(curl -s -H "Authorization: Token $TOKEN" \
  http://localhost:8002/discussao/mensagem/)

echo "Resposta:"
echo $MENSAGEM_RESPONSE | python3 -m json.tool 2>/dev/null || echo $MENSAGEM_RESPONSE

echo ""
echo "🏁 Teste concluído!"