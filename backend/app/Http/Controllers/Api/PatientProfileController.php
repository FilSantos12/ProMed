<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PatientProfileController extends Controller
{
    /**
     * Obter perfil completo do paciente autenticado
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->patient) {
                return response()->json([
                    'message' => 'Perfil de paciente não encontrado'
                ], 404);
            }

            $patient = Patient::with(['user'])
                ->find($user->patient->id);

            // Adicionar URL completa do avatar se existir
            if ($patient->user && $patient->user->avatar) {
                $patient->user->avatar_url = asset('storage/' . $patient->user->avatar);
            }

            return response()->json([
                'patient' => $patient
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar perfil do paciente: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao carregar perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar perfil do paciente autenticado
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->patient) {
                return response()->json([
                    'message' => 'Perfil de paciente não encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone' => 'sometimes|string|max:20',
                'birth_date' => 'sometimes|date',
                'gender' => 'sometimes|in:Masculino,Feminino,Outro',
                'rg' => 'sometimes|string|max:20',
                'emergency_contact' => 'nullable|string|max:255',
                'emergency_phone' => 'nullable|string|max:20',
                'blood_type' => 'nullable|string|max:10',
                'allergies' => 'nullable|string',
                'chronic_diseases' => 'nullable|string',
                'medications' => 'nullable|string',
                'health_insurance' => 'nullable|string|max:255',
                'insurance_number' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Atualizar dados do usuário
            $userData = $request->only(['name', 'email', 'phone', 'birth_date', 'gender', 'rg']);
            if (!empty($userData)) {
                $user->update($userData);
            }

            // Atualizar dados do paciente
            $patientData = $request->only([
                'emergency_contact',
                'emergency_phone',
                'blood_type',
                'allergies',
                'chronic_diseases',
                'medications',
                'health_insurance',
                'insurance_number'
            ]);

            if (!empty($patientData)) {
                $user->patient->update($patientData);
            }

            DB::commit();

            $patient = Patient::with(['user'])->find($user->patient->id);

            // Adicionar URL completa do avatar se existir
            if ($patient->user && $patient->user->avatar) {
                $patient->user->avatar_url = asset('storage/' . $patient->user->avatar);
            }

            return response()->json([
                'message' => 'Perfil atualizado com sucesso',
                'patient' => $patient
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar perfil do paciente: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload de avatar do paciente
     */
    public function uploadAvatar(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Deletar avatar antigo se existir
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Upload novo avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $avatarPath]);

            return response()->json([
                'message' => 'Avatar atualizado com sucesso',
                'avatar_url' => asset('storage/' . $avatarPath)
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao fazer upload do avatar: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao fazer upload do avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar consultas do paciente autenticado
     */
    public function getAppointments(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->patient) {
                return response()->json([
                    'message' => 'Perfil de paciente não encontrado'
                ], 404);
            }

            $query = Appointment::with(['doctor.doctor.specialty', 'specialty'])
                ->where('patient_id', $user->id); // patient_id aponta para users.id, não patients.id

            // Filtrar por status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filtrar por data
            if ($request->has('date')) {
                $query->where('appointment_date', $request->date);
            }

            $appointments = $query
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get();

            \Log::info('PatientProfileController@getAppointments - Total: ' . $appointments->count());
            \Log::info('PatientProfileController@getAppointments - First appointment: ' . json_encode($appointments->first()));

            return response()->json($appointments);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar consultas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao carregar consultas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar consultas futuras
     */
    public function getUpcomingAppointments(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->patient) {
                return response()->json([
                    'message' => 'Perfil de paciente não encontrado'
                ], 404);
            }

            $appointments = Appointment::with(['doctor.doctor.specialty', 'specialty'])
                ->where('patient_id', $user->id) // patient_id aponta para users.id, não patients.id
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('appointment_date', '>=', now()->toDateString())
                ->orderBy('appointment_date', 'asc')
                ->orderBy('appointment_time', 'asc')
                ->get();

            return response()->json($appointments);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar consultas futuras: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao carregar consultas futuras',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar consulta
     */
    public function cancelAppointment(Request $request, $appointmentId)
    {
        try {
            $user = $request->user();

            if (!$user->patient) {
                return response()->json([
                    'message' => 'Perfil de paciente não encontrado'
                ], 404);
            }

            // Buscar consulta usando o relacionamento para garantir que pertence ao paciente
            $appointment = $user->patient->appointments()->findOrFail($appointmentId);

            // Verificar se a consulta pode ser cancelada
            if (!in_array($appointment->status, ['pending', 'confirmed'])) {
                return response()->json([
                    'message' => 'Esta consulta não pode ser cancelada'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'cancellation_reason' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->cancellation_reason ?? 'Cancelado pelo paciente',
                'cancelled_at' => now()
            ]);

            return response()->json([
                'message' => 'Consulta cancelada com sucesso',
                'appointment' => $appointment->load(['doctor', 'doctorProfile.specialty', 'specialty'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao cancelar consulta: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao cancelar consulta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Alterar senha
     */
    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            // Verificar senha atual
            if (!\Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Senha atual incorreta'
                ], 422);
            }

            // Atualizar senha
            $user->update([
                'password' => bcrypt($request->new_password)
            ]);

            return response()->json([
                'message' => 'Senha alterada com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao alterar senha: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao alterar senha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter estatísticas do paciente
     */
    public function getStats(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->patient) {
                return response()->json([
                    'message' => 'Perfil de paciente não encontrado'
                ], 404);
            }

            // patient_id na tabela appointments aponta para users.id, não patients.id
            $patientId = $user->id;

            $stats = [
                'total_appointments' => Appointment::where('patient_id', $patientId)->count(),
                'upcoming_appointments' => Appointment::where('patient_id', $patientId)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->where('appointment_date', '>=', now()->toDateString())
                    ->count(),
                'completed_appointments' => Appointment::where('patient_id', $patientId)
                    ->where('status', 'completed')
                    ->count(),
                'cancelled_appointments' => Appointment::where('patient_id', $patientId)
                    ->where('status', 'cancelled')
                    ->count(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Erro ao buscar estatísticas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao buscar estatísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar prontuários médicos do paciente autenticado
     */
    public function getMedicalRecords(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->patient) {
                return response()->json([
                    'message' => 'Perfil de paciente não encontrado'
                ], 404);
            }

            // patient_id na tabela medical_records aponta para users.id
            $medicalRecords = \App\Models\MedicalRecord::with([
                'appointment',
                'doctor.user',
                'doctor.specialty'
            ])
                ->where('patient_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($medicalRecords);
        } catch (\Exception $e) {
            Log::error('Erro ao buscar prontuários: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao buscar prontuários médicos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
