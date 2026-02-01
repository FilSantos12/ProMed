<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fix column sizes for encrypted fields.
     * Encrypted values are much longer than original values (100+ chars).
     * Using raw SQL to avoid doctrine/dbal dependency.
     */
    public function up(): void
    {
        // Users table - encrypted fields need more space
        // Using ALTER TABLE with MODIFY for MySQL compatibility
        try {
            DB::statement('ALTER TABLE users MODIFY cpf VARCHAR(255) NULL');
            DB::statement('ALTER TABLE users MODIFY phone VARCHAR(255) NULL');
            DB::statement('ALTER TABLE users MODIFY rg VARCHAR(255) NULL');
        } catch (\Exception $e) {
            // Columns might not exist or already have correct size
        }

        // Patients table - encrypted fields
        if (Schema::hasTable('patients')) {
            try {
                if (Schema::hasColumn('patients', 'emergency_contact')) {
                    DB::statement('ALTER TABLE patients MODIFY emergency_contact VARCHAR(255) NULL');
                }
                if (Schema::hasColumn('patients', 'emergency_phone')) {
                    DB::statement('ALTER TABLE patients MODIFY emergency_phone VARCHAR(255) NULL');
                }
                if (Schema::hasColumn('patients', 'health_insurance')) {
                    DB::statement('ALTER TABLE patients MODIFY health_insurance VARCHAR(255) NULL');
                }
                if (Schema::hasColumn('patients', 'insurance_number')) {
                    DB::statement('ALTER TABLE patients MODIFY insurance_number VARCHAR(255) NULL');
                }
            } catch (\Exception $e) {
                // Columns might not exist or already have correct size
            }
        }
    }

    public function down(): void
    {
        // Não reduzir tamanhos no rollback para evitar perda de dados
    }
};
