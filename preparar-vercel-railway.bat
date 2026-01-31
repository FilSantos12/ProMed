@echo off
echo ========================================
echo   ProMed - Vercel + Railway
echo ========================================
echo.

echo [1/5] Verificando arquivos de configuracao...
if not exist "vercel.json" (
    echo ERRO: vercel.json nao encontrado!
    pause
    exit /b 1
)
if not exist "backend\Procfile" (
    echo ERRO: backend\Procfile nao encontrado!
    pause
    exit /b 1
)
echo OK - Arquivos encontrados

echo.
echo [2/5] Tornando script executavel...
cd backend
git update-index --chmod=+x railway-start.sh
cd ..
echo OK - Script configurado

echo.
echo [3/5] Verificando Git...
git status >nul 2>&1
if errorlevel 1 (
    echo ERRO: Repositorio Git nao encontrado!
    pause
    exit /b 1
)
echo OK - Git configurado

echo.
echo [4/5] Gerando APP_KEY para Railway...
cd backend
php artisan key:generate --show
cd ..
echo.
echo COPIE a chave acima para usar no Railway!

echo.
echo [5/5] Status do projeto...
git status

echo.
echo ========================================
echo   Preparacao concluida!
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo.
echo 1. BACKEND (Railway):
echo    - Acesse: https://railway.app
echo    - Deploy from GitHub (backend/)
echo    - Adicione MySQL
echo    - Configure variaveis (use APP_KEY acima)
echo    - Gere dominio
echo    - Execute migrations
echo.
echo 2. FRONTEND (Vercel):
echo    - Atualize .env.production com URL do Railway
echo    - Commit: git add . ^&^& git commit -m "Deploy" ^&^& git push
echo    - Acesse: https://vercel.com
echo    - Import do GitHub
echo    - Configure VITE_API_URL
echo    - Deploy!
echo.
echo 3. Siga: INICIO-RAPIDO-VERCEL-RAILWAY.md
echo.
pause
