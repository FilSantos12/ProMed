<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Usuário inativo. Entre em contato com o suporte.'
            ], 403);
        }

        // Criar token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Carregar relações baseado no role
        $userData = $user->toArray();
        if ($user->isDoctor()) {
            $user->load('doctor.specialty');
            $userData['doctor'] = $user->doctor;
        } elseif ($user->isPatient()) {
            $user->load('patient');
            $userData['patient'] = $user->patient;
        }

        return response()->json([
            'message' => 'Login realizado com sucesso!',
            'user' => $userData,
            'token' => $token,
        ]);
    }

    /**
     * Register - Paciente
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'cpf' => 'required|unique:users,cpf',
            'phone' => 'required',
            'birth_date' => 'required|date',
            'gender' => 'nullable|in:M,F,Outro',
        ]);

        // Criar usuário
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'cpf' => $request->cpf,
            'phone' => $request->phone,
            'birth_date' => $request->birth_date,
            'gender' => $request->gender,
            'role' => 'patient',
        ]);

        // Criar paciente
        Patient::create([
            'user_id' => $user->id,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Cadastro realizado com sucesso!',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Register - Médico (apenas Admin pode criar)
     */
    public function registerDoctor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'cpf' => 'required|unique:users,cpf',
            'phone' => 'required',
            'birth_date' => 'required|date',
            'gender' => 'nullable|in:M,F,Outro',
            'specialty_id' => 'required|exists:specialties,id',
            'crm' => 'required|unique:doctors,crm',
            'crm_state' => 'required|size:2',
            'bio' => 'nullable|string',
            'consultation_price' => 'nullable|numeric',
            'consultation_duration' => 'nullable|integer',
            'years_experience' => 'nullable|integer',
        ]);

        // Criar usuário
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'cpf' => $request->cpf,
            'phone' => $request->phone,
            'birth_date' => $request->birth_date,
            'gender' => $request->gender,
            'role' => 'doctor',
        ]);

        // Criar médico
        Doctor::create([
            'user_id' => $user->id,
            'specialty_id' => $request->specialty_id,
            'crm' => $request->crm,
            'crm_state' => $request->crm_state,
            'bio' => $request->bio,
            'consultation_price' => $request->consultation_price,
            'consultation_duration' => $request->consultation_duration ?? 30,
            'years_experience' => $request->years_experience,
        ]);

        $user->load('doctor.specialty');

        return response()->json([
            'message' => 'Médico cadastrado com sucesso!',
            'user' => $user,
        ], 201);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso!'
        ]);
    }

    /**
     * Get User Autenticado
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if ($user->isDoctor()) {
            $user->load('doctor.specialty');
        } elseif ($user->isPatient()) {
            $user->load('patient');
        }

        return response()->json($user);
    }
}