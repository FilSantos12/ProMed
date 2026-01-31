<?php

namespace Database\Seeders;

use App\Models\Specialty;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialties = [
            ['name' => 'Cardiologia', 'description' => 'Especialidade médica que cuida do coração e sistema cardiovascular', 'icon' => 'heart', 'is_active' => true],
            ['name' => 'Dermatologia', 'description' => 'Especialidade médica que cuida da pele, cabelos e unhas', 'icon' => 'user', 'is_active' => true],
            ['name' => 'Ortopedia', 'description' => 'Especialidade médica que cuida dos ossos, músculos e articulações', 'icon' => 'bone', 'is_active' => true],
            ['name' => 'Pediatria', 'description' => 'Especialidade médica que cuida da saúde de crianças e adolescentes', 'icon' => 'baby', 'is_active' => true],
            ['name' => 'Ginecologia', 'description' => 'Especialidade médica que cuida da saúde da mulher', 'icon' => 'female', 'is_active' => true],
            ['name' => 'Oftalmologia', 'description' => 'Especialidade médica que cuida dos olhos e visão', 'icon' => 'eye', 'is_active' => true],
            ['name' => 'Neurologia', 'description' => 'Especialidade médica que cuida do sistema nervoso', 'icon' => 'brain', 'is_active' => true],
            ['name' => 'Psiquiatria', 'description' => 'Especialidade médica que cuida da saúde mental', 'icon' => 'mind', 'is_active' => true],
            ['name' => 'Clínico Geral', 'description' => 'Médico generalista para atendimento inicial e acompanhamento', 'icon' => 'stethoscope', 'is_active' => true],
            ['name' => 'Endocrinologia', 'description' => 'Especialidade médica que cuida do sistema hormonal', 'icon' => 'activity', 'is_active' => true],
        ];

        foreach ($specialties as $specialty) {
            Specialty::firstOrCreate(
                ['name' => $specialty['name']],
                $specialty
            );
        }
    }
}
