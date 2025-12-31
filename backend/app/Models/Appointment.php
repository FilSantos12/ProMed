<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'specialty_id',
        'appointment_date',
        'appointment_time',
        'status',
        'patient_notes',
        'doctor_notes',
        'cancellation_reason',
        'confirmed_at',
        'cancelled_at',
        'completed_at',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Relacionamento: Appointment pertence a um Patient
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Relacionamento: Appointment pertence a um Doctor
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id');
    }

    /**
     * Relacionamento: Appointment pertence a uma Specialty
     */
    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }

    /**
     * Scope: Consultas pendentes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Consultas confirmadas
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope: Consultas futuras
     */
    public function scopeUpcoming($query)
    {
        return $query->where('appointment_date', '>=', now()->toDateString())
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time');
    }

    /**
     * Scope: Consultas passadas
     */
    public function scopePast($query)
    {
        return $query->where('appointment_date', '<', now()->toDateString())
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc');
    }

    /**
     * Scope: Consultas de hoje
     */
    public function scopeToday($query)
    {
        return $query->where('appointment_date', now()->toDateString())
            ->orderBy('appointment_time');
    }

    /**
     * Confirmar consulta
     */
    public function confirm()
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    /**
     * Cancelar consulta
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Marcar como realizada
     */
    public function complete()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Verificar se pode ser cancelada
     */
    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'confirmed']) &&
               $this->appointment_date >= now()->toDateString();
    }

    /**
     * Verificar se pode ser reagendada
     */
    public function canBeRescheduled()
    {
        return $this->canBeCancelled();
    }

    /**
     * Formatar data e hora para exibição
     */
    public function getFormattedDateTimeAttribute()
    {
        return $this->appointment_date->format('d/m/Y') . ' às ' . 
               substr($this->appointment_time, 0, 5);
    }
}