<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Listar todas as consultas
     * GET /api/appointments
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor', 'specialty']);

        // Filtrar automaticamente baseado no usuário logado
        $user = $request->user();

        if ($user) {
            // Se for médico, mostrar apenas suas consultas
            if ($user->role === 'doctor' && $user->doctor) {
                $query->where('doctor_id', $user->doctor->user_id);
            }
            // Se for paciente, mostrar apenas suas consultas
            elseif ($user->role === 'patient' && $user->patient) {
                $query->where('patient_id', $user->patient->id);
            }
            // Admin pode ver todas as consultas (não aplica filtro)
        }

        // Filtrar por paciente (sobrescreve filtro automático se fornecido)
        if ($request->has('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filtrar por médico (sobrescreve filtro automático se fornecido)
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filtrar por status (aceita múltiplos status separados por vírgula)
        if ($request->has('status')) {
            $status = $request->status;
            if (str_contains($status, ',')) {
                // Múltiplos status separados por vírgula
                $statusArray = array_map('trim', explode(',', $status));
                $query->whereIn('status', $statusArray);
            } else {
                // Status único
                $query->where('status', $status);
            }
        }

        // Filtrar por data
        if ($request->has('date')) {
            $query->where('appointment_date', $request->date);
        }

        // Filtrar por período
        if ($request->has('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        // Filtros especiais
        if ($request->has('filter')) {
            switch ($request->filter) {
                case 'upcoming':
                    $query->upcoming();
                    break;
                case 'past':
                    $query->past();
                    break;
                case 'today':
                    $query->today();
                    break;
                case 'pending':
                    $query->pending();
                    break;
                case 'confirmed':
                    $query->confirmed();
                    break;
            }
        }

        // Ordenação
        $sortBy = $request->input('sort_by', 'appointment_date');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginação
        $perPage = $request->input('per_page', 15);
        $appointments = $query->paginate($perPage);

        return response()->json($appointments, 200);
    }

    /**
     * Criar nova consulta
     * POST /api/appointments
     */
    public function store(CreateAppointmentRequest $request)
    {
        try {
            \Log::info('AppointmentController@store - Request data: ' . json_encode($request->all()));
            \Log::info('AppointmentController@store - Validated data: ' . json_encode($request->validated()));

            // Criar agendamento já confirmado (sem necessidade de confirmação do médico)
            $data = $request->validated();
            $data['status'] = 'confirmed';
            $data['confirmed_at'] = now();

            $appointment = Appointment::create($data);

            // Aqui você pode adicionar envio de email/notificação

            \Log::info('AppointmentController@store - Appointment criado com ID: ' . $appointment->id);

            return response()->json([
                'message' => 'Consulta agendada com sucesso.',
                'appointment' => $appointment->load(['patient', 'doctor', 'specialty'])
            ], 201);

        } catch (\Exception $e) {
            \Log::error('AppointmentController@store - Erro: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao agendar consulta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exibir consulta específica
     * GET /api/appointments/{id}
     */
    public function show($id)
    {
        $appointment = Appointment::with(['patient', 'doctor', 'specialty'])->find($id);

        if (!$appointment) {
            return response()->json([
                'message' => 'Consulta não encontrada.'
            ], 404);
        }

        return response()->json($appointment, 200);
    }

    /**
     * Atualizar consulta
     * PUT/PATCH /api/appointments/{id}
     */
    public function update(UpdateAppointmentRequest $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'message' => 'Consulta não encontrada.'
            ], 404);
        }

        try {
            $appointment->update($request->validated());

            return response()->json([
                'message' => 'Consulta atualizada com sucesso.',
                'appointment' => $appointment->load(['patient', 'doctor', 'specialty'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar consulta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar consulta
     * DELETE /api/appointments/{id}
     */
    public function destroy($id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'message' => 'Consulta não encontrada.'
            ], 404);
        }

        try {
            $appointment->delete();

            return response()->json([
                'message' => 'Consulta deletada com sucesso.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao deletar consulta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirmar consulta
     * POST /api/appointments/{id}/confirm
     */
    public function confirm($id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'message' => 'Consulta não encontrada.'
            ], 404);
        }

        if ($appointment->status !== 'pending') {
            return response()->json([
                'message' => 'Apenas consultas pendentes podem ser confirmadas.'
            ], 400);
        }

        try {
            $appointment->confirm();

            // Aqui você pode enviar email/notificação de confirmação

            return response()->json([
                'message' => 'Consulta confirmada com sucesso.',
                'appointment' => $appointment->load(['patient', 'doctor', 'specialty'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao confirmar consulta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancelar consulta
     * POST /api/appointments/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'message' => 'Consulta não encontrada.'
            ], 404);
        }

        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'message' => 'Esta consulta não pode ser cancelada.'
            ], 400);
        }

        $request->validate([
            'cancellation_reason' => ['nullable', 'string', 'max:500']
        ]);

        try {
            $appointment->cancel($request->cancellation_reason);

            // Aqui você pode enviar email/notificação de cancelamento

            return response()->json([
                'message' => 'Consulta cancelada com sucesso.',
                'appointment' => $appointment->load(['patient', 'doctor', 'specialty'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao cancelar consulta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar consulta como realizada
     * POST /api/appointments/{id}/complete
     */
    public function complete(Request $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'message' => 'Consulta não encontrada.'
            ], 404);
        }

        if ($appointment->status !== 'confirmed') {
            return response()->json([
                'message' => 'Apenas consultas confirmadas podem ser marcadas como realizadas.'
            ], 400);
        }

        $request->validate([
            'doctor_notes' => ['nullable', 'string', 'max:2000']
        ]);

        try {
            if ($request->has('doctor_notes')) {
                $appointment->doctor_notes = $request->doctor_notes;
                $appointment->save();
            }

            $appointment->complete();

            return response()->json([
                'message' => 'Consulta marcada como realizada.',
                'appointment' => $appointment->load(['patient', 'doctor', 'specialty'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao marcar consulta como realizada.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reagendar consulta
     * POST /api/appointments/{id}/reschedule
     */
    public function reschedule(Request $request, $id)
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json([
                'message' => 'Consulta não encontrada.'
            ], 404);
        }

        if (!$appointment->canBeRescheduled()) {
            return response()->json([
                'message' => 'Esta consulta não pode ser reagendada.'
            ], 400);
        }

        $request->validate([
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
        ]);

        // Verificar se o novo horário está disponível
        $exists = Appointment::where('doctor_id', $appointment->doctor_id)
            ->where('appointment_date', $request->appointment_date)
            ->where('appointment_time', $request->appointment_time)
            ->where('id', '!=', $id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Este horário já está ocupado.'
            ], 400);
        }

        try {
            $appointment->update([
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'status' => 'pending' // Volta para pendente após reagendar
            ]);

            // Aqui você pode enviar email/notificação de reagendamento

            return response()->json([
                'message' => 'Consulta reagendada com sucesso.',
                'appointment' => $appointment->load(['patient', 'doctor', 'specialty'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao reagendar consulta.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter estatísticas de consultas
     * GET /api/appointments/statistics
     */
    public function statistics(Request $request)
    {
        $query = Appointment::query();

        // Filtrar por médico (se fornecido)
        if ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filtrar por período
        if ($request->has('date_from')) {
            $query->where('appointment_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('appointment_date', '<=', $request->date_to);
        }

        $total = $query->count();
        $pending = (clone $query)->where('status', 'pending')->count();
        $confirmed = (clone $query)->where('status', 'confirmed')->count();
        $completed = (clone $query)->where('status', 'completed')->count();
        $cancelled = (clone $query)->where('status', 'cancelled')->count();
        $noShow = (clone $query)->where('status', 'no_show')->count();

        return response()->json([
            'total' => $total,
            'pending' => $pending,
            'confirmed' => $confirmed,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'no_show' => $noShow,
        ], 200);
    }
}