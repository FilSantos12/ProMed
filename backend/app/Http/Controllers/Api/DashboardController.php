<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        try {
            // Estatísticas gerais
            $totalPatients = Patient::count();
            $totalDoctors = Doctor::count();
            
            // Médicos por status
            $doctorsPending = Doctor::where('status', 'pending')->count();
            $doctorsApproved = Doctor::where('status', 'approved')->count();
            $doctorsRejected = Doctor::where('status', 'rejected')->count();
            
            // Consultas de hoje
            $today = Carbon::today();
            $appointmentsToday = Appointment::whereDate('appointment_date', $today)->count();
            $appointmentsPending = Appointment::whereDate('appointment_date', $today)
                ->where('status', 'scheduled')
                ->count();
            
            // Consultas do mês
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();
            $appointmentsThisMonth = Appointment::whereBetween('appointment_date', [$startOfMonth, $endOfMonth])->count();
            
            // Consultas concluídas este mês
            $appointmentsCompleted = Appointment::whereBetween('appointment_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'completed')
                ->count();
            
            // Receita mensal (calculada com base nas consultas concluídas)
            $monthlyRevenue = DB::table('appointments')
                ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
                ->whereBetween('appointments.appointment_date', [$startOfMonth, $endOfMonth])
                ->where('appointments.status', 'completed')
                ->sum('doctors.consultation_price');
            
            // Últimos 7 dias - consultas por dia (para gráfico)
            $last7Days = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $count = Appointment::whereDate('appointment_date', $date)->count();
                $last7Days[] = [
                    'date' => $date->format('d/m'),
                    'count' => $count
                ];
            }
            
            // Consultas recentes de hoje
            $recentAppointments = Appointment::with(['patient', 'doctor', 'specialty'])
                ->whereDate('appointment_date', $today)
                ->orderBy('appointment_time', 'asc')
                ->limit(10)
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'time' => substr($appointment->appointment_time, 0, 5),
                        'patient' => $appointment->patient->name ?? 'N/A',
                        'doctor' => $appointment->doctor->name ?? 'N/A',
                        'specialty' => $appointment->specialty->name ?? 'N/A',
                        'status' => $appointment->status,
                    ];
                });
            
            // Médicos por especialidade (para gráfico)
            $doctorsBySpecialty = DB::table('doctors')
                ->join('specialties', 'doctors.specialty_id', '=', 'specialties.id')
                ->where('doctors.status', 'approved')
                ->select('specialties.name', DB::raw('count(*) as count'))
                ->groupBy('specialties.name')
                ->get();
            
            return response()->json([
                'stats' => [
                    'totalPatients' => $totalPatients,
                    'totalDoctors' => $totalDoctors,
                    'doctorsPending' => $doctorsPending,
                    'doctorsApproved' => $doctorsApproved,
                    'doctorsRejected' => $doctorsRejected,
                    'appointmentsToday' => $appointmentsToday,
                    'appointmentsPending' => $appointmentsPending,
                    'appointmentsThisMonth' => $appointmentsThisMonth,
                    'appointmentsCompleted' => $appointmentsCompleted,
                    'monthlyRevenue' => round($monthlyRevenue, 2),
                ],
                'charts' => [
                    'last7Days' => $last7Days,
                    'doctorsBySpecialty' => $doctorsBySpecialty,
                ],
                'recentAppointments' => $recentAppointments,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar estatísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
