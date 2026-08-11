<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductOverhead extends Model
{
    use HasFactory;

    public const CATEGORY_DEPRECIATION = 'depreciation';

    public const CATEGORY_RENT = 'rent';

    public const CATEGORY_MAINTENANCE = 'maintenance';

    public const CATEGORY_MACHINE_USAGE = 'machine_usage';

    public const CATEGORY_OTHER = 'other';

    public const ALLOCATION_FIXED_BATCH = 'fixed_batch';

    protected $table = 'product_overhead';

    protected $fillable = [
        'product_id',
        'name',
        'category',
        'allocation_method',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:4',
    ];

    public static function categories(): array
    {
        return [
            self::CATEGORY_DEPRECIATION,
            self::CATEGORY_RENT,
            self::CATEGORY_MAINTENANCE,
            self::CATEGORY_MACHINE_USAGE,
            self::CATEGORY_OTHER,
        ];
    }

    public static function allocationMethods(): array
    {
        return [
            self::ALLOCATION_FIXED_BATCH,
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
