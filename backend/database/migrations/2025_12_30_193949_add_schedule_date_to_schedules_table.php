<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // Adicionar campo de data específica
            if (!Schema::hasColumn('schedules', 'schedule_date')) {
                $table->date('schedule_date')->nullable();
            }
        });

        // Adicionar índice separadamente para evitar erros
        try {
            Schema::table('schedules', function (Blueprint $table) {
                $table->index('schedule_date');
            });
        } catch (\Exception $e) {
            // Index já existe
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('schedule_date');
            $table->dropIndex(['schedule_date']);
        });
    }
};
