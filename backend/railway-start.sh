#!/bin/bash

echo "🚀 Iniciando ProMed Backend..."

# Aguardar banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
sleep 5

# Regenerar autoload do Composer
echo "📦 Regenerando autoload..."
composer dump-autoload --optimize

# Limpar caches antes de tudo
echo "🧹 Limpando caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Executar migrations
echo "📊 Executando migrations..."
php artisan migrate --force

# Criar usuário admin se não existir
echo "👤 Verificando usuário admin..."
php artisan tinker --execute="
if (!App\Models\User::where('email', 'admin@promed.com')->exists()) {
    \$user = new App\Models\User();
    \$user->name = 'Admin ProMed';
    \$user->email = 'admin@promed.com';
    \$user->password = bcrypt('Admin@123');
    \$user->is_active = true;
    \$user->active_role = 'admin';
    \$user->roles = ['admin'];
    \$user->save();
    echo 'Admin criado!';
} else {
    echo 'Admin já existe.';
}
"

# Criar link simbólico do storage
echo "🔗 Criando link do storage..."
php artisan storage:link || true

# Otimizar para produção (sem config:cache para evitar problemas)
echo "⚡ Otimizando aplicação..."
php artisan route:cache
php artisan view:cache

echo "✅ Iniciando servidor na porta $PORT..."
# Iniciar servidor
php artisan serve --host=0.0.0.0 --port=$PORT
