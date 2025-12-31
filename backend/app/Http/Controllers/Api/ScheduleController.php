<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateScheduleRequest;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Listar todos os horários
     * GET /api/schedules
     */
    public function index(Request $request)
    {
        \Log::info('ScheduleController@index - Params: ' . json_encode($request->all()));

        $query = Schedule::with('doctor');

        // Filtrar por médico
        if ($request->has('doctor_id')) {
            \Log::info('ScheduleController@index - Filtrando por doctor_id: ' . $request->doctor_id);
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filtrar por data específica
        if ($request->has('schedule_date')) {
            \Log::info('ScheduleController@index - Filtrando por schedule_date: ' . $request->schedule_date);
            $query->whereDate('schedule_date', $request->schedule_date);
        }

        // Filtrar por dia da semana
        if ($request->has('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        // Filtrar apenas disponíveis
        if ($request->has('available')) {
            // Converter string "true"/"false" para booleano
            $isAvailable = filter_var($request->available, FILTER_VALIDATE_BOOLEAN);
            \Log::info('ScheduleController@index - Filtrando por is_available: ' . $request->available . ' (convertido para: ' . ($isAvailable ? 'true' : 'false') . ')');
            $query->where('is_available', $isAvailable);
        }

        $schedules = $query->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        \Log::info('ScheduleController@index - Total de schedules encontradas: ' . $schedules->count());
        \Log::info('ScheduleController@index - Schedules: ' . json_encode($schedules));

        return response()->json($schedules, 200);
    }

    /**
     * Criar novo horário
     * POST /api/schedules
     */
    public function store(CreateScheduleRequest $request)
    {
        try {
            $schedule = Schedule::create($request->validated());

            return response()->json([
                'message' => 'Horário criado com sucesso.',
                'schedule' => $schedule->load('doctor')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar horário.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exibir horário específico
     * GET /api/schedules/{id}
     */
    public function show($id)
    {
        $schedule = Schedule::with('doctor')->find($id);

        if (!$schedule) {
            return response()->json([
                'message' => 'Horário não encontrado.'
            ], 404);
        }

        return response()->json($schedule, 200);
    }

    /**
     * Atualizar horário
     * PUT/PATCH /api/schedules/{id}
     */
    public function update(Request $request, $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'message' => 'Horário não encontrado.'
            ], 404);
        }

        try {
            $schedule->update($request->all());

            return response()->json([
                'message' => 'Horário atualizado com sucesso.',
                'schedule' => $schedule->load('doctor')
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar horário.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deletar horário
     * DELETE /api/schedules/{id}
     */
    public function destroy($id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'message' => 'Horário não encontrado.'
            ], 404);
        }

        try {
            $schedule->delete();

            return response()->json([
                'message' => 'Horário deletado com sucesso.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao deletar horário.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter slots de horário disponíveis
     * GET /api/schedules/{id}/slots?date=2025-01-15
     */
    public function getAvailableSlots($id, Request $request)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'message' => 'Horário não encontrado.'
            ], 404);
        }

        $date = $request->input('date', now()->toDateString());

        // Gerar todos os slots
        $allSlots = $schedule->getTimeSlots();

        // Filtrar slots disponíveis (não ocupados)
        $availableSlots = array_filter($allSlots, function($time) use ($schedule, $date) {
            return $schedule->isTimeSlotAvailable($date, $time);
        });

        return response()->json([
            'date' => $date,
            'day_of_week' => $schedule->day_of_week,
            'all_slots' => $allSlots,
            'available_slots' => array_values($availableSlots),
            'occupied_slots' => array_values(array_diff($allSlots, $availableSlots))
        ], 200);
    }
}