<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use App\Models\DoctorDocument;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class AuthController extends Controller
{

public function login(Request $request)
{
    // Validar campos
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
        'expected_role' => 'required|in:patient,doctor,admin',
    ]);

    $credentials = $request->only('email', 'password');

    // Tentar autenticar
    if (!Auth::attempt($credentials)) {
        return response()->json([
            'message' => 'Email ou senha incorretos.'
        ], 401);
    }

    // Pegar o usuário
    $user = \App\Models\User::where('email', $request->email)->first();

    // VALIDAR SE O USUÁRIO TEM O ROLE SOLICITADO (suporte multi-role)
    if (!$user->hasRole($request->expected_role)) {
        Auth::logout();

        $roles = [
            'patient' => 'pacientes',
            'doctor' => 'médicos',
            'admin' => 'administradores',
        ];

        return response()->json([
            'message' => "Esta área é exclusiva para {$roles[$request->expected_role]}."
        ], 403);
    }

    // Definir o perfil ativo
    $user->update(['active_role' => $request->expected_role]);

    // VALIDAR SE ESTÁ ATIVO
    if (!$user->is_active) {
        Auth::logout();
        return response()->json([
            'message' => 'Sua conta está inativa. Entre em contato com o administrador.'
        ], 403);
    }

    // SE ESTIVER FAZENDO LOGIN COMO MÉDICO, verificar status de aprovação
    if ($request->expected_role === 'doctor') {
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            Auth::logout();
            return response()->json([
                'message' => 'Cadastro de médico não encontrado. Entre em contato com o administrador.',
                'status' => 'error'
            ], 403);
        }

        // Verificar status do médico
        if ($doctor->status === 'pending') {
            Auth::logout();
            return response()->json([
                'message' => 'Seu cadastro está aguardando aprovação. Você receberá um email quando for aprovado.',
                'status' => 'pending'
            ], 403);
        }

        if ($doctor->status === 'rejected') {
            Auth::logout();
            return response()->json([
                'message' => 'Seu cadastro foi rejeitado.',
                'status' => 'rejected',
                'rejection_notes' => $doctor->rejection_notes ?? 'Motivo não especificado.'
            ], 403);
        }

        // Se chegou aqui, o médico está aprovado (status = 'approved')
    }

    // Criar token
    $token = $user->createToken('auth_token')->plainTextToken;

    // Carregar relações baseado no perfil ativo
    if ($request->expected_role === 'doctor' && $user->hasRole('doctor')) {
        $user->load('doctor.specialty');
    }
    if ($request->expected_role === 'patient' && $user->hasRole('patient')) {
        $user->load('patient');
    }

    return response()->json([
        'message' => 'Login realizado com sucesso!',
        'user' => $user,
        'token' => $token,
    ]);

    
        {/*$request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'role'  ,
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['E-mail ou senha incorretos.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Usuário inativo. Entre em contato com o suporte.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

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
        ]);*/}
    }
        

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'cpf' => 'required|string|unique:users',
            'rg' => 'nullable|string|max:20',
            'phone' => 'required|string',
            'birth_date' => 'required|date',
            'gender' => 'nullable|in:M,F,Masculino,Feminino,Outro',
            'role' => 'required|in:patient,doctor,admin',

            // Campos de endereço
            'cep' => 'nullable|string|max:10',
            'address' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|size:2',

            // Campos específicos do médico
            'crm' => 'required_if:role,doctor|nullable|string|unique:doctors',
            'crm_state' => 'required_if:role,doctor|nullable|string|size:2',
            'specialty_id' => 'required_if:role,doctor|nullable|exists:specialties,id',
            'bio' => 'nullable|string',
            'consultation_price' => 'nullable|numeric|min:0',
            'consultation_duration' => 'nullable|integer|min:15',
            'university' => 'nullable|string',
            'graduation_year' => 'nullable|integer|min:1950|max:' . date('Y'),
            'years_experience' => 'nullable|integer|min:0',

            // Documentos do médico (arquivos)
            'diploma' => 'required_if:role,doctor|nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'crm_document' => 'required_if:role,doctor|nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'rg_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'photo' => 'required_if:role,doctor|nullable|image|mimes:jpg,jpeg,png|max:5120',

        ]);

        // Definir roles baseado no tipo de cadastro
        // Médicos também são pacientes (podem agendar consultas com outros médicos)
        $roles = $request->role === 'doctor'
            ? ['doctor', 'patient']
            : [$request->role ?? 'patient'];

        // Criar usuário
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'cpf' => $request->cpf,
            'rg' => $request->rg,
            'phone' => $request->phone,
            'birth_date' => $request->birth_date,
            'gender' => $request->gender,
            'role' => $request->role ?? 'patient',
            'active_role' => $request->role ?? 'patient',
            'roles' => $roles,
            'is_active' => true,
            'cep' => $request->cep,
            'address' => $request->address,
            'number' => $request->number,
            'complement' => $request->complement,
            'neighborhood' => $request->neighborhood,
            'city' => $request->city,
            'state' => $request->state,
        ]);

        // Sempre criar registro de paciente (médicos também são pacientes)
        Patient::create([
            'user_id' => $user->id,
        ]);

        // Se for médico, criar registro na tabela doctors
        if ($request->role === 'doctor') {
            // Preparar dados de formação acadêmica
            $formation = [];
            if ($request->university || $request->graduation_year) {
                $formation[] = [
                    'university' => $request->university,
                    'graduation_year' => $request->graduation_year,
                    'degree' => 'Medicina'
                ];
            }

            $doctor = Doctor::create([
                'user_id' => $user->id,
                'specialty_id' => $request->specialty_id,
                'crm' => $request->crm,
                'crm_state' => $request->crm_state,
                'bio' => $request->bio,
                'consultation_price' => $request->consultation_price ?? 0,
                'consultation_duration' => $request->consultation_duration ?? 30,
                'formation' => !empty($formation) ? json_encode($formation) : null,
                'years_experience' => $request->years_experience ?? 0,
            ]);

            // Salvar documentos
            $documentTypes = ['diploma', 'crm_document', 'rg_document', 'photo'];

            foreach ($documentTypes as $type) {
                if ($request->hasFile($type)) {
                    $file = $request->file($type);

                    // Se for a foto, fazer upload no Cloudinary
                    if ($type === 'photo') {
                        try {
                            $uploadedFile = Cloudinary::upload($file->getRealPath(), [
                                'folder' => 'promed/avatars',
                                'transformation' => [
                                    'width' => 400,
                                    'height' => 400,
                                    'crop' => 'fill',
                                    'gravity' => 'face'
                                ]
                            ]);
                            $avatarUrl = $uploadedFile->getSecurePath();
                            $user->update(['avatar' => $avatarUrl]);

                            // Criar registro no banco com URL do Cloudinary
                            DoctorDocument::create([
                                'doctor_id' => $doctor->id,
                                'document_type' => $type,
                                'file_name' => $file->getClientOriginalName(),
                                'file_path' => $avatarUrl,
                                'file_size' => $file->getSize(),
                                'mime_type' => $file->getMimeType(),
                                'status' => 'pending',
                            ]);
                        } catch (\Exception $e) {
                            \Log::error('Erro ao fazer upload da foto para Cloudinary: ' . $e->getMessage());
                        }
                    } else {
                        // Para outros documentos, salvar localmente (ou pode usar Cloudinary também)
                        $folder = 'doctors/documents';
                        $fileName = time() . '_' . $type . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs($folder, $fileName, 'public');

                        DoctorDocument::create([
                            'doctor_id' => $doctor->id,
                            'document_type' => $type,
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $filePath,
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getMimeType(),
                            'status' => 'pending',
                        ]);
                    }
                }
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Carregar relações
        if ($user->isDoctor()) {
            $user->load('doctor.specialty', 'doctor.documents');
        } elseif ($user->isPatient()) {
            $user->load('patient');
        }

        return response()->json([
            'message' => 'Usuário cadastrado com sucesso!',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout realizado com sucesso!']);
    }

    public function user(Request $request)
    {
        $user = $request->user();

        // Carregar relações baseadas nos roles do usuário
        if ($user->hasRole('doctor')) {
            $user->load('doctor.specialty');
        }
        if ($user->hasRole('patient')) {
            $user->load('patient');
        }

        return response()->json($user);
    }

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