<?php
// ⚠️ DELETAR ESTE ARQUIVO APÓS USO!

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h1>🚀 ProMed - Executar Migrations</h1>";
echo "<p>Executando migrations...</p>";
echo "<pre>";

try {
    // Executar migrations
    $kernel->call('migrate:fresh', [
        '--seed' => true,
        '--force' => true
    ]);

    echo "\n✅ Migrations executadas com sucesso!\n";
    echo "\n⚠️ DELETAR ESTE ARQUIVO AGORA!\n";

} catch (Exception $e) {
    echo "\n❌ Erro: " . $e->getMessage() . "\n";
}

echo "</pre>";
