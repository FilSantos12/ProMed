# 🎯 Deploy ProMed - SUPER SIMPLIFICADO

Vou te guiar **exatamente** no que fazer! Siga esta ordem.

---

## 📌 ANTES DE COMEÇAR

### O que você vai precisar:
- [ ] Conta GitHub (você já tem)
- [ ] Conta Vercel (você já tem)
- [ ] Criar conta Railway (vou te mostrar)

**Tempo total:** 15-20 minutos

---

## ETAPA 1: PREPARAR O CÓDIGO (5 minutos)

### Passo 1.1: Abrir Git Bash

1. Abra o **Git Bash** na pasta do projeto
2. Caminho: `C:\Users\Admin\Desktop\ProjDev\ProMed`

### Passo 1.2: Tornar arquivo executável

Digite no Git Bash:

```bash
cd backend
chmod +x railway-start.sh
cd ..
```

Pressione **Enter** após cada linha.

### Passo 1.3: Gerar chave para o Railway

Digite no Git Bash:

```bash
cd backend
php artisan key:generate --show
```

**RESULTADO:** Vai aparecer algo como:
```
base64:AbC123XyZ456...
```

**⚠️ COPIE ESSA CHAVE TODA!** Vai usar daqui a pouco.

Cole numa nota separada (Bloco de Notas).

```bash
cd ..
```

### Passo 1.4: Fazer commit das alterações

Digite no Git Bash:

```bash
git add .
git commit -m "Preparar para deploy Vercel + Railway"
git push origin main
```

Aguarde terminar. Vai pedir usuário/senha do GitHub se necessário.

✅ **Pronto!** Código está no GitHub atualizado.

---

## ETAPA 2: BACKEND NO RAILWAY (7 minutos)

### Passo 2.1: Criar conta no Railway

1. Abra navegador
2. Acesse: **https://railway.app**
3. Clique em **"Login"** (canto superior direito)
4. Clique em **"Login with GitHub"**
5. Autorize o Railway (clique em **"Authorize Railway"**)

✅ Você está logado no Railway!

### Passo 2.2: Criar novo projeto

1. Você verá o dashboard do Railway
2. Clique no botão roxo **"New Project"**
3. Escolha **"Deploy from GitHub repo"**
4. Selecione o repositório **"promed"** da lista
5. **⚠️ IMPORTANTE:** Em "Root Directory" digite: `backend`
6. Clique em **"Deploy"**

**Aguarde:** Railway vai começar a fazer deploy (~1-2 min)

### Passo 2.3: Adicionar banco de dados MySQL

1. No mesmo projeto (tela do Railway)
2. Clique no botão **"+ New"** (canto superior direito)
3. Escolha **"Database"**
4. Clique em **"Add MySQL"**

✅ Railway cria o MySQL automaticamente!

Você verá 2 "caixinhas":
- Uma escrita "backend" (seu Laravel)
- Outra escrita "MySQL" (banco de dados)

### Passo 2.4: Configurar variáveis de ambiente

1. Clique na caixinha **"backend"**
2. Na aba que abrir, clique em **"Variables"** (menu superior)
3. Clique no botão **"+ New Variable"**

Agora vamos adicionar as variáveis **UMA POR VEZ**:

**Variável 1:**
```
Nome: APP_NAME
Valor: ProMed
```
Clique **"Add"**

**Variável 2:**
```
Nome: APP_ENV
Valor: production
```
Clique **"Add"**

**Variável 3:**
```
Nome: APP_DEBUG
Valor: false
```
Clique **"Add"**

**Variável 4 (A CHAVE QUE VOCÊ COPIOU):**
```
Nome: APP_KEY
Valor: base64:AbC123... (cole a chave que você copiou antes)
```
Clique **"Add"**

**Variável 5:**
```
Nome: DB_CONNECTION
Valor: mysql
```
Clique **"Add"**

**Variável 6 (ATENÇÃO - vai usar referência):**
```
Nome: DB_HOST
Valor: ${{MySQL.MYSQLHOST}}
```
⚠️ Digite EXATAMENTE assim! Railway preenche automaticamente.
Clique **"Add"**

**Variável 7:**
```
Nome: DB_PORT
Valor: ${{MySQL.MYSQLPORT}}
```
Clique **"Add"**

**Variável 8:**
```
Nome: DB_DATABASE
Valor: ${{MySQL.MYSQLDATABASE}}
```
Clique **"Add"**

