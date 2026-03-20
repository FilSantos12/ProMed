<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    protected $fillable = ['key', 'value', 'label', 'description'];

    protected $casts = [
        'value' => 'decimal:2',
    ];
}
