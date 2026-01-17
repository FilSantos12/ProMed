<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Coluna para armazenar o role ativo no momento
            $table->string('active_role', 50)->nullable()->after('role');

            // Coluna para armazenar todos os roles que o usuário possui (JSON array)
            $table->json('roles')->nullable()->after('active_role');
        });

        // Popular dados existentes
        // Para cada usuário, definir active_role = role e roles = [role]
        DB::table('users')->whereNull('roles')->update([
            'active_role' => DB::raw('role'),
            'roles' => DB::raw('JSON_ARRAY(role)')
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['active_role', 'roles']);
        });
    }
};