**Variável 9:**
```
Nome: DB_USERNAME
Valor: ${{MySQL.MYSQLUSER}}
```
Clique **"Add"**

**Variável 10:**
```
Nome: DB_PASSWORD
Valor: ${{MySQL.MYSQLPASSWORD}}
```
Clique **"Add"**

**Variável 11:**
```
Nome: SESSION_DRIVER
Valor: cookie
```
Clique **"Add"**

**Variável 12:**
```
Nome: CACHE_DRIVER
Valor: file
```
Clique **"Add"**

**Variável 13 (vamos atualizar depois):**
```
Nome: FRONTEND_URL
Valor: http://localhost:3000
```
Clique **"Add"**

**Deixe APP_URL para depois** (vamos gerar o domínio primeiro)

### Passo 2.5: Gerar domínio público para o backend

1. Ainda na tela do serviço **"backend"**
2. Clique na aba **"Settings"** (menu superior)
3. Role a página até encontrar **"Networking"**
4. Clique no botão **"Generate Domain"**

**Railway vai gerar uma URL tipo:**
```
promed-production-XXXX.up.railway.app
```

**⚠️ COPIE ESSA URL COMPLETA!** Cole no Bloco de Notas.

### Passo 2.6: Adicionar variável APP_URL

1. Volte na aba **"Variables"**
2. Clique **"+ New Variable"**

**Variável 14:**
```
Nome: APP_URL
Valor: https://promed-production-XXXX.up.railway.app
```
⚠️ Cole a URL que você copiou (com `https://` no início)
Clique **"Add"**

Railway vai fazer **redeploy automático** (~1-2 min)

### Passo 2.7: Executar migrations do banco

**OPÇÃO MAIS FÁCIL:**

1. Ainda na tela do backend
2. Vá na aba **"Deployments"**
3. Aguarde até o status ficar **verde** com ✓ (deploy concluído)
4. Abra um novo Git Bash na pasta do projeto

Digite:

```bash
# Instalar Railway CLI
powershell -c "iwr https://railway.app/install.ps1 | iex"
```

Se pedir permissão, digite **S** e Enter.

Depois:

```bash
# Login no Railway
railway login
```

Vai abrir o navegador para autorizar. Clique em **"Authorize"**.

```bash
# Conectar ao projeto
cd backend
railway link
```

Vai mostrar seus projetos. Use setas ↑↓ para selecionar **"promed"**, pressione **Enter**.

Agora selecione o serviço **"backend"**, pressione **Enter**.

```bash
# Executar migrations
railway run php artisan migrate --seed
```

Vai perguntar se quer executar. Digite **yes** e Enter.

✅ **Banco de dados configurado!**

```bash
cd ..
```

### Passo 2.8: Testar se API funciona

1. Abra navegador
2. Acesse: `https://SUA-URL-DO-RAILWAY.up.railway.app/api/specialties`

**Deve aparecer:** JSON com especialidades médicas

Se aparecer JSON = ✅ **Backend funcionando!**

---

## ETAPA 3: FRONTEND NO VERCEL (5 minutos)

### Passo 3.1: Atualizar configuração do frontend

1. Abra o arquivo: `C:\Users\Admin\Desktop\ProjDev\ProMed\.env.production`

2. Edite para:
```env
VITE_API_URL=https://SUA-URL-DO-RAILWAY.up.railway.app/api
```

⚠️ Substitua `SUA-URL-DO-RAILWAY` pela URL que você copiou do Railway
⚠️ Não esqueça do `/api` no final!

3. Salve o arquivo (Ctrl+S)

### Passo 3.2: Fazer commit da alteração

Abra Git Bash:

```bash
git add .env.production
git commit -m "Configurar URL da API para produção"
git push origin main
```

### Passo 3.3: Deploy no Vercel

1. Acesse: **https://vercel.com**
2. Faça login (se não estiver logado)
3. No dashboard, clique em **"Add New..."** (canto superior direito)
4. Escolha **"Project"**
5. Na lista de repositórios, encontre **"promed"**
6. Clique em **"Import"**

### Passo 3.4: Configurar o projeto

Na tela de configuração:

**Build and Output Settings:**
- **Framework Preset:** Vite (deve detectar automaticamente)
- **Root Directory:** `./` (deixar como está)
- **Build Command:** `npm run build` (deixar como está)
- **Output Directory:** `build` (deixar como está)

