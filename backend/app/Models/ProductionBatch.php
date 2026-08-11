<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionBatch extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'batch_number',
        'product_id',
        'production_quantity',
        'production_date',
        'status',
        'confirmed_at',
        'notes',
    ];

    protected $casts = [
        'production_quantity' => 'decimal:4',
        'production_date' => 'date',
        'confirmed_at' => 'datetime',
    ];

    public static function statuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_CONFIRMED,
            self::STATUS_CANCELLED,
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function batchMaterials(): HasMany
    {
        return $this->hasMany(ProductionBatchMaterial::class);
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }
}
