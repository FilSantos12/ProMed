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
            $table->date('schedule_date')->nullable()->after('day_of_week');

            // Tornar day_of_week nullable para suportar ambos os modos
            $table->string('day_of_week')->nullable()->change();

            // Adicionar índice para melhor performance
            $table->index('schedule_date');
        });
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
