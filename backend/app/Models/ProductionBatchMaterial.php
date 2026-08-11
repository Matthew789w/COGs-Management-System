<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionBatchMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_batch_id',
        'material_id',
        'unit_id',
        'bom_quantity_per_unit',
        'required_quantity',
        'issued_quantity',
        'unit_cost_snapshot',
    ];

    protected $casts = [
        'bom_quantity_per_unit' => 'decimal:4',
        'required_quantity' => 'decimal:4',
        'issued_quantity' => 'decimal:4',
        'unit_cost_snapshot' => 'decimal:4',
    ];

    public function productionBatch(): BelongsTo
    {
        return $this->belongsTo(ProductionBatch::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasurement::class, 'unit_id');
    }
}
