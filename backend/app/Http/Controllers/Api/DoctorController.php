<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\DoctorDocument;

class DoctorController extends Controller
{
    /**
     * Listar todos os médicos (Admin)
     */
    public function adminIndex(Request $request)
    {
        try {
            $query = Doctor::with(['user', 'specialty']);

            // Filtro por status
            if ($request->has('status')) {
                $status = $request->status;
                
                if ($status === 'active') {
                    $query->whereHas('user', function ($q) {
                        $q->where('is_active', true);
                    })->where('status', 'approved');
                } elseif ($status === 'inactive') {
                    $query->whereHas('user', function ($q) {
                        $q->where('is_active', false);
                    });
                } elseif ($status === 'pending') {
                    $query->where('status', 'pending');
                } elseif ($status === 'rejected') {
                    $query->where('status', 'rejected');
                }
            }

            // Filtro por especialidade
            if ($request->has('specialty_id')) {
                $query->where('specialty_id', $request->specialty_id);
            }

            // Busca por nome, CRM ou email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                                 ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhere('crm', 'like', "%{$search}%");
                });
            }

            // Paginação
            $doctors = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json($doctors);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao carregar médicos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar todos os médicos
     */
    public function index(Request $request)
    {
        $query = Doctor::with(['user', 'specialty'])
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            });

        // Filtrar por especialidade
        if ($request->has('specialty_id')) {
            $query->where('specialty_id', $request->specialty_id);
        }

        // Buscar por nome
        if ($request->has('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            });
        }

        $doctors = $query->paginate(15);

        return response()->json($doctors);
    }

    /**
     * Exibir um médico específico
     */
        public function show($id)
        {
            try {
                $doctor = Doctor::with(['user', 'specialty', 'documents'])
                    ->findOrFail($id);

                return response()->json($doctor);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Médico não encontrado',
                    'error' => $e->getMessage()
                ], 404);
            }
        }

    /**
     * Atualizar dados do médico
     */
