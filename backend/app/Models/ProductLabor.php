<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductLabor extends Model
{
    use HasFactory;

    protected $table = 'product_labor';

    protected $fillable = [
        'product_id',
        'role',
        'workers',
        'hours',
        'hourly_rate',
    ];

    protected $casts = [
        'workers' => 'decimal:4',
        'hours' => 'decimal:4',
        'hourly_rate' => 'decimal:4',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
