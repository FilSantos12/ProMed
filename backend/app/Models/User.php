<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\EncryptsAttributes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, EncryptsAttributes;

    protected $fillable = [
        'name',
        'email',
        'confirm_email',
        'password',
        'cpf',
        'rg',
        'phone',
        'birth_date',
        'gender',
        'role',
        'avatar',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birth_date' => 'date',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    /**
     * Atributos que devem ser criptografados (LGPD)
     */
    protected array $encryptable = [
        'cpf',
        'phone',
        'rg',
    ];

    // Relacionamentos
    public function doctor()
    {
        return $this->hasOne(Doctor::class);
    }

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'doctor_id');
    }

    public function appointmentsAsPatient()
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    public function appointmentsAsDoctor()
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    // Helpers
    public function isDoctor()
    {
        return $this->role === 'doctor';
    }

    public function isPatient()
    {
        return $this->role === 'patient';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
 * Pegar próximas consultas (para qualquer role)
 */
    public function getUpcomingAppointments()
    {
        if ($this->isPatient()) {
            return $this->appointmentsAsPatient()
                ->upcoming()
                ->with(['doctor', 'specialty'])
                ->get();
        }

        if ($this->isDoctor()) {
            return $this->appointmentsAsDoctor()
                ->upcoming()
                ->with(['patient', 'specialty'])
                ->get();
        }

        return collect([]);
    }
}