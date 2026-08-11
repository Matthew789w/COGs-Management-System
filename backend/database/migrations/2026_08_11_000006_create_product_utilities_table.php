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
        Schema::create('product_utilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict')->onUpdate('cascade');
            $table->foreignId('utility_id')->constrained('utilities')->onDelete('restrict')->onUpdate('cascade');
            $table->foreignId('unit_id')->constrained('units_of_measurement')->onDelete('restrict')->onUpdate('cascade');
            $table->decimal('quantity', 12, 4);
            $table->timestamps();

            $table->unique(['product_id', 'utility_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_utilities');
    }
};
