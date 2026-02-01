<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('specialties', function (Blueprint $table) {
            if (!Schema::hasColumn('specialties', 'name')) {
                $table->string('name');
            }
            if (!Schema::hasColumn('specialties', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('specialties', 'icon')) {
                $table->string('icon')->nullable();
            }
            if (!Schema::hasColumn('specialties', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('specialties', function (Blueprint $table) {
            $table->dropColumn(['name', 'description', 'icon', 'is_active']);
        });
    }
};
