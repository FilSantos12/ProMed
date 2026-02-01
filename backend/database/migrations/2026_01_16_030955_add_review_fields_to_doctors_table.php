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
        Schema::table('doctors', function (Blueprint $table) {
            // Quem aprovou/rejeitou a solicitação (admin)
            if (!Schema::hasColumn('doctors', 'reviewed_by')) {
                $table->unsignedBigInteger('reviewed_by')->nullable();
            }

            // Quando foi aprovado/rejeitado
            if (!Schema::hasColumn('doctors', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable();
            }
        });

        // Adicionar foreign key separadamente
        if (Schema::hasColumn('doctors', 'reviewed_by')) {
            try {
                Schema::table('doctors', function (Blueprint $table) {
                    $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
                });
            } catch (\Exception $e) {
                // Foreign key já existe
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            if (Schema::hasColumn('doctors', 'reviewed_by')) {
                try {
                    $table->dropForeign(['reviewed_by']);
                } catch (\Exception $e) {}
                $table->dropColumn('reviewed_by');
            }
            if (Schema::hasColumn('doctors', 'reviewed_at')) {
                $table->dropColumn('reviewed_at');
            }
        });
    }
};
