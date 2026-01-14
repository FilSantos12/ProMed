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
            $table->foreignId('appointment_id')->nullable()->after('id')->constrained('appointments')->onDelete('cascade');
            $table->unsignedBigInteger('patient_id')->after('appointment_id');
            $table->unsignedBigInteger('doctor_id')->after('patient_id');

            $table->text('symptoms')->nullable()->after('doctor_id');
            $table->text('diagnosis')->nullable()->after('symptoms');
            $table->text('treatment')->nullable()->after('diagnosis');
            $table->text('prescription')->nullable()->after('treatment');
            $table->text('observations')->nullable()->after('prescription');
            $table->json('attachments')->nullable()->after('observations');

            // Foreign keys
            // patient_id e doctor_id apontam para users.id
            $table->foreign('patient_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');

            // Indexes para performance
            $table->index('patient_id');
            $table->index('doctor_id');
            $table->index('appointment_id');
        });
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
