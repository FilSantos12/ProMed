<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'day_of_week',
        'schedule_date',
        'start_time',
        'end_time',
        'slot_duration',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'slot_duration' => 'integer',
        'schedule_date' => 'date',
    ];

    /**
     * Relacionamento: Schedule pertence a um Doctor (User)
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Gerar slots de horário disponíveis
     */
    public function getTimeSlots()
    {
        $slots = [];
        $start = \Carbon\Carbon::parse($this->start_time);
        $end = \Carbon\Carbon::parse($this->end_time);

        while ($start->lt($end)) {
            $slots[] = $start->format('H:i');
            $start->addMinutes($this->slot_duration);
        }

        return $slots;
    }

    /**
     * Verificar se um horário específico está disponível
     */
    public function isTimeSlotAvailable($date, $time)
    {
        // Verificar se já existe consulta agendada neste horário
        return !Appointment::where('doctor_id', $this->doctor_id)
            ->where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();
    }
}