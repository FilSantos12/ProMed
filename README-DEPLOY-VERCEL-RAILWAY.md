# 🚀 Deploy ProMed - Vercel + Railway

**A combinação ideal!** Frontend no Vercel + Backend no Railway

---

## 🎯 Por que Vercel + Railway?

### ✅ Vercel (Frontend)
- Especialista em React/Vite
- CDN global (site rápido em todo mundo)
- Build otimizado automático
- Deploy automático via Git
- **Você já conhece!**

### ✅ Railway (Backend + MySQL)
- Laravel + MySQL com 1 clique
- Deploy automático via Git
- Logs em tempo real
- Fácil de configurar

### 💰 Custo
- **Vercel:** $0/mês (plano Hobby)
- **Railway:** $0-3/mês (crédito de $5/mês)
- **Total:** **$0-3/mês**

---

## ⚡ Início Rápido (10 minutos)

### 1. Preparar Projeto
```bash
preparar-vercel-railway.bat
```

Isso vai:
- Verificar arquivos de configuração
- Tornar scripts executáveis
- Gerar APP_KEY para Railway
- Mostrar status do Git

### 2. Deploy Backend (Railway)
- Acesse: https://railway.app
- Login with GitHub
- New Project → Deploy from GitHub → **promed**
- Root Directory: `backend`
- Adicione MySQL (+ New → Database → MySQL)
- Configure variáveis (veja guia)
- Gere domínio público
- Execute migrations

### 3. Deploy Frontend (Vercel)
- Atualize `.env.production` com URL do Railway
- Commit e push
- Acesse: https://vercel.com
- Add New → Project → Import **promed**
- Configure variável `VITE_API_URL`
- Deploy

### 4. Atualizar CORS
- Railway → Backend → Variables
- Atualize `FRONTEND_URL` com URL do Vercel

---

## 📚 Documentação

### 📖 Guia Completo
**GUIA_VERCEL_RAILWAY.md** - Instruções detalhadas com solução de problemas

### ⚡ Guia Rápido
**INICIO-RAPIDO-VERCEL-RAILWAY.md** - Passo a passo resumido

### 🚀 Script de Preparação
**preparar-vercel-railway.bat** - Automatiza preparação do projeto

---

## 📁 Arquivos Criados

### Frontend (Vercel)
```
vercel.json              → Configuração do Vercel
.env.production          → Variáveis de ambiente
vite.config.ts           → Atualizado para produção
```

### Backend (Railway)
```
backend/Procfile         → Como iniciar o servidor
backend/railway.json     → Configuração do Railway
backend/railway-start.sh → Script de inicialização
backend/config/cors.php  → CORS atualizado
```

### Scripts
```
preparar-vercel-railway.bat → Preparação automática
```

---

## 🎯 Fluxo Completo

```
1. Execute: preparar-vercel-railway.bat
   └─> Verifica tudo, gera APP_KEY

2. Railway (Backend):
   └─> Deploy from GitHub (pasta backend/)
   └─> Adiciona MySQL
   └─> Configura variáveis
   └─> Gera domínio (ex: promed-backend.up.railway.app)
   └─> Executa migrations

3. Vercel (Frontend):
   └─> Atualiza .env.production
   └─> Commit e push
   └─> Import from GitHub
   └─> Configura VITE_API_URL
   └─> Deploy (ex: promed.vercel.app)

4. Finalizar:
   └─> Atualiza FRONTEND_URL no Railway
   └─> Testa aplicação completa
```

---

## ✅ Checklist

### Antes de começar:
- [ ] Git configurado
- [ ] Código no GitHub
- [ ] Conta no Vercel (você já tem!)
- [ ] Conta no Railway (criar se não tiver)

### Backend (Railway):
- [ ] Projeto criado
- [ ] MySQL adicionado
- [ ] Variáveis configuradas:
  - [ ] APP_KEY
  - [ ] DB_* (automático)
  - [ ] FRONTEND_URL
  - [ ] APP_URL
- [ ] Domínio gerado
- [ ] Migrations executadas
- [ ] API testada (`/api/specialties`)

### Frontend (Vercel):
- [ ] `.env.production` atualizado
- [ ] Código commitado e pushed
- [ ] Projeto importado
- [ ] `VITE_API_URL` configurado
- [ ] Build bem-sucedido
- [ ] Homepage carrega

### Testes finais:
- [ ] Homepage abre
- [ ] Listagem de médicos funciona
- [ ] Login funciona
- [ ] Cadastro funciona
- [ ] Agendamento funciona
- [ ] Dashboard funciona
- [ ] Sem erros CORS

---

## 🔄 Atualizações Futuras

Depois do deploy inicial, atualizar é **muito fácil**:

```bash
# Fez alterações no código?
git add .
git commit -m "Descrição da alteração"
git push origin main

# Pronto! Vercel E Railway fazem deploy automático! 🎉
```

**Frontend:** Deploy automático em ~1-2 min
**Backend:** Deploy automático em ~2-3 min

---

## 🐛 Problemas Comuns

### CORS Error
**Sintoma:** Erro no console do browser
```
Access-Control-Allow-Origin
```

**Solução:**
1. Railway → Backend → Variables
2. Verifique `FRONTEND_URL` tem URL correta do Vercel
3. Salve (Railway redeploy automático)

### API retorna 500
**Solução:**
1. Railway → Backend → Deployments → Ver logs
2. Causas comuns:
   - APP_KEY não configurado
   - Migrations não executadas

### Build Vercel falha
**Solução:**
1. Vercel → Deployments → Ver build logs
2. Causas comuns:
   - Erro TypeScript
   - Dependências faltando

### Imagens não carregam
**Temporário:** Funciona enquanto servidor Railway está ativo

**Permanente:** Configure S3 ou Cloudinary
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
```

---

## 💡 Dicas

### Preview Deployments (Vercel)
- Cada branch/PR tem seu próprio preview
- Útil para testar antes de fazer merge
- URL tipo: `promed-git-feature-123.vercel.app`

### Logs em Tempo Real
- **Railway:** Dashboard → Deployments → Logs
- **Vercel:** Dashboard → Deployments → Function Logs

### Rollback
- **Vercel:** Deployments → Clique em deploy antigo → Promote to Production
- **Railway:** Deployments → Clique em deploy antigo → Redeploy

### Domínio Personalizado
- **Vercel:** Settings → Domains → Add
- Atualize `FRONTEND_URL` no Railway depois

---

## 📊 Monitoramento

### Vercel Analytics
- Dashboard → Analytics
- Veja: Page views, Performance, Visitors

### Railway Metrics
- Dashboard → Metrics
- Veja: CPU, RAM, Network

---

## 🎓 Próximos Passos (Após Validação)

Se o cliente aprovar:

1. **Domínio personalizado** (promed.com.br)
2. **S3 para uploads** (imagens permanentes)
3. **Monitoramento** (Sentry para erros)
4. **Backup automático** do MySQL
5. **CI/CD** com testes automatizados
6. **Email** (SendGrid, Mailgun)

---

## 📞 Ajuda

**Problemas?** Veja o guia completo:
- `GUIA_VERCEL_RAILWAY.md` (solução de problemas detalhada)

**Suporte:**
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app

---

## 🎉 Pronto!

Sua stack profissional:

```
Frontend (React)     →  Vercel (CDN global)
Backend (Laravel)    →  Railway (servidor)
Database (MySQL)     →  Railway (gerenciado)
```

**Custo:** $0-3/mês
**Tempo:** 10 minutos
**Qualidade:** Profissional ⭐⭐⭐⭐⭐

**Comece agora:** Execute `preparar-vercel-railway.bat` 🚀
