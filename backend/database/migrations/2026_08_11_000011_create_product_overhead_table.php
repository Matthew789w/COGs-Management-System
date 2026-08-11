<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_overhead', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade')->onUpdate('cascade');
            $table->string('name', 191);
            $table->string('category', 64);
            $table->string('allocation_method', 64)->default('fixed_batch');
            $table->decimal('amount', 12, 4);
            $table->timestamps();

            $table->unique(['product_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_overhead');
    }
};
