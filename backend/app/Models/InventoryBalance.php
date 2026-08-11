<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryBalance extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'material_id',
        'product_id',
        'unit_id',
        'quantity_on_hand',
    ];

    protected $casts = [
        'quantity_on_hand' => 'decimal:4',
    ];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasurement::class, 'unit_id');
    }
}
