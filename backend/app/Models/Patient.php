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
        return $this->hasMany(Appointment::class);
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
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