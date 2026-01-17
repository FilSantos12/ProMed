<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\EncryptsAttributes;

class Doctor extends Model
{
    use HasFactory, EncryptsAttributes;

    protected $fillable = [
        'user_id',
        'specialty_id',
        'crm',
        'crm_state',
        'bio',
        'consultation_price',
        'consultation_duration',
        'formation',
        'years_experience',
        'status',
        'rejection_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'formation' => 'array',
        'consultation_price' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Atributos que devem ser criptografados (LGPD)
     * CRM removido pois é um dado público
     */
    protected array $encryptable = [
        // 'crm', // CRM é público, não precisa criptografar
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function specialty()
    {
        return $this->belongsTo(Specialty::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'doctor_id', 'user_id');
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class);
    }

    /**
     * Admin que aprovou/rejeitou a solicitação
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getFullNameAttribute()
    {
        return "Dr(a). {$this->user->name}";
    }

    public function scopeWithSpecialty($query, $specialtyId)
    {
        return $query->where('specialty_id', $specialtyId);
    }

    public function scopeAvailable($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->where('is_active', true);
        });
    }

        /**
     * Relacionamento com documentos
     */
    public function documents()
    {
        return $this->hasMany(DoctorDocument::class);
    }

    /**
     * Verificar se tem todos os documentos obrigatórios
     */
    public function hasRequiredDocuments()
    {
        $required = ['diploma', 'crm_document', 'photo'];
        
        foreach ($required as $type) {
            if (!$this->documents()->where('document_type', $type)->exists()) {
                return false;
            }
        }
        
        return true;
    }
}