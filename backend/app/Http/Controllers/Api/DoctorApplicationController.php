<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\DoctorDocument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DoctorApplicationController extends Controller
{
    /**
     * Paciente solicita se tornar médico
     * POST /api/v1/patient/apply-as-doctor
     */
    public function applyAsDoctor(Request $request)
    {
        try {
            $user = $request->user();

            // Verifica se já é médico aprovado
            if ($user->hasRole('doctor')) {
                return response()->json([
                    'message' => 'Você já é um médico aprovado'
                ], 400);
            }

            // Verifica se já tem solicitação pendente
            $existingApplication = Doctor::where('user_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if ($existingApplication) {
                return response()->json([
                    'message' => 'Você já tem uma solicitação em análise'
                ], 400);
            }

            // Validação
            $validated = $request->validate([
                'crm' => 'required|string|max:100|unique:doctors,crm',
                'crm_state' => 'required|string|size:2',
                'specialty_id' => 'required|exists:specialties,id',
                'bio' => 'nullable|string',
                'consultation_price' => 'nullable|numeric|min:0',
                'consultation_duration' => 'nullable|integer|min:15|max:180',
                'formation' => 'nullable|array',
                'years_experience' => 'nullable|integer|min:0',
                // Documentos
                'diploma_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'crm_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'identity_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
                'address_proof_document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            ], [
                'crm.required' => 'O número do CRM é obrigatório',
                'crm.unique' => 'Este CRM já está cadastrado',
                'crm_state.required' => 'O estado do CRM é obrigatório',
                'crm_state.size' => 'O estado deve ter 2 caracteres',
                'specialty_id.required' => 'A especialidade é obrigatória',
                'specialty_id.exists' => 'Especialidade inválida',
                'diploma_document.required' => 'O diploma é obrigatório',
                'crm_document.required' => 'O documento do CRM é obrigatório',
                'identity_document.required' => 'O documento de identidade é obrigatório',
            ]);

            DB::beginTransaction();

            try {
                // Criar registro na tabela doctors com status pending
                $doctor = Doctor::create([
                    'user_id' => $user->id,
                    'specialty_id' => $validated['specialty_id'],
                    'crm' => $validated['crm'],
                    'crm_state' => strtoupper($validated['crm_state']),
                    'bio' => $validated['bio'] ?? null,
                    'consultation_price' => $validated['consultation_price'] ?? 100.00,
                    'consultation_duration' => $validated['consultation_duration'] ?? 30,
                    'formation' => $validated['formation'] ?? null,
                    'years_experience' => $validated['years_experience'] ?? 0,
                    'status' => 'pending',
                ]);

                // Upload e salvar documentos na tabela doctor_documents
                $documents = [
                    'diploma' => $request->file('diploma_document'),
                    'crm_document' => $request->file('crm_document'),
                    'identity' => $request->file('identity_document'),
                ];

                if ($request->hasFile('address_proof_document')) {
                    $documents['address_proof'] = $request->file('address_proof_document');
                }

                foreach ($documents as $type => $file) {
                    // Upload do arquivo
                    $path = $file->store('doctor-documents/' . $doctor->id, 'public');

                    // Salvar registro do documento
                    DoctorDocument::create([
                        'doctor_id' => $doctor->id,
                        'document_type' => $type,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'status' => 'pending',
                    ]);
                }

                DB::commit();

                return response()->json([
                    'message' => 'Solicitação enviada com sucesso! Você receberá um email quando for analisada.',
                    'application' => $doctor->load(['specialty', 'documents'])
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Erro ao criar solicitação de médico: ' . $e->getMessage());
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erro ao processar solicitação: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao processar solicitação. Por favor, tente novamente.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Verificar status da solicitação do paciente
     * GET /api/v1/patient/doctor-application-status
     */
    public function checkApplicationStatus(Request $request)
    {
        try {
            $user = $request->user();

            $application = Doctor::with(['specialty', 'reviewer', 'documents'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$application) {
                return response()->json([
                    'has_application' => false
                ]);
            }

            return response()->json([
                'has_application' => true,
                'status' => $application->status,
                'specialty' => $application->specialty?->name,
                'crm' => $application->crm,
                'crm_state' => $application->crm_state,
                'rejection_reason' => $application->rejection_notes,
                'reviewed_at' => $application->reviewed_at,
                'reviewed_by' => $application->reviewer?->name,
                'created_at' => $application->created_at,
                'documents' => $application->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'type' => $doc->document_type,
                        'name' => $doc->file_name,
                        'status' => $doc->status,
                    ];
                })
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao verificar status da solicitação: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao verificar status da solicitação'
            ], 500);
        }
    }

    /**
     * Listar médicos pendentes de aprovação (Admin)
     * GET /api/v1/admin/doctors/pending
     */
    public function getPendingDoctors(Request $request)
    {
        try {
            $pendingDoctors = Doctor::with(['user', 'specialty', 'documents'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'count' => $pendingDoctors->count(),
                'applications' => $pendingDoctors->map(function ($doctor) {
                    return [
                        'id' => $doctor->id,
                        'user' => [
                            'id' => $doctor->user->id,
                            'name' => $doctor->user->name,
                            'email' => $doctor->user->email,
                            'phone' => $doctor->user->phone,
                        ],
                        'crm' => $doctor->crm,
                        'crm_state' => $doctor->crm_state,
                        'specialty' => $doctor->specialty?->name,
                        'bio' => $doctor->bio,
                        'consultation_price' => $doctor->consultation_price,
                        'consultation_duration' => $doctor->consultation_duration,
                        'years_experience' => $doctor->years_experience,
                        'formation' => $doctor->formation,
                        'status' => $doctor->status,
                        'created_at' => $doctor->created_at,
                        'documents' => $doctor->documents->map(function ($doc) {
                            return [
                                'id' => $doc->id,
                                'type' => $doc->document_type,
                                'name' => $doc->file_name,
                                'size' => $doc->file_size,
                                'url' => asset('storage/' . $doc->file_path),
                                'status' => $doc->status,
                            ];
                        })
                    ];
                })
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar médicos pendentes: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao listar médicos pendentes'
            ], 500);
        }
    }

    /**
     * Aprovar médico (Admin)
     * POST /api/v1/admin/doctors/{id}/approve
     */
    public function approveDoctor(Request $request, $id)
    {
        try {
            $doctor = Doctor::with('user')->findOrFail($id);

            if ($doctor->status !== 'pending') {
                return response()->json([
                    'message' => 'Esta solicitação já foi processada'
                ], 400);
            }

            DB::beginTransaction();

            try {
                $admin = $request->user();

                // 1. Atualizar status do doctor
                $doctor->update([
                    'status' => 'approved',
                    'reviewed_by' => $admin->id,
                    'reviewed_at' => now(),
                    'rejection_notes' => null
                ]);

                // 2. Aprovar todos os documentos
                $doctor->documents()->update([
                    'status' => 'approved',
                    'verified_by' => $admin->id,
                    'verified_at' => now()
                ]);

                // 3. Atualizar roles do usuário
                $user = $doctor->user;
                $currentRoles = $user->roles ?? [$user->role];

                if (!in_array('doctor', $currentRoles)) {
                    $currentRoles[] = 'doctor';
                }

                // Manter o role principal original, apenas adicionar doctor aos roles e ativar o perfil de doctor
                $user->update([
                    'roles' => $currentRoles,
                    'active_role' => 'doctor'
                ]);

                // 4. TODO: Enviar email de aprovação
                // Mail::to($user->email)->send(new DoctorApplicationApproved($doctor));

                DB::commit();

                Log::info("Médico aprovado: {$doctor->user->name} (CRM: {$doctor->crm}) por {$admin->name}");

                return response()->json([
                    'message' => 'Médico aprovado com sucesso!',
                    'doctor' => $doctor->fresh(['user', 'specialty', 'documents'])
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Solicitação não encontrada'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Erro ao aprovar médico: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao aprovar médico',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Rejeitar médico (Admin)
     * POST /api/v1/admin/doctors/{id}/reject
     */
    public function rejectDoctor(Request $request, $id)
    {
        try {
            $doctor = Doctor::with('user')->findOrFail($id);

            if ($doctor->status !== 'pending') {
                return response()->json([
                    'message' => 'Esta solicitação já foi processada'
                ], 400);
            }

            $validated = $request->validate([
                'reason' => 'required|string|max:1000'
            ], [
                'reason.required' => 'O motivo da rejeição é obrigatório',
                'reason.max' => 'O motivo não pode ter mais de 1000 caracteres'
            ]);

            DB::beginTransaction();

            try {
                $admin = $request->user();

                $doctor->update([
                    'status' => 'rejected',
                    'reviewed_by' => $admin->id,
                    'reviewed_at' => now(),
                    'rejection_notes' => $validated['reason']
                ]);

                // Rejeitar documentos também
                $doctor->documents()->update([
                    'status' => 'rejected',
                    'verified_by' => $admin->id,
                    'verified_at' => now(),
                    'notes' => $validated['reason']
                ]);

                // TODO: Enviar email de rejeição
                // Mail::to($doctor->user->email)->send(new DoctorApplicationRejected($doctor));

                DB::commit();

                Log::info("Médico rejeitado: {$doctor->user->name} (CRM: {$doctor->crm}) por {$admin->name}. Motivo: {$validated['reason']}");

                return response()->json([
                    'message' => 'Solicitação rejeitada'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Solicitação não encontrada'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erro ao rejeitar médico: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao rejeitar médico',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
