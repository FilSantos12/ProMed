<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'doctor_id',
        'document_type',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'verified_at',
        'verified_by',
        'notes',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'verified_at' => 'datetime',
    ];

    /**
     * Relacionamento com Doctor
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Relacionamento com o admin que verificou
     */
    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Obter URL pública do arquivo
     */
    public function getUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Verificar se o documento foi aprovado
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Verificar se o documento está pendente
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }
}