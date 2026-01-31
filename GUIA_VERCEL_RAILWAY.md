# 🚀 Guia Deploy - Vercel (Frontend) + Railway (Backend)

**A melhor combinação!** Frontend especializado + Backend completo

Deploy em **~10 minutos** total!

---

## 🎯 Visão Geral

```
Vercel (Frontend React)  →  Railway (Backend Laravel + MySQL)
        ↓                              ↓
   promed.vercel.app      →   promed-api.up.railway.app
```

### Por que essa combinação é a melhor?

- ✅ **Vercel** é especialista em React (build otimizado, CDN global)
- ✅ **Railway** é perfeito para Laravel + MySQL
- ✅ Deploy automático via Git em ambos
- ✅ HTTPS automático
- ✅ Ambos têm plano gratuito generoso
- ✅ Você já conhece Vercel!

---

## 📦 PARTE 1: Preparar o Backend (Railway)

### Passo 1.1: Criar arquivos de configuração do Railway

**backend/Procfile:**
```
web: bash railway-start.sh
```

**backend/railway-start.sh:**
```bash
#!/bin/bash

echo "🚀 Iniciando ProMed Backend..."

# Aguardar banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 5

# Executar migrations
echo "📊 Executando migrations..."
php artisan migrate --force

# Criar link simbólico do storage
echo "🔗 Criando link do storage..."
php artisan storage:link || true

# Otimizar para produção
echo "⚡ Otimizando aplicação..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Iniciando servidor na porta $PORT..."
# Iniciar servidor
php artisan serve --host=0.0.0.0 --port=$PORT
```

**backend/railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Passo 1.2: Configurar CORS do Laravel

Edite **backend/config/cors.php:**

```php
<?php

return [
    'paths' => ['api/*', 'storage/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => env('FRONTEND_URL')
        ? explode(',', env('FRONTEND_URL'))
        : ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

### Passo 1.3: Tornar script executável

```bash
cd backend
chmod +x railway-start.sh
cd ..
```

---

## 🚂 PARTE 2: Deploy do Backend no Railway

### Passo 2.1: Acessar Railway

1. Acesse: https://railway.app
2. **Login with GitHub**
3. Autorize Railway

### Passo 2.2: Criar Projeto

1. **New Project**
2. **Deploy from GitHub repo**
3. Selecione repositório **promed**
4. Em **Root Directory**, digite: `backend`
5. **Deploy**

### Passo 2.3: Adicionar MySQL

1. No projeto, clique **+ New**
2. **Database** → **MySQL**
3. Railway cria o banco automaticamente

### Passo 2.4: Configurar Variáveis de Ambiente

1. Clique no serviço **backend**
2. Vá na aba **Variables**
3. Clique **+ New Variable** e adicione:

```env
APP_NAME=ProMed
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:... (gere com: php artisan key:generate --show)

DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

FRONTEND_URL=https://promed.vercel.app
SESSION_DRIVER=cookie
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

JWT_SECRET=... (sua chave JWT se estiver usando)
JWT_TTL=60
```

**📌 Importante:**
- As variáveis `${{MySQL.*}}` são preenchidas automaticamente!
- Atualize `FRONTEND_URL` depois que fizer deploy no Vercel

### Passo 2.5: Gerar Domínio Público

1. No serviço **backend**, vá em **Settings**
2. **Networking** → **Generate Domain**
3. Railway gera algo como: `promed-backend.up.railway.app`
4. **Copie essa URL!** (vai usar no Vercel)

### Passo 2.6: Atualizar APP_URL

Volte em **Variables** e adicione:

```env
APP_URL=https://promed-backend.up.railway.app
```

(use a URL que você copiou)

### Passo 2.7: Executar Migrations

#### Opção A - Railway CLI (recomendado):

```bash
# Instalar Railway CLI
iwr https://railway.app/install.ps1 | iex

# Login
railway login

# Conectar ao projeto
cd backend
railway link

# Executar migrations
railway run php artisan migrate --seed
```

#### Opção B - Criar endpoint temporário:

Crie **backend/public/migrate.php:**

```php
<?php
// ⚠️ DELETAR APÓS USO!

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->call('migrate:fresh', ['--seed' => true]);