public function update(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'name' => 'sometimes|string|max:255',
        'email' => 'sometimes|email|unique:users,email,' . Doctor::findOrFail($id)->user_id,
        'phone' => 'sometimes|string|max:20',
        'crm' => 'sometimes|string|max:20',
        'crm_state' => 'sometimes|string|max:2',
        'specialty_id' => 'sometimes|exists:specialties,id',
        'bio' => 'nullable|string',
        'consultation_price' => 'nullable|numeric|min:0',
        'consultation_duration' => 'nullable|integer|min:15',
        'formation' => 'nullable|array',
        'years_experience' => 'nullable|integer|min:0',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Erro de validação',
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        $doctor = Doctor::findOrFail($id);
        $user = User::findOrFail($doctor->user_id);

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

        $user->save();

        // Atualizar dados específicos do médico
        $doctorData = $request->only([
            'crm',
            'crm_state',
            'specialty_id',
            'bio',
            'consultation_price',
            'consultation_duration',
            'formation',
            'years_experience'
        ]);

        $doctor->update($doctorData);

        DB::commit();

        return response()->json([
            'message' => 'Médico atualizado com sucesso',
            'doctor' => $doctor->load(['user', 'specialty'])
        ]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Erro ao atualizar médico',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Ativar/Desativar médico (Admin)
 */
public function toggleStatus($id)
{
    try {
        $doctor = Doctor::findOrFail($id);
        $user = User::findOrFail($doctor->user_id);

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'ativado' : 'desativado';

        return response()->json([
            'message' => "Médico {$status} com sucesso",
            'is_active' => $user->is_active
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erro ao alterar status do médico',
            'error' => $e->getMessage()
        ], 500);
    }
}


    /**
     * Listar agendamentos do médico
     */
    public function appointments(Request $request, $id)
{
    try {
        $doctor = Doctor::findOrFail($id);

        $query = $doctor->appointments()
            ->with(['patient', 'specialty'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc');

        // Paginação
        $perPage = $request->input('per_page', 10);
        $appointments = $query->paginate($perPage);

        return response()->json([
            'doctor' => $doctor->load(['user', 'specialty']),
            'appointments' => $appointments
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erro ao buscar histórico de consultas',
            'error' => $e->getMessage()
        ], 500);
    }
}


    /**
     * Listar documentos de um médico (Admin)
     */
    public function documents($id)
    {
        try {
            $doctor = Doctor::with(['user', 'specialty', 'documents'])->findOrFail($id);

            return response()->json([
                'doctor' => $doctor,
                'documents' => $doctor->documents
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao carregar documentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Aprovar médico (Admin)
 */
public function approve($id)
{
    try {
        $doctor = Doctor::findOrFail($id);
        
        $doctor->status = 'approved';
        $doctor->save();
        
        // Ativar o usuário também
        $doctor->user->is_active = true;
        $doctor->user->save();
        
        return response()->json([
            'message' => 'Médico aprovado com sucesso',
            'doctor' => $doctor->load('user', 'specialty')
        ]);
        
    } catch (\Exception $e) {
        Log::error('Erro ao aprovar médico: ' . $e->getMessage());
        return response()->json([
            'message' => 'Erro ao aprovar médico',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Rejeitar médico (Admin)
     */
    public function reject(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Motivo da rejeição é obrigatório',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $doctor = Doctor::findOrFail($id);
            
            $doctor->status = 'rejected';
            $doctor->rejection_notes = $request->notes; // Salvar o motivo
            $doctor->save();
            
            // Desativar o usuário também
            $doctor->user->is_active = false;
            $doctor->user->save();
            
            return response()->json([
                'message' => 'Médico rejeitado',
                'doctor' => $doctor->load('user', 'specialty')
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro ao rejeitar médico: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao rejeitar médico',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aprovar documento (Admin)
     */

    public function approveDocument(Request $request, $doctorId, $documentId)
    {
        try {
            // Use Auth::user() em vez de auth()->user()
            $user = \Illuminate\Support\Facades\Auth::user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Usuário não autenticado',
                ], 401);
            }

            $document = DoctorDocument::where('doctor_id', $doctorId)
                ->where('id', $documentId)
                ->firstOrFail();

            $document->status = 'approved';
            $document->verified_at = now();
            $document->verified_by = $user->id;  
            $document->notes = $request->notes;
            $document->save();

            return response()->json([
                'message' => 'Documento aprovado com sucesso',
                'document' => $document
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao aprovar documento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rejeitar documento (Admin)
     */
    public function rejectDocument(Request $request, $doctorId, $documentId)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Motivo da rejeição é obrigatório',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
        $user = \Illuminate\Support\Facades\Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Usuário não autenticado'
            ], 401);
        }

        $document = DoctorDocument::where('doctor_id', $doctorId)
            ->where('id', $documentId)
            ->firstOrFail();

        $document->status = 'rejected';
        $document->verified_at = now();
        $document->verified_by = $user->id;
        $document->notes = $request->notes;
        $document->save();

        return response()->json([
            'message' => 'Documento rejeitado',
            'document' => $document
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erro ao rejeitar documento',
            'error' => $e->getMessage()
        ], 500);
    }
 }

    /**
     * Download documento (Admin)
     */
    public function downloadDocument($doctorId, $documentId)
    {
        try {
            $document = DoctorDocument::where('doctor_id', $doctorId)
                ->where('id', $documentId)
                ->firstOrFail();

            $relativePath = $document->file_path;
            
            $possiblePaths = [
                storage_path('app/public/' . $relativePath),
                storage_path('app/' . $relativePath),
                public_path('storage/' . $relativePath),
            ];

            $filePath = null;
            foreach ($possiblePaths as $path) {
                if (file_exists($path)) {
                    $filePath = $path;
                    break;
                }
            }

            if (!$filePath) {
                return response()->json(['message' => 'Arquivo não encontrado'], 404);
            }

            return response()->download($filePath, $document->file_name, [
                'Content-Type' => $document->mime_type
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro ao baixar documento: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao baixar documento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

        /**
         * Visualizar documento inline (Admin)
         */

        public function viewDocumentPublic($doctorId, $documentId, $token)
        {
            try {
                // Decodificar token (converte %7C de volta para |)
                $token = urldecode($token);
                
                // Validar token
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
                
                if (!$user || $user->role !== 'admin') {
                    Log::error('Token inválido ou usuário não autorizado. Token: ' . substr($token, 0, 20) . '...');
                    return response()->json(['message' => 'Não autorizado'], 401);
                }

                $document = DoctorDocument::where('doctor_id', $doctorId)
                    ->where('id', $documentId)
                    ->firstOrFail();

                $filePath = storage_path('app/public/' . $document->file_path);

                if (!file_exists($filePath)) {
                    Log::error('Arquivo não encontrado: ' . $filePath);
                    return response()->json(['message' => 'Arquivo não encontrado'], 404);
                }

                return response()->file($filePath, [
                    'Content-Type' => $document->mime_type,
                    'Content-Disposition' => 'inline'
                ]);
                
            } catch (\Exception $e) {
                Log::error('Erro ao visualizar documento público: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Erro ao carregar documento',
                    'error' => $e->getMessage()
                ], 500);
            }
        }
        /** 
         * Download documento com token na URL (para botão download)
         */
        public function downloadDocumentPublic($doctorId, $documentId, $token)
            {
                try {
                    // Decodificar token
                    $token = urldecode($token);
                    
                    // Validar token
                    $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
                    
                    if (!$user || $user->role !== 'admin') {
                        return response()->json(['message' => 'Não autorizado'], 401);
                    }

                    $document = DoctorDocument::where('doctor_id', $doctorId)
                        ->where('id', $documentId)
                        ->firstOrFail();

                    $filePath = storage_path('app/public/' . $document->file_path);

                    if (!file_exists($filePath)) {
                        return response()->json(['message' => 'Arquivo não encontrado'], 404);
                    }

                    return response()->download($filePath, $document->file_name, [
                        'Content-Type' => $document->mime_type
                    ]);
                    
                } catch (\Exception $e) {
                    Log::error('Erro ao baixar documento público: ' . $e->getMessage());
                    return response()->json(['message' => 'Erro ao baixar documento'], 500);
                }
            }

    /**
     * Dashboard do médico
     */
    public function dashboard($id)
    {
        $doctor = Doctor::findOrFail($id);

        $stats = [
            'total_appointments' => $doctor->appointments()->count(),
            'upcoming_appointments' => $doctor->appointments()
                ->upcoming()
                ->count(),
            'today_appointments' => $doctor->appointments()
                ->today()
                ->count(),
            'completed_appointments' => $doctor->appointments()
                ->where('status', 'completed')
                ->count(),
        ];

        $todayAppointments = $doctor->appointments()
            ->with(['patient.user'])
            ->today()
            ->orderBy('appointment_date')
            ->get();

        return response()->json([
            'stats' => $stats,
            'today_appointments' => $todayAppointments,
        ]);
    }
}
