<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_type', 64);
            $table->foreignId('material_id')->nullable()->constrained()->onDelete('restrict');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('restrict');
            $table->foreignId('unit_id')->constrained('units_of_measurement')->onDelete('restrict');
            $table->decimal('quantity', 12, 4);
            $table->decimal('unit_cost', 12, 4)->nullable();
            $table->string('reference_type', 64)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['reference_type', 'reference_id']);
            $table->index(['material_id', 'created_at']);
            $table->index(['product_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
