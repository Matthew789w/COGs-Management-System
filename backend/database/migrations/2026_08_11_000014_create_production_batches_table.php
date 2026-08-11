<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number', 64)->unique();
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->decimal('production_quantity', 12, 4);
            $table->date('production_date');
            $table->string('status', 32)->default('draft');
            $table->timestamp('confirmed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'status']);
            $table->index('production_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_batches');
    }
};
