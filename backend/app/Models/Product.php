<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'is_active',
    ];

    protected $casts = [
        'list_price' => 'decimal:4',
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
            ->withPivot('unit_id', 'quantity')
            ->withTimestamps();
    }
}
