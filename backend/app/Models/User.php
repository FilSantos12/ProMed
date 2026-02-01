<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\EncryptsAttributes;

/**
 * @property-read Doctor|null $doctor
 * @property-read Patient|null $patient
 */
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
        'cep',
        'address',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'role',
        'active_role',
        'roles',
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
        'roles' => 'array',
    ];

    /**
     * Atributos que devem ser adicionados ao array/JSON
     */
    protected $appends = ['avatar_url'];

    /**
     * Accessor para URL completa do avatar
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            // Se o avatar já é uma URL completa, garantir HTTPS
            if (str_starts_with($this->avatar, 'http')) {
                return str_replace('http://', 'https://', $this->avatar);
            }
            // Construir a URL do storage e garantir HTTPS em produção
            $url = url('storage/' . $this->avatar);
            if (app()->environment('production')) {
                $url = str_replace('http://', 'https://', $url);
            }
            return $url;
        }
        return null;
    }

    /**
     * Boot method para inicializar campos multi-role
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            // Inicializar active_role e roles se não estiverem definidos
            if (empty($user->active_role)) {
                $user->active_role = $user->role;
            }
            if (empty($user->roles)) {
                $user->roles = [$user->role];
            }
        });
    }

    /**
     * Atributos que devem ser criptografados (LGPD)
     */
    protected array $encryptable = [
        'cpf',
        'phone',
        'rg',
    ];

    // Relacionamentos
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne<Doctor>
     */
    public function doctor()
    {
        return $this->hasOne(Doctor::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'doctor_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function appointmentsAsPatient()
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
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
        return $this->active_role === 'doctor' || $this->role === 'doctor';
    }

    public function isPatient()
    {
        return $this->active_role === 'patient' || $this->role === 'patient';
    }

    public function isAdmin()
    {
        return $this->active_role === 'admin' || $this->role === 'admin';
    }

    /**
     * Verificar se o usuário tem um role específico
     */
    public function hasRole($role)
    {
        $roles = $this->roles ?? [];
        return in_array($role, $roles);
    }

    /**
     * Verificar se o usuário tem pelo menos um dos roles especificados
     */
    public function hasAnyRole($roles)
    {
        $userRoles = $this->roles ?? [];
        return !empty(array_intersect($roles, $userRoles));
    }

    /**
     * Trocar o perfil ativo do usuário
     */
    public function switchRole($newRole)
    {
        if (!$this->hasRole($newRole)) {
            throw new \Exception("Usuário não possui o role: {$newRole}");
        }

        $this->update(['active_role' => $newRole]);
        return $this;
    }

    /**
     * Obter o role ativo atual (fallback para role se active_role for null)
     */
    public function getActiveRoleAttribute($value)
    {
        return $value ?? $this->attributes['role'] ?? null;
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