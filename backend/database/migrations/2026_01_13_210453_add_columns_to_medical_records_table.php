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
        Schema::table('medical_records', function (Blueprint $table) {
            if (!Schema::hasColumn('medical_records', 'appointment_id')) {
                $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('cascade');
            }
            if (!Schema::hasColumn('medical_records', 'patient_id')) {
                $table->unsignedBigInteger('patient_id')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'doctor_id')) {
                $table->unsignedBigInteger('doctor_id')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'symptoms')) {
                $table->text('symptoms')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'diagnosis')) {
                $table->text('diagnosis')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'treatment')) {
                $table->text('treatment')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'prescription')) {
                $table->text('prescription')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'observations')) {
                $table->text('observations')->nullable();
            }
            if (!Schema::hasColumn('medical_records', 'attachments')) {
                $table->json('attachments')->nullable();
            }
        });

        // Adicionar foreign keys e indexes separadamente para evitar erros
        try {
            Schema::table('medical_records', function (Blueprint $table) {
                $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
                $table->index('patient_id');
                $table->index('doctor_id');
            });
        } catch (\Exception $e) {
            // Foreign keys ou indexes já existem
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropForeign(['appointment_id']);
            $table->dropForeign(['patient_id']);
            $table->dropForeign(['doctor_id']);

            $table->dropIndex(['patient_id']);
            $table->dropIndex(['doctor_id']);
            $table->dropIndex(['appointment_id']);

            $table->dropColumn([
                'appointment_id',
                'patient_id',
                'doctor_id',
                'symptoms',
                'diagnosis',
                'treatment',
                'prescription',
                'observations',
                'attachments'
            ]);
        });
    }
};
