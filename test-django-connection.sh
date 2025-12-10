#!/bin/bash

echo "🔍 Testando conexão com Django..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Teste 1: Django está rodando?
echo "1️⃣  Verificando se Django está rodando na porta 8002..."
if curl -s http://localhost:8002/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Django está rodando!${NC}"
else
    echo -e "${RED}❌ Django NÃO está rodando na porta 8002${NC}"
    echo ""
    echo "Tente:"
    echo "  - Verificar se o Django está rodando: docker ps"
    echo "  - Verificar a porta correta: netstat -tulpn | grep python"
    echo "  - Iniciar o Django: docker-compose up (no diretório do Django)"
    exit 1
fi

echo ""

# Teste 2: Endpoint de login existe?
echo "2️⃣  Testando endpoint /api-token-auth/..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8002/api-token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"root8","password":"root8"}' 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Endpoint funciona! Token recebido${NC}"
    echo "Resposta: $BODY"
elif [ "$HTTP_CODE" = "400" ]; then
    echo -e "${YELLOW}⚠️  Endpoint existe mas credenciais podem estar erradas${NC}"
    echo "HTTP Code: $HTTP_CODE"
    echo "Resposta: $BODY"
elif [ "$HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ Endpoint /api-token-auth/ não existe${NC}"
    echo "Verifique se o endpoint está configurado no Django"
else
    echo -e "${RED}❌ Erro ao acessar endpoint${NC}"
    echo "HTTP Code: $HTTP_CODE"
    echo "Resposta: $BODY"
fi

echo ""

# Teste 3: CORS configurado?
echo "3️⃣  Testando CORS..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS http://localhost:8002/api-token-auth/ \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" 2>&1)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS está configurado!${NC}"
    echo "$CORS_RESPONSE" | grep "Access-Control"
else
    echo -e "${RED}❌ CORS NÃO está configurado${NC}"
    echo ""
    echo "Você precisa configurar CORS no Django!"
    echo "Veja o arquivo CORS_FIX.md para instruções"
fi

echo ""
echo "🏁 Teste concluído!"
