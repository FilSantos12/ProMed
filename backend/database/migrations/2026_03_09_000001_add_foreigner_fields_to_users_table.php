<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_foreigner')) {
                $table->boolean('is_foreigner')->default(false)->after('rg');
            }
            if (!Schema::hasColumn('users', 'passport_number')) {
                $table->string('passport_number', 50)->nullable()->after('is_foreigner');
            }
            if (!Schema::hasColumn('users', 'passport_country')) {
                $table->string('passport_country', 100)->nullable()->after('passport_number');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_foreigner', 'passport_number', 'passport_country']);
        });
    }
};
