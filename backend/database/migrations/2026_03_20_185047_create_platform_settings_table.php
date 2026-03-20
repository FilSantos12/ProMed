<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->decimal('value', 5, 2)->default(0);
            $table->string('label');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        DB::table('platform_settings')->insert([
            'key'         => 'service_fee_percentage',
            'value'       => 0.00,
            'label'       => 'Taxa de Serviço da Plataforma',
            'description' => 'Percentual adicionado sobre o valor da consulta do médico.',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
