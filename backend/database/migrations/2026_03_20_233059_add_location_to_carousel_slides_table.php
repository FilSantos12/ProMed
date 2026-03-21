<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carousel_slides', function (Blueprint $table) {
            // 'home' = só na home, 'sobre' = só na página Sobre, 'all' = ambas
            $table->enum('location', ['home', 'sobre', 'all'])->default('home')->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('carousel_slides', function (Blueprint $table) {
            $table->dropColumn('location');
        });
    }
};
