<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserProfileController extends Controller
{
    /**
     * Trocar perfil ativo do usuário
     * POST /api/v1/user/switch-profile
     */
    public function switchProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'role' => 'required|string|in:admin,doctor,patient'
            ], [
                'role.required' => 'O perfil é obrigatório',
                'role.in' => 'Perfil inválido'
            ]);

            $newRole = $validated['role'];

            // Verificar se o usuário possui esse role
            if (!$user->hasRole($newRole)) {
                return response()->json([
                    'message' => 'Você não possui acesso a este perfil',
                    'available_roles' => $user->roles
                ], 403);
            }

            // Trocar o perfil ativo
            $user->update(['active_role' => $newRole]);

            Log::info("Usuário {$user->name} (ID: {$user->id}) trocou perfil para: {$newRole}");

            // Retornar informações atualizadas do usuário
            return response()->json([
                'message' => 'Perfil alterado com sucesso',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'active_role' => $newRole,
                    'roles' => $user->roles,
                    'has_doctor_profile' => $user->hasRole('doctor'),
                    'has_patient_profile' => $user->hasRole('patient'),
                    'is_admin' => $user->hasRole('admin'),
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erro ao trocar perfil: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao trocar perfil',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obter perfis disponíveis para o usuário
     * GET /api/v1/user/available-profiles
     */
    public function getAvailableProfiles(Request $request)
    {
        try {
            $user = $request->user();

            $profiles = [];

            foreach ($user->roles ?? [] as $role) {
                $profileData = [
                    'role' => $role,
                    'is_active' => $user->active_role === $role,
                ];

                switch ($role) {
                    case 'admin':
                        $profileData['name'] = 'Administrador';
                        $profileData['icon'] = 'Shield';
                        $profileData['redirect'] = '/admin-area';
                        break;
                    case 'doctor':
                        $profileData['name'] = 'Médico';
                        $profileData['icon'] = 'Stethoscope';
                        $profileData['redirect'] = '/doctor-area';
                        break;
                    case 'patient':
                        $profileData['name'] = 'Paciente';
                        $profileData['icon'] = 'User';
                        $profileData['redirect'] = '/patient-area';
                        break;
                }

                $profiles[] = $profileData;
            }

            return response()->json([
                'active_role' => $user->active_role,
                'profiles' => $profiles
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao obter perfis disponíveis: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao obter perfis disponíveis'
            ], 500);
        }
    }
}
