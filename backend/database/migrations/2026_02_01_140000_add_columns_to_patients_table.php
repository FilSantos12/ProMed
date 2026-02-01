<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('patients', 'emergency_contact')) {
                $table->string('emergency_contact')->nullable();
            }
            if (!Schema::hasColumn('patients', 'emergency_phone')) {
                $table->string('emergency_phone', 20)->nullable();
            }
            if (!Schema::hasColumn('patients', 'blood_type')) {
                $table->string('blood_type', 10)->nullable();
            }
            if (!Schema::hasColumn('patients', 'allergies')) {
                $table->text('allergies')->nullable();
            }
            if (!Schema::hasColumn('patients', 'chronic_diseases')) {
                $table->text('chronic_diseases')->nullable();
            }
            if (!Schema::hasColumn('patients', 'medications')) {
                $table->text('medications')->nullable();
            }
            if (!Schema::hasColumn('patients', 'health_insurance')) {
                $table->string('health_insurance')->nullable();
            }
            if (!Schema::hasColumn('patients', 'insurance_number')) {
                $table->string('insurance_number', 100)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $columns = ['user_id', 'emergency_contact', 'emergency_phone', 'blood_type',
                        'allergies', 'chronic_diseases', 'medications',
                        'health_insurance', 'insurance_number'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('patients', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