**Environment Variables:**

1. Clique em **"Add"** na seção Environment Variables
2. Adicione:
```
Key: VITE_API_URL
Value: https://SUA-URL-DO-RAILWAY.up.railway.app/api
```
⚠️ Cole a URL completa do Railway + `/api`

3. Clique em **"Deploy"**

**Aguarde:** Vercel vai fazer build (~2-3 min)

Você verá uns confetes 🎉 quando terminar!

### Passo 3.5: Copiar URL do Vercel

Quando terminar o deploy:

1. Vercel vai mostrar a URL tipo: `https://promed.vercel.app`
2. **COPIE ESSA URL!** Cole no Bloco de Notas

---

## ETAPA 4: FINALIZAR - ATUALIZAR CORS (2 minutos)

### Passo 4.1: Atualizar variável no Railway

1. Volte para: **https://railway.app**
2. Abra seu projeto
3. Clique no serviço **"backend"**
4. Vá na aba **"Variables"**
5. Encontre a variável **"FRONTEND_URL"**
6. Clique nela para editar
7. Mude o valor para:
```
https://promed.vercel.app
```
⚠️ Cole a URL que o Vercel gerou (a que você copiou)

8. Clique fora para salvar

Railway vai fazer **redeploy** automático (~1 min)

---

## ✅ ETAPA 5: TESTAR TUDO! (3 minutos)

### Teste 1: Abrir o site

1. Abra navegador
2. Acesse: `https://promed.vercel.app` (sua URL do Vercel)

**Deve:** Carregar a homepage da ProMed ✅

### Teste 2: Testar conexão com API

1. No site, clique em **"Especialidades"** no menu
2. Pressione **F12** para abrir DevTools
3. Vá na aba **"Console"**

**NÃO deve ter:** Erros de CORS ✅
**Deve:** Carregar lista de especialidades ✅

### Teste 3: Testar médicos

1. Clique em **"Sobre"** no menu
2. Role até a seção "Nossos Médicos"

**Deve:** Mostrar lista de médicos com fotos ✅

### Teste 4: Testar login/cadastro

1. Clique em **"Login"** no menu
2. Tente fazer login ou criar conta

**Deve:** Funcionar normalmente ✅

---

## 🎉 PRONTO! ESTÁ NO AR!

✅ **Frontend:** `https://promed.vercel.app`
✅ **Backend:** `https://SUA-URL.up.railway.app`
✅ **Banco de Dados:** MySQL no Railway

---

## 🔄 Para atualizar depois:

Sempre que fizer alterações:

```bash
git add .
git commit -m "Descrição da alteração"
git push origin main
```

**Vercel e Railway fazem deploy automático!** 🎉

---

## 🐛 Se algo der errado:

### Erro: CORS

**Solução:**
- Railway → Backend → Variables
- Verifique se `FRONTEND_URL` tem a URL correta do Vercel
- Deve ser `https://promed.vercel.app` (sem barra no final)

### Erro: API não responde

**Solução:**
- Railway → Backend → Deployments
- Clique no deployment ativo
- Veja os logs para identificar o erro
- Provavelmente: migrations não executadas

### Erro: Build Vercel falha

**Solução:**
- Vercel → Deployments
- Clique no deployment com erro
- Veja "Build Logs"
- Provavelmente: variável `VITE_API_URL` não configurada

### Precisa de ajuda?

Me avise em qual passo você está e o que apareceu!

---

## 📋 Checklist Resumido

- [ ] Código commitado e pushed para GitHub
- [ ] Railway: Projeto criado
- [ ] Railway: MySQL adicionado
- [ ] Railway: 14 variáveis configuradas
- [ ] Railway: Domínio gerado
- [ ] Railway: Migrations executadas
- [ ] Railway: API testada (JSON aparece)
- [ ] Vercel: `.env.production` atualizado
- [ ] Vercel: Código commitado
- [ ] Vercel: Projeto importado
- [ ] Vercel: Variável `VITE_API_URL` configurada
- [ ] Vercel: Deploy bem-sucedido
- [ ] Railway: `FRONTEND_URL` atualizado
- [ ] Teste: Homepage abre
- [ ] Teste: Especialidades carregam
- [ ] Teste: Médicos aparecem
- [ ] Teste: Login funciona

---

**Qualquer dúvida, me avise em qual ETAPA e PASSO você está! Vou te ajudar! 🤝**
