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
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('rejection_notes');

            // Quando foi aprovado/rejeitado
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');

            // Foreign key para o admin que revisou
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn(['reviewed_by', 'reviewed_at']);
        });
    }
};
