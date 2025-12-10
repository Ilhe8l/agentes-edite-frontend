# 🔧 Troubleshooting - Problemas Comuns

## ❌ Erro: Failed to resolve import

### Problema
```
Failed to resolve import "./api-client" from "src/common/api/auth.service.ts"
```

### Solução
```bash
# Executar script de correção de imports
./fix-imports.sh

# Reiniciar servidor
npm run dev
```

---

## ❌ Erro: Cannot find module '@/...'

### Problema
```
Cannot find module '@/stores/auth.store'
```

### Solução
Os paths mudaram! Use a nova estrutura:

| Antigo | Novo |
|--------|------|
| `@/stores/auth.store` | `@/common/store/auth` |
| `@/services/api-client` | `@/common/api/client` |
| `@/components/ui/Button` | `@/common/components/ui/Button` |
| `@/views/LoginPage` | `@/modules/autenticacao/views/LoginPage` |

```bash
# Corrigir automaticamente
./fix-imports.sh
```

---

## ❌ Erro: Port 3000 already in use

### Problema
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Solução
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
npm run dev -- --port 3001
```

---

## ❌ Erro: CORS blocked

### Problema
```
Access to XMLHttpRequest has been blocked by CORS policy
```

### Solução

1. **Configure CORS no Django:**

Abra `DJANGO_CORS_CONFIG.txt` e siga as instruções.

2. **Ou use modo mock:**

```bash
./switch-mode.sh mock
npm run dev
```

---

## ❌ Erro: 401 Unauthorized

### Problema
Não consegue fazer login no Django.

### Solução

1. **Verifique se está em modo mock:**

```bash
# .env.development
VITE_USE_MOCK=true  # ← Deve estar true para testar offline
```

2. **Ou configure Django:**

Siga `START_HERE.md` para integrar com Django real.

---

## ❌ Erro: Module not found

### Problema
```
Error: Cannot find module 'pinia'
```

### Solução
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## ❌ Erro: Vite cache

### Problema
Mudanças não aparecem ou erros estranhos.

### Solução
```bash
# Limpar cache do Vite
rm -rf node_modules/.vite

# Reiniciar
npm run dev
```

---

## ❌ Erro: TypeScript

### Problema
```
TS2307: Cannot find module '@/common/store/auth'
```

### Solução

1. **Verificar tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. **Reiniciar TypeScript server:**

No VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

---

## ❌ Erro: Network Error

### Problema
```
Network Error: Failed to fetch
```

### Solução

1. **Verifique se está conectado à VPN** (se usando Django real)

2. **Ou use modo mock:**

```bash
./switch-mode.sh mock
npm run dev
```

3. **Teste a conexão:**

```bash
./check-django-endpoints.sh
```

---

## ❌ Erro: Login não funciona

### Problema
Não consegue fazer login com nenhuma credencial.

### Solução

**Em modo mock**, qualquer credencial funciona:

```
Email: teste@teste.com
Senha: 123
```

**Em modo Django**, use credenciais reais do Django Admin.

---

## 🔄 Comandos de Reset

### Reset Completo

```bash
# 1. Limpar tudo
rm -rf node_modules package-lock.json
rm -rf node_modules/.vite

# 2. Reinstalar
npm install

# 3. Corrigir imports
./fix-imports.sh

# 4. Reiniciar
npm run dev
```

### Reset Parcial

```bash
# Apenas limpar cache
rm -rf node_modules/.vite
npm run dev
```

---

## 📞 Ainda com Problemas?

### 1. Verificar logs

Abra o console do navegador (F12) e veja os erros.

### 2. Verificar terminal

Veja os erros no terminal onde rodou `npm run dev`.

### 3. Verificar arquivos

```bash
# Verificar se arquivos existem
ls -la src/common/api/
ls -la src/common/store/
ls -la src/modules/
```

### 4. Verificar imports

```bash
# Buscar imports problemáticos
grep -r "@/services" src/
grep -r "@/stores" src/
grep -r "api-client" src/
```

---

## ✅ Checklist de Verificação

Antes de pedir ajuda, verifique:

- [ ] `npm install` foi executado
- [ ] `./fix-imports.sh` foi executado
- [ ] Servidor foi reiniciado
- [ ] Cache foi limpo (`rm -rf node_modules/.vite`)
- [ ] Modo correto está configurado (mock ou vpn)
- [ ] Console do navegador foi verificado
- [ ] Terminal foi verificado

---

## 🚀 Tudo Funcionando?

Se tudo estiver ok, você deve ver:

```
VITE v5.4.21  ready in 195 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

E ao acessar `http://localhost:3000`:

- ✅ Página de login carrega
- ✅ Consegue fazer login
- ✅ Redireciona para home
- ✅ Menu funciona
- ✅ Todas as páginas carregam

---

**Ainda com problemas?** Me envie:
1. Mensagem de erro completa
2. Arquivo onde ocorre o erro
3. Modo que está usando (mock ou vpn)