echo "✅ Migrations executadas!";
```

Acesse: `https://promed-backend.up.railway.app/migrate.php`

**⚠️ DELETAR o arquivo imediatamente após uso!**

### Passo 2.8: Testar API

Acesse: `https://promed-backend.up.railway.app/api/specialties`

**Deve retornar:** JSON com especialidades ✅

---

## ▲ PARTE 3: Deploy do Frontend no Vercel

### Passo 3.1: Criar arquivo de configuração do Vercel

Na **raiz do projeto**, crie **vercel.json:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Passo 3.2: Criar variáveis de ambiente

Crie **.env.production** na raiz:

```env
VITE_API_URL=https://promed-backend.up.railway.app/api
```

(use a URL do Railway que você copiou)

### Passo 3.3: Fazer commit e push

```bash
git add .
git commit -m "Configurar deploy Vercel + Railway

- Adicionar configuração do Vercel
- Adicionar configuração do Railway
- Configurar variáveis de ambiente
- Preparar para produção"

git push origin main
```

### Passo 3.4: Deploy no Vercel

1. Acesse: https://vercel.com
2. **Add New** → **Project**
3. **Import Git Repository** → Selecione **promed**
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (deixar raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

5. **Environment Variables:**
   Adicione:
   ```
   VITE_API_URL = https://promed-backend.up.railway.app/api
   ```

6. **Deploy**

### Passo 3.5: Aguardar Build

- Vercel faz build automaticamente (~2-3 min)
- Quando terminar, você terá uma URL tipo: `promed.vercel.app`

### Passo 3.6: Atualizar CORS no Railway

1. Volte no **Railway**
2. Serviço **backend** → **Variables**
3. Atualize:
   ```env
   FRONTEND_URL=https://promed.vercel.app
   ```

4. Railway faz redeploy automático

---

## ✅ PARTE 4: Testar a Aplicação

### Passo 4.1: Testar Frontend

Acesse: `https://promed.vercel.app`

**Deve carregar:** Homepage da ProMed ✅

### Passo 4.2: Testar Conexão Frontend → Backend

1. Abra a página
2. Pressione **F12** (DevTools)
3. Vá em **Network**
4. Navegue para "Especialidades" ou "Médicos"
5. Veja as requisições para `/api/*`

**Deve:** Carregar dados sem erro CORS ✅

### Passo 4.3: Testar Funcionalidades

- [ ] Navegação entre páginas
- [ ] Listagem de especialidades
- [ ] Listagem de médicos
- [ ] Login/Cadastro
- [ ] Agendamento de consultas
- [ ] Dashboard (médico/paciente)
- [ ] Upload de imagens (avatares)

---

## 🔄 PARTE 5: Atualizações Futuras (Deploy Automático!)

### Frontend (Vercel):

```bash
# 1. Fazer alterações no código do frontend

# 2. Commit e push
git add .
git commit -m "Atualização do frontend"
git push origin main
```

**🎉 Vercel faz deploy automático!** (~1-2 min)

### Backend (Railway):

```bash
# 1. Fazer alterações no código do backend

# 2. Commit e push (mesmo comando)
git add .
git commit -m "Atualização do backend"
git push origin main
```

**🎉 Railway faz deploy automático!** (~2-3 min)

---

## 🎨 PARTE 6: Domínio Personalizado (Opcional)

### Adicionar domínio próprio no Vercel

1. No projeto Vercel, vá em **Settings** → **Domains**
2. **Add Domain** → Digite: `promed.com.br`
3. Vercel mostrará registros DNS
4. Configure no seu registrador de domínio

### Atualizar URLs após domínio personalizado

1. **Railway** → Backend → Variables:
   ```env
   FRONTEND_URL=https://promed.com.br
   ```

2. **Vercel** → Environment Variables:
   ```env
   VITE_API_URL=https://api.promed.com.br/api
   ```

---

## 💰 Custos

### Vercel:
- **Plano Hobby:** Grátis
- **Build Minutes:** 6000 min/mês grátis
- **Bandwidth:** 100GB/mês grátis
- **Custo:** **$0/mês** para validação

### Railway:
- **Plano Trial:** $5 crédito/mês
- **Uso estimado:** ~$3-5/mês (backend + MySQL)
- **Custo:** **$0-3/mês**

### Total: **$0-3/mês** 🎉

---

## 🐛 Solução de Problemas

### Problema 1: CORS Error

**Sintoma:** Erro no console do browser
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Solução:**
1. Railway → Backend → Variables
2. Verifique `FRONTEND_URL` está correto
3. Verifique `backend/config/cors.php` tem configuração correta
4. Salve variáveis (Railway redeploy automático)

### Problema 2: API retorna 500

**Solução:**
1. Railway → Backend → Deployments
2. Clique no deployment ativo
3. Veja logs para identificar erro
4. Causas comuns:
   - `APP_KEY` não configurado
   - Migrations não executadas
   - Conexão com MySQL falhou

### Problema 3: Build do Vercel falha

**Solução:**
1. Verifique logs do build no Vercel
2. Causas comuns:
   - Erro de TypeScript
   - Dependências faltando
   - Comando de build incorreto

### Problema 4: Imagens não carregam

**Causa:** Railway usa sistema de arquivos efêmero

**Solução temporária:**
Uploads funcionarão enquanto o servidor estiver rodando

**Solução definitiva:**
Configure S3 ou Cloudinary para uploads permanentes:

```bash
composer require league/flysystem-aws-s3-v3
```

Configure no `.env` do Railway:
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=promed-uploads
```

### Problema 5: Página em branco no Vercel

**Solução:**
1. Verifique `vercel.json` tem rewrites corretos
2. Verifique `VITE_API_URL` está configurado
3. Veja console do browser (F12) para erros

---

## 📊 Checklist Final

### Backend (Railway):
- [ ] Projeto criado no Railway
- [ ] MySQL adicionado
- [ ] Variáveis configuradas
- [ ] Domínio gerado
- [ ] Migrations executadas
- [ ] API responde (`/api/specialties`)
- [ ] Logs sem erros

### Frontend (Vercel):
- [ ] Projeto criado no Vercel
- [ ] Variável `VITE_API_URL` configurada
- [ ] Build bem-sucedido
- [ ] Homepage carrega
- [ ] Conexão com API funciona
- [ ] Sem erros CORS

### Funcionalidades:
- [ ] Navegação funciona
- [ ] Listagem de médicos funciona
- [ ] Login/Cadastro funciona
- [ ] Agendamento funciona
- [ ] Dashboard funciona
- [ ] Uploads funcionam

---

## 📈 Monitoramento

### Vercel Analytics

1. No projeto Vercel, vá em **Analytics**
2. Veja: Page views, Performance, etc.

### Railway Logs

1. Railway → Backend → Deployments
2. Clique no deployment ativo
3. Veja logs em tempo real

### Vercel Logs

1. Projeto Vercel → **Deployments**
2. Clique no deployment
3. Veja **Build Logs** e **Function Logs**

---

## 🎯 Vantagens dessa Stack

### Vercel (Frontend):
✅ CDN global (site rápido em qualquer lugar)
✅ Build otimizado automático
✅ Preview deployments (cada PR tem preview)
✅ Rollback fácil

### Railway (Backend):
✅ MySQL integrado
✅ Logs em tempo real
✅ Redeploy automático
✅ Fácil escalar depois

### Combinados:
✅ Deploy automático (git push → produção)
✅ HTTPS automático
✅ Custo baixo ($0-3/mês)
✅ Profissional para cliente validar

---

## 🚀 Próximos Passos Após Validação

Se o cliente aprovar:

1. **Adicionar domínio personalizado**
2. **Configurar S3 para uploads**
3. **Adicionar monitoramento (Sentry)**
4. **Configurar backup automático do MySQL**
5. **Adicionar CI/CD com testes**

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Discord:** https://vercel.com/discord
- **Railway Discord:** https://discord.gg/railway

---

**🎉 Pronto! Stack profissional em 10 minutos!**

Vercel + Railway = A melhor combinação para validação com cliente! 🚀
