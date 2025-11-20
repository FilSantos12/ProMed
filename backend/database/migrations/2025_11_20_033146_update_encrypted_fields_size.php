<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Modificar colunas que serão criptografadas
        DB::statement('ALTER TABLE users MODIFY cpf VARCHAR(500)');
        DB::statement('ALTER TABLE users MODIFY phone VARCHAR(500)');
        
        // Verificar se a coluna crm existe em doctors antes de modificar
        if (Schema::hasColumn('doctors', 'crm')) {
            DB::statement('ALTER TABLE doctors MODIFY crm VARCHAR(500)');
        }
        
        // Verificar se as colunas existem em patients
        if (Schema::hasColumn('patients', 'insurance_number')) {
            DB::statement('ALTER TABLE patients MODIFY insurance_number VARCHAR(500)');
        }
        if (Schema::hasColumn('patients', 'emergency_phone')) {
            DB::statement('ALTER TABLE patients MODIFY emergency_phone VARCHAR(500)');
        }
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users MODIFY cpf VARCHAR(14)');
        DB::statement('ALTER TABLE users MODIFY phone VARCHAR(20)');
        
        if (Schema::hasColumn('doctors', 'crm')) {
            DB::statement('ALTER TABLE doctors MODIFY crm VARCHAR(20)');
        }
        
        if (Schema::hasColumn('patients', 'insurance_number')) {
            DB::statement('ALTER TABLE patients MODIFY insurance_number VARCHAR(50)');
        }
        if (Schema::hasColumn('patients', 'emergency_phone')) {
            DB::statement('ALTER TABLE patients MODIFY emergency_phone VARCHAR(20)');
        }
    }
};