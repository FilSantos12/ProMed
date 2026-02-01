<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar especialidades
        $this->call(SpecialtySeeder::class);

        // Criar usuário admin (se não existir)
        if (!User::where('email', 'admin@promed.com')->exists()) {
            User::create([
                'name' => 'Admin ProMed',
                'email' => 'admin@promed.com',
                'password' => bcrypt('admin123'),
                'is_active' => true,
                'active_role' => 'admin',
                'roles' => ['admin'],
            ]);
        }
    }
}
