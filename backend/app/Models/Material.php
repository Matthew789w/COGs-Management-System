<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'unit_id',
        'cost_per_unit',
        'is_active',
    ];

    protected $casts = [
        'cost_per_unit' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasurement::class, 'unit_id');
    }

    public function productMaterials(): HasMany
    {
        return $this->hasMany(ProductMaterial::class);
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_materials')
            ->withPivot('unit_id', 'quantity')
            ->withTimestamps();
    }
}
