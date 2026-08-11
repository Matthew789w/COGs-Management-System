<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'default_unit_id',
        'list_price',
        'production_quantity',
        'is_active',
    ];

    protected $casts = [
        'list_price' => 'decimal:4',
        'production_quantity' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function defaultUnit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasurement::class, 'default_unit_id');
    }

    public function productMaterials(): HasMany
    {
        return $this->hasMany(ProductMaterial::class);
    }

    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'product_materials')
            ->withPivot('unit_id', 'quantity')
            ->withTimestamps();
    }

    public function productUtilities(): HasMany
    {
        return $this->hasMany(ProductUtility::class);
    }

    public function utilities(): BelongsToMany
    {
        return $this->belongsToMany(Utility::class, 'product_utilities')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function productLabor(): HasMany
    {
        return $this->hasMany(ProductLabor::class);
    }

    public function productOverhead(): HasMany
    {
        return $this->hasMany(ProductOverhead::class);
    }

    public function productionBatches(): HasMany
    {
        return $this->hasMany(ProductionBatch::class);
    }
}
