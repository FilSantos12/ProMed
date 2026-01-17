<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== ESTRUTURA DA TABELA USERS ===\n";
$usersColumns = DB::select('DESCRIBE users');
foreach ($usersColumns as $column) {
    echo "- {$column->Field} ({$column->Type}) " . ($column->Null === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
}

echo "\n=== ESTRUTURA DA TABELA DOCTORS ===\n";
$doctorsColumns = DB::select('DESCRIBE doctors');
foreach ($doctorsColumns as $column) {
    echo "- {$column->Field} ({$column->Type}) " . ($column->Null === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
}

echo "\n=== ESTRUTURA DA TABELA DOCTOR_DOCUMENTS ===\n";
try {
    $docColumns = DB::select('DESCRIBE doctor_documents');
    foreach ($docColumns as $column) {
        echo "- {$column->Field} ({$column->Type}) " . ($column->Null === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
    }
} catch (\Exception $e) {
    echo "Tabela não existe!\n";
}
