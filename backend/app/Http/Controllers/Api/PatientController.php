<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PatientController extends Controller
{
    /**
     * Listar todos os pacientes (Admin)
     */
    public function index(Request $request)
    {
        try {
            $query = Patient::with(['user'])
                ->join('users', 'patients.user_id', '=', 'users.id')
                ->select('patients.*');

            // Filtro por status
            if ($request->has('status')) {
                $isActive = $request->status === 'active' ? 1 : 0;
                $query->where('users.is_active', $isActive);
            }

            // Busca por nome ou CPF
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('users.name', 'like', "%{$search}%")
                      ->orWhere('users.cpf', 'like', "%{$search}%")
                      ->orWhere('users.email', 'like', "%{$search}%");
                });
            }

            $patients = $query->orderBy('users.created_at', 'desc')->paginate(15);

            return response()->json($patients);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar pacientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Visualizar um paciente específico
     */
    public function show($id)
    {
        try {
            $patient = Patient::with(['user'])->findOrFail($id);

            return response()->json($patient);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Paciente não encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Atualizar dados do paciente
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . Patient::findOrFail($id)->user_id,
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
        try {
            $patient = Patient::findOrFail($id);
            $user = User::findOrFail($patient->user_id);

            // Atualizar dados do usuário
            if ($request->has('name')) {
                $user->name = $request->name;
            }
            if ($request->has('email')) {
                $user->email = $request->email;
            }
            if ($request->has('phone')) {
                $user->phone = $request->phone;
            }
            if ($request->has('birth_date')) {
                $user->birth_date = $request->birth_date;
            }
            if ($request->has('gender')) {
                $user->gender = $request->gender;
            }
            if ($request->has('rg')) {
                $user->rg = $request->rg;
            }

            $user->save();

            // Atualizar dados específicos do paciente
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

            $patient->update($patientData);

            DB::commit();

            return response()->json([
                'message' => 'Paciente atualizado com sucesso',
                'patient' => $patient->load('user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao atualizar paciente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ativar/Desativar paciente
     */
    public function toggleStatus($id)
    {
        try {
            $patient = Patient::findOrFail($id);
            $user = User::findOrFail($patient->user_id);

            $user->is_active = !$user->is_active;
            $user->save();

            $status = $user->is_active ? 'ativado' : 'desativado';

            return response()->json([
                'message' => "Paciente {$status} com sucesso",
                'is_active' => $user->is_active
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao alterar status do paciente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar histórico de consultas do paciente
     */
    public function appointments($id)
    {
        try {
            $patient = Patient::findOrFail($id);

            $appointments = $patient->appointments()
                ->with(['doctor.user', 'doctor.specialty'])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get();

            return response()->json([
                'patient' => $patient->load('user'),
                'appointments' => $appointments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar histórico de consultas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}