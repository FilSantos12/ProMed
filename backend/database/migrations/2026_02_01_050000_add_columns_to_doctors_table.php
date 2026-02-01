<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            if (!Schema::hasColumn('doctors', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('doctors', 'specialty_id')) {
                $table->foreignId('specialty_id')->nullable()->constrained('specialties')->onDelete('set null');
            }
            if (!Schema::hasColumn('doctors', 'crm')) {
                $table->string('crm', 20)->nullable();
            }
            if (!Schema::hasColumn('doctors', 'crm_state')) {
                $table->string('crm_state', 2)->nullable();
            }
            if (!Schema::hasColumn('doctors', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('doctors', 'consultation_price')) {
                $table->decimal('consultation_price', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('doctors', 'consultation_duration')) {
                $table->integer('consultation_duration')->default(30);
            }
            if (!Schema::hasColumn('doctors', 'formation')) {
                $table->json('formation')->nullable();
            }
            if (!Schema::hasColumn('doctors', 'years_experience')) {
                $table->integer('years_experience')->default(0);
            }
            if (!Schema::hasColumn('doctors', 'status')) {
                $table->string('status', 20)->default('pending');
            }
            if (!Schema::hasColumn('doctors', 'rejection_notes')) {
                $table->text('rejection_notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $columns = ['user_id', 'specialty_id', 'crm', 'crm_state', 'bio', 
                        'consultation_price', 'consultation_duration', 'formation', 
                        'years_experience', 'status', 'rejection_notes'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('doctors', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
