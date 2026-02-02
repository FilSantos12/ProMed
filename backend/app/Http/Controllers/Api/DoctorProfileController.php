<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\DoctorDocument;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class DoctorProfileController extends Controller
{
    /**
     * Obter perfil completo do médico autenticado
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->doctor) {
                return response()->json([
                    'message' => 'Perfil de médico não encontrado'
                ], 404);
            }

            $doctor = Doctor::with([
                'user',
                'specialty',
                'schedules' => function($query) {
                    $query->orderBy('schedule_date')->orderBy('start_time');
                },
                'documents'
            ])->find($user->doctor->id);

            return response()->json([
                'doctor' => $doctor,
                'stats' => $this->getDoctorStats($doctor->user_id)
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar perfil do médico: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao carregar perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar perfil do médico autenticado
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->doctor) {
                return response()->json([
                    'message' => 'Perfil de médico não encontrado'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone' => 'sometimes|string|max:20',
                'bio' => 'sometimes|string|max:1000',
                'specialty_id' => 'sometimes|exists:specialties,id',
                'crm' => 'sometimes|string|max:20',
                'crm_state' => 'sometimes|string|size:2',
                'consultation_price' => 'sometimes|numeric|min:0',
                'consultation_duration' => 'sometimes|integer|min:15|max:180',
                'formation' => 'sometimes|array',
                'formation.*.institution' => 'required_with:formation|string',
                'formation.*.degree' => 'required_with:formation|string',
                'formation.*.year' => 'required_with:formation|integer|min:1950|max:' . date('Y'),
                'years_experience' => 'sometimes|integer|min:0|max:70',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Atualizar dados do usuário
            $userData = $request->only(['name', 'email', 'phone']);
            if (!empty($userData)) {
                $user->update($userData);
            }

            // Atualizar dados do médico
            $doctorData = $request->only([
                'specialty_id',
                'crm',
                'crm_state',
                'bio',
                'consultation_price',
                'consultation_duration',
                'formation',
                'years_experience'
            ]);

            if (!empty($doctorData)) {
                $user->doctor->update($doctorData);
            }

            DB::commit();

            $doctor = Doctor::with(['user', 'specialty', 'schedules', 'documents'])
                ->find($user->doctor->id);

            return response()->json([
                'message' => 'Perfil atualizado com sucesso',
                'doctor' => $doctor
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar perfil do médico: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload de avatar do médico
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

            // Deletar avatar antigo do Cloudinary se existir e for URL do Cloudinary
            if ($user->avatar && str_contains($user->avatar, 'cloudinary.com')) {
                try {
                    // Extrair public_id da URL do Cloudinary
                    preg_match('/upload\/(?:v\d+\/)?(.+)\.\w+$/', $user->avatar, $matches);
                    if (!empty($matches[1])) {
                        Cloudinary::destroy($matches[1]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Não foi possível deletar avatar antigo do Cloudinary: ' . $e->getMessage());
                }
            }

            // Upload novo avatar para o Cloudinary
            $uploadedFile = Cloudinary::upload($request->file('avatar')->getRealPath(), [
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

            return response()->json([
                'message' => 'Avatar atualizado com sucesso',
                'avatar_url' => $avatarUrl
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
     * Gerenciar horários de atendimento
     */
    public function getSchedules(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user->doctor) {
                return response()->json([
                    'message' => 'Perfil de médico não encontrado'
                ], 404);
            }

            Log::info('getSchedules - Doctor ID: ' . $user->doctor->id);

            $schedules = Schedule::where('doctor_id', $user->doctor->id)
                ->orderBy('schedule_date')
                ->orderBy('start_time')
                ->get();

            Log::info('getSchedules - Total de schedules encontradas: ' . $schedules->count());
            Log::info('getSchedules - Schedules: ' . json_encode($schedules));

            return response()->json($schedules);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar horários: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao carregar horários',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Adicionar horário de atendimento
     */
    public function addSchedule(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'schedule_date' => 'required|date',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'slot_duration' => 'sometimes|integer|min:15|max:180',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();

            if (!$user->doctor) {
                return response()->json([
                    'message' => 'Perfil de médico não encontrado'
                ], 404);
            }

            // Verificar se já existe horário na mesma data e horário
            $exists = Schedule::where('doctor_id', $user->doctor->id)
                ->where('schedule_date', $request->schedule_date)
                ->where(function($query) use ($request) {
                    $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                          ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                          ->orWhere(function($q) use ($request) {
                              $q->where('start_time', '<=', $request->start_time)
                                ->where('end_time', '>=', $request->end_time);
                          });
                })
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Já existe um horário conflitante nesta data e horário'
                ], 422);
            }

            // Obter o dia da semana da data
            $dayOfWeek = strtolower(date('l', strtotime($request->schedule_date)));

            Log::info('addSchedule - Doctor ID: ' . $user->doctor->id);
            Log::info('addSchedule - Data: ' . json_encode([
                'doctor_id' => $user->doctor->id,
                'schedule_date' => $request->schedule_date,
                'day_of_week' => $dayOfWeek,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
            ]));

            $schedule = Schedule::create([
                'doctor_id' => $user->doctor->id,
                'schedule_date' => $request->schedule_date,
                'day_of_week' => $dayOfWeek,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'slot_duration' => $request->slot_duration ?? $user->doctor->consultation_duration ?? 30,
                'is_available' => true
            ]);

            Log::info('addSchedule - Schedule criado com ID: ' . $schedule->id);

            return response()->json([
                'message' => 'Horário adicionado com sucesso',
                'schedule' => $schedule
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro ao adicionar horário: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao adicionar horário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar horário de atendimento
     */
    public function updateSchedule(Request $request, $scheduleId)
    {
        try {
            $user = $request->user();

            if (!$user->doctor) {
                return response()->json([
                    'message' => 'Perfil de médico não encontrado'
                ], 404);
            }

            $schedule = Schedule::where('doctor_id', $user->doctor->id)
                ->findOrFail($scheduleId);

            $validator = Validator::make($request->all(), [
                'day_of_week' => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
                'start_time' => 'sometimes|date_format:H:i',
                'end_time' => 'sometimes|date_format:H:i|after:start_time',
                'slot_duration' => 'sometimes|integer|min:15|max:180',
                'is_available' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $schedule->update($request->all());

            return response()->json([
                'message' => 'Horário atualizado com sucesso',
                'schedule' => $schedule
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao atualizar horário: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar horário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar horário de atendimento
     */
    public function deleteSchedule(Request $request, $scheduleId)
    {
        try {
            $user = $request->user();

            if (!$user->doctor) {
                return response()->json([
                    'message' => 'Perfil de médico não encontrado'
                ], 404);
            }

            $schedule = Schedule::where('doctor_id', $user->doctor->id)
                ->findOrFail($scheduleId);

            $schedule->delete();

            return response()->json([
                'message' => 'Horário removido com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao deletar horário: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao deletar horário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter documentos do médico
     */
    public function getDocuments(Request $request)
    {
        try {
            $user = $request->user();
            $documents = DoctorDocument::where('doctor_id', $user->doctor->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($documents);
        } catch (\Exception $e) {
            Log::error('Erro ao carregar documentos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao carregar documentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload de documento
     */
    public function uploadDocument(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'document_type' => 'required|in:diploma,crm_document,photo,certificate,other',
                'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            $file = $request->file('file');

            // Deletar documento anterior do mesmo tipo se existir
            $existingDoc = DoctorDocument::where('doctor_id', $user->doctor->id)
                ->where('document_type', $request->document_type)
                ->first();

            if ($existingDoc) {
                if (Storage::disk('public')->exists($existingDoc->file_path)) {
                    Storage::disk('public')->delete($existingDoc->file_path);
                }
                $existingDoc->delete();
            }

            // Upload novo documento
            $filePath = $file->store('doctor_documents/' . $user->doctor->id, 'public');

            $document = DoctorDocument::create([
                'doctor_id' => $user->doctor->id,
                'document_type' => $request->document_type,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending'
            ]);

            return response()->json([
                'message' => 'Documento enviado com sucesso',
                'document' => $document
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro ao fazer upload do documento: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao fazer upload do documento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar documento
     */
    public function deleteDocument(Request $request, $documentId)
    {
        try {
            $user = $request->user();
            $document = DoctorDocument::where('doctor_id', $user->doctor->id)
                ->findOrFail($documentId);

            // Deletar arquivo do storage
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return response()->json([
                'message' => 'Documento removido com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao deletar documento: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao deletar documento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter estatísticas do médico
     */
    private function getDoctorStats($doctorId)
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfWeek = $now->copy()->startOfWeek();

        return [
            'total_appointments' => Appointment::where('doctor_id', $doctorId)->count(),
            'appointments_this_month' => Appointment::where('doctor_id', $doctorId)
                ->whereBetween('appointment_date', [$startOfMonth, $now])
                ->count(),
            'appointments_this_week' => Appointment::where('doctor_id', $doctorId)
                ->whereBetween('appointment_date', [$startOfWeek, $now])
                ->count(),
            'pending_appointments' => Appointment::where('doctor_id', $doctorId)
                ->where('status', 'pending')
                ->count(),
            'confirmed_appointments' => Appointment::where('doctor_id', $doctorId)
                ->where('status', 'confirmed')
                ->where('appointment_date', '>=', $now->toDateString())
                ->count(),
            'total_patients' => Appointment::where('doctor_id', $doctorId)
                ->distinct('patient_id')
                ->count('patient_id'),
        ];
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
}
