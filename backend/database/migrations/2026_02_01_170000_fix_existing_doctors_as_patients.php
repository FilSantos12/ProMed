<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fix existing doctors to also be patients.
     * Doctors registered before the fix don't have:
     * 1. Patient record in patients table
     * 2. 'patient' in their roles array
     */
    public function up(): void
    {
        // Buscar todos os médicos (users com role = 'doctor' ou que têm registro em doctors)
        $doctors = DB::table('doctors')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->select('users.id', 'users.roles')
            ->get();

        foreach ($doctors as $doctor) {
            // 1. Criar registro de paciente se não existir
            $patientExists = DB::table('patients')
                ->where('user_id', $doctor->id)
                ->exists();

            if (!$patientExists) {
                DB::table('patients')->insert([
                    'user_id' => $doctor->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 2. Adicionar 'patient' ao array de roles se não existir
            $roles = json_decode($doctor->roles ?? '[]', true);

            if (!is_array($roles)) {
                $roles = [];
            }

            if (!in_array('doctor', $roles)) {
                $roles[] = 'doctor';
            }

            if (!in_array('patient', $roles)) {
                $roles[] = 'patient';
            }

            DB::table('users')
                ->where('id', $doctor->id)
                ->update(['roles' => json_encode($roles)]);
        }
    }

    public function down(): void
    {
        // Não reverter - médicos devem permanecer como pacientes
    }
};
