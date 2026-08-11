<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units_of_measurement')->onDelete('restrict');
            $table->decimal('quantity_on_hand', 12, 4)->default(0);
            $table->timestamps();

            $table->unique('material_id');
            $table->unique('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_balances');
    }
};
