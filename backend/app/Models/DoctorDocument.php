<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

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
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
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

    /**
 * Visualizar documento com token na URL (para tags img)
 */
    public function viewDocumentPublic($doctorId, $documentId, $token)
    {
        try {
            // Validar token
            $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
            
            if (!$user || $user->role !== 'admin') {
                return response()->json(['message' => 'Não autorizado'], 401);
            }

            $document = DoctorDocument::where('doctor_id', $doctorId)
                ->where('id', $documentId)
                ->firstOrFail();

            $filePath = storage_path('app/public/' . $document->file_path);

            if (!file_exists($filePath)) {
                return response()->json(['message' => 'Arquivo não encontrado'], 404);
            }

            return response()->file($filePath, [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'inline'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro ao visualizar documento público: ' . $e->getMessage());
            return response()->json(['message' => 'Erro ao carregar documento'], 500);
        }
    }
}