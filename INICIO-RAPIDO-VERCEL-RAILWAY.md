# ⚡ Início Rápido - Vercel + Railway

Deploy completo em **10 minutos**!

---

## 🎯 Passo a Passo

### **PARTE 1: Backend no Railway** (~5 min)

#### 1. Tornar script executável
```bash
cd backend
chmod +x railway-start.sh
cd ..
```

#### 2. Acessar Railway
- https://railway.app
- **Login with GitHub**

#### 3. Criar Projeto
- **New Project** → **Deploy from GitHub repo**
- Selecione **promed**
- **Root Directory:** `backend`
- **Deploy**

#### 4. Adicionar MySQL
- **+ New** → **Database** → **MySQL**

#### 5. Configurar Variáveis (no serviço backend)

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

APP_URL=https://SEU-BACKEND.up.railway.app
FRONTEND_URL=https://promed.vercel.app
```

#### 6. Gerar Domínio
- **Settings** → **Networking** → **Generate Domain**
- **Copie a URL!** (ex: `promed-backend.up.railway.app`)

#### 7. Executar Migrations

**Opção A - Railway CLI:**
```bash
iwr https://railway.app/install.ps1 | iex
railway login
cd backend
railway link
railway run php artisan migrate --seed
```

**Opção B - Endpoint temporário:**
- Crie `backend/public/migrate.php` (veja guia completo)
- Acesse: `https://SEU-BACKEND.up.railway.app/migrate.php`
- Deletar arquivo após uso!

#### 8. Testar API
- Acesse: `https://SEU-BACKEND.up.railway.app/api/specialties`
- Deve retornar JSON ✅

---

### **PARTE 2: Frontend no Vercel** (~5 min)

#### 1. Atualizar .env.production
```env
VITE_API_URL=https://SEU-BACKEND.up.railway.app/api
```
(use a URL do Railway que você copiou)

#### 2. Commit e Push
```bash
git add .
git commit -m "Configurar deploy Vercel + Railway"
git push origin main
```

#### 3. Deploy no Vercel
- https://vercel.com
- **Add New** → **Project**
- **Import** repositório **promed**

#### 4. Configurar Vercel
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Environment Variables:**
  ```
  VITE_API_URL = https://SEU-BACKEND.up.railway.app/api
  ```

#### 5. Deploy
- Clique **Deploy**
- Aguarde build (~2-3 min)
- Vercel gera URL: `promed.vercel.app`

#### 6. Atualizar CORS no Railway
- Railway → Backend → Variables
- Atualizar:
  ```env
  FRONTEND_URL=https://promed.vercel.app
  ```

---

## ✅ Testar

### Frontend
- Acesse: `https://promed.vercel.app`
- Homepage deve carregar ✅

### Conexão Frontend → Backend
- Abra F12 (DevTools)
- Navegue para "Especialidades"
- Veja requisições `/api/*` no Network
- Não deve ter erro CORS ✅

### Funcionalidades
- [ ] Listagem de médicos
- [ ] Login/Cadastro
- [ ] Agendamento
- [ ] Dashboard

---

## 🔄 Atualizações Futuras

```bash
git add .
git commit -m "Minha alteração"
git push origin main
```

**Vercel E Railway fazem deploy automático!** 🎉

---

## 🐛 Problema?

### CORS Error
- Railway → Backend → Variables
- Verifique `FRONTEND_URL` está correto

### API não responde
- Railway → Backend → Deployments
- Veja logs para erros

### Build Vercel falha
- Vercel → Deployments
- Veja build logs

**Guia completo:** `GUIA_VERCEL_RAILWAY.md`

---

## 📊 Checklist

- [ ] Backend deployado no Railway
- [ ] MySQL adicionado
- [ ] Variáveis configuradas
- [ ] Migrations executadas
- [ ] API responde
- [ ] Frontend deployado no Vercel
- [ ] Variável `VITE_API_URL` configurada
- [ ] Homepage carrega
- [ ] Sem erro CORS
- [ ] Login funciona
- [ ] Agendamento funciona

---

**🎉 Pronto em 10 minutos!**

Custo: **$0-3/mês**
