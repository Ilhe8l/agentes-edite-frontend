// Teste rápido para verificar se o frontend consegue acessar o Django
// Execute no console do navegador (F12 → Console)

async function testDjangoConnection() {
  console.log('🔍 Testando conexão frontend → Django...');
  
  try {
    // 1. Verificar se há token
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('❌ Nenhum token encontrado. Faça login primeiro.');
      return;
    }
    
    console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
    
    // 2. Testar requisição para conversas
    const response = await fetch('http://localhost:8002/discussao/conversa/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data.meta.total, 'conversas');
      console.log('📊 Primeira conversa:', data.data[0]);
      return data;
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
  }
}

// Executar o teste
testDjangoConnection();