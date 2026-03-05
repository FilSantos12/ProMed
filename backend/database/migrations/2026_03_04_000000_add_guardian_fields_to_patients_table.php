<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'is_minor')) {
                $table->boolean('is_minor')->default(false)->after('insurance_number');
            }
            if (!Schema::hasColumn('patients', 'guardian_name')) {
                $table->string('guardian_name')->nullable()->after('is_minor');
            }
            if (!Schema::hasColumn('patients', 'guardian_cpf')) {
                $table->string('guardian_cpf', 20)->nullable()->after('guardian_name');
            }
            if (!Schema::hasColumn('patients', 'guardian_email')) {
                $table->string('guardian_email')->nullable()->after('guardian_cpf');
            }
            if (!Schema::hasColumn('patients', 'guardian_phone')) {
                $table->string('guardian_phone', 20)->nullable()->after('guardian_email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            foreach (['is_minor', 'guardian_name', 'guardian_cpf', 'guardian_email', 'guardian_phone'] as $col) {
                if (Schema::hasColumn('patients', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
