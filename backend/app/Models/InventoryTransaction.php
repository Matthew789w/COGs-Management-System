<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class InventoryTransaction extends Model
{
    public const TYPE_RECEIPT = 'receipt';

    public const TYPE_ADJUSTMENT = 'adjustment';

    public const TYPE_PRODUCTION_ISSUE = 'production_issue';

    public const TYPE_PRODUCTION_RECEIPT = 'production_receipt';

    protected $fillable = [
        'transaction_type',
        'material_id',
        'product_id',
        'unit_id',
        'quantity',
        'unit_cost',
        'reference_type',
        'reference_id',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost' => 'decimal:4',
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
