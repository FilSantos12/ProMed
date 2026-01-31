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
            if (!Schema::hasColumn('users', 'active_role')) {
                $table->string('active_role', 50)->nullable();
            }

            // Coluna para armazenar todos os roles que o usuário possui (JSON array)
            if (!Schema::hasColumn('users', 'roles')) {
                $table->json('roles')->nullable();
            }
        });

        // Popular dados existentes apenas se a coluna role existir
        if (Schema::hasColumn('users', 'role')) {
            DB::table('users')->whereNull('roles')->update([
                'active_role' => DB::raw('role'),
                'roles' => DB::raw('JSON_ARRAY(role)')
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'active_role')) {
                $table->dropColumn('active_role');
            }
            if (Schema::hasColumn('users', 'roles')) {
                $table->dropColumn('roles');
            }
        });
    }
};
