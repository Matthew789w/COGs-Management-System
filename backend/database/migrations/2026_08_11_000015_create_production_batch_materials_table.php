<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_batch_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_batch_id')->constrained()->onDelete('cascade');
            $table->foreignId('material_id')->constrained()->onDelete('restrict');
            $table->foreignId('unit_id')->constrained('units_of_measurement')->onDelete('restrict');
            $table->decimal('bom_quantity_per_unit', 12, 4);
            $table->decimal('required_quantity', 12, 4);
            $table->decimal('issued_quantity', 12, 4)->default(0);
            $table->decimal('unit_cost_snapshot', 12, 4)->nullable();
            $table->timestamps();

            $table->unique(['production_batch_id', 'material_id'], 'pbm_batch_material_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_batch_materials');
    }
};
