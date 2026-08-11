<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_materials', function (Blueprint $table) {
            if (! Schema::hasColumn('product_materials', 'position')) {
                $table->integer('position')->default(0)->after('quantity');
            }
        });
    }

    public function down(): void
    {
        Schema::table('product_materials', function (Blueprint $table) {
            if (Schema::hasColumn('product_materials', 'position')) {
                $table->dropColumn('position');
            }
        });
    }
};
