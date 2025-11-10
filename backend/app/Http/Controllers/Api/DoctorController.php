<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
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
        $doctor = Doctor::with(['user', 'specialty', 'schedules'])
            ->findOrFail($id);

        return response()->json($doctor);
    }

    /**
     * Atualizar dados do médico
     */
    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $request->validate([
            'bio' => 'nullable|string',
            'consultation_price' => 'nullable|numeric',
            'consultation_duration' => 'nullable|integer',
            'years_experience' => 'nullable|integer',
        ]);

        $doctor->update($request->only([
            'bio',
            'consultation_price',
            'consultation_duration',
            'years_experience',
        ]));

        return response()->json([
            'message' => 'Dados atualizados com sucesso!',
            'doctor' => $doctor->load('user', 'specialty'),
        ]);
    }

    /**
     * Listar agendamentos do médico
     */
    public function appointments(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $query = $doctor->appointments()
            ->with(['patient.user'])
            ->orderBy('appointment_date', 'desc');

        // Filtrar por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtrar por data
        if ($request->has('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        $appointments = $query->paginate(15);

        return response()->json($appointments);
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
