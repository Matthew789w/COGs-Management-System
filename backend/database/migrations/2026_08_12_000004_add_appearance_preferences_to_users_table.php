<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('theme_mode')->default('light')->after('avatar');
            $table->string('accent_preset')->default('indigo')->after('theme_mode');
            $table->string('accent_custom', 7)->nullable()->after('accent_preset');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['theme_mode', 'accent_preset', 'accent_custom']);
        });
    }
};
