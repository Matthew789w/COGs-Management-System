<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitOfMeasurement extends Model
{
    use HasFactory;

    protected $table = 'units_of_measurement';

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'default_unit_id');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class);
    }

    public function utilities(): HasMany
    {
        return $this->hasMany(Utility::class);
    }

    public function productMaterials(): HasMany
    {
        return $this->hasMany(ProductMaterial::class);
    }
}
