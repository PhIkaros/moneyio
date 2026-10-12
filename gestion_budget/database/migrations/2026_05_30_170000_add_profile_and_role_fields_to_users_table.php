<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('password');
            $table->string('locale', 5)->default('en')->after('avatar');
            $table->string('theme', 30)->default('theme-default')->after('locale');
            $table->string('role', 10)->default('user')->after('theme');
            $table->boolean('is_active')->default(true)->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'locale', 'theme', 'role', 'is_active']);
        });
    }
};
