<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\EncryptsAttributes;

class Patient extends Model
{
    use HasFactory, EncryptsAttributes;

    protected $fillable = [
        'user_id',
        'emergency_contact',
        'emergency_phone',
        'blood_type',
        'allergies',
        'chronic_diseases',
        'medications',
        'health_insurance',
        'insurance_number',
    ];

    /**
     * Atributos que devem ser criptografados (LGPD)
     */
    protected array $encryptable = [
        'health_insurance',
        'insurance_number',
        'emergency_contact',
        'emergency_phone',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        // patient_id na tabela appointments aponta para users.id, não para patients.id
        // Por isso usamos user_id como local key
        return $this->hasMany(Appointment::class, 'patient_id', 'user_id');
    }

    public function medicalRecords()
    {
        // patient_id na tabela medical_records aponta para users.id, não para patients.id
        // Por isso usamos user_id como local key
        return $this->hasMany(MedicalRecord::class, 'patient_id', 'user_id');
    }

    public function getFullNameAttribute()
    {
        return $this->user->name;
    }

    public function scopeWithInsurance($query)
    {
        return $query->whereNotNull('health_insurance');
    }
}