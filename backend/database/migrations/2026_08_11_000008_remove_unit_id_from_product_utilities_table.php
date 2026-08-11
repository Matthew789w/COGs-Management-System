<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_utilities', function (Blueprint $table) {
            if (Schema::hasColumn('product_utilities', 'unit_id')) {
                $table->dropForeign(['unit_id']);
                $table->dropColumn('unit_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_utilities', function (Blueprint $table) {
            if (! Schema::hasColumn('product_utilities', 'unit_id')) {
                $table->foreignId('unit_id')
                    ->after('utility_id')
                    ->constrained('units_of_measurement')
                    ->onDelete('restrict')
                    ->onUpdate('cascade');
            }
        });
    }
};
