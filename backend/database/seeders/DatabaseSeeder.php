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

        // Criar ou atualizar usuário admin
        $admin = User::firstOrNew(['email' => 'admin@promed.com']);
        $admin->name = 'Admin ProMed';
        $admin->password = bcrypt('admin123');
        $admin->is_active = true;
        $admin->active_role = 'admin';
        $admin->roles = ['admin'];
        $admin->save();
    }
}
