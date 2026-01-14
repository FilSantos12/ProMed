<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'doctor_id',
        'symptoms',
        'diagnosis',
        'treatment',
        'prescription',
        'observations',
        'attachments',
    ];

    protected $casts = [
        'attachments' => 'array',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient()
    {
        // patient_id aponta para users.id, não para patients.id
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor()
    {
        // doctor_id aponta para doctors.user_id através de users.id
        // Retorna o registro Doctor (tabela doctors)
        return $this->belongsTo(Doctor::class, 'doctor_id', 'user_id');
    }

    public function doctorUser()
    {
        // Relacionamento direto com o User do médico
        return $this->belongsTo(User::class, 'doctor_id');
    }
}