<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_labor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade')->onUpdate('cascade');
            $table->string('role', 191);
            $table->decimal('workers', 12, 4);
            $table->decimal('hours', 12, 4);
            $table->decimal('hourly_rate', 12, 4);
            $table->timestamps();

            $table->unique(['product_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_labor');
    }
};
