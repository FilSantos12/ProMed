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
        // Dropar tabelas antigas
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('schedules');

        // Recriar tabela schedules
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('slot_duration')->default(30); // duração em minutos
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            // Índices para melhor performance
            $table->index('doctor_id');
            $table->index('day_of_week');
        });

        // Recriar tabela appointments
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('specialty_id')->nullable()->constrained('specialties')->onDelete('set null');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->enum('status', [
                'pending',      // Pendente (aguardando confirmação)
                'confirmed',    // Confirmada
                'completed',    // Realizada
                'cancelled',    // Cancelada
                'no_show'       // Paciente não compareceu
            ])->default('pending');
            $table->text('patient_notes')->nullable(); // Observações do paciente
            $table->text('doctor_notes')->nullable();  // Observações do médico (prontuário)
            $table->string('cancellation_reason')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Índices para melhor performance
            $table->index('patient_id');
            $table->index('doctor_id');
            $table->index('appointment_date');
            $table->index('status');
            
            // Garantir que não haja conflito de horários
            $table->unique(['doctor_id', 'appointment_date', 'appointment_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('schedules');
    }
};