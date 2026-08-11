<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Utility extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'unit_id',
        'rate',
        'is_active',
    ];

    protected $casts = [
        'rate' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasurement::class, 'unit_id');
    }

    public function productUtilities(): HasMany
    {
        return $this->hasMany(ProductUtility::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_utilities')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
