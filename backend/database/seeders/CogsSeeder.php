<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Product;
use App\Models\ProductMaterial;
use App\Models\ProductUtility;
use App\Models\UnitOfMeasurement;
use App\Models\Utility;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CogsSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $kg = UnitOfMeasurement::create([
            'code' => 'KG',
            'name' => 'Kilogram',
            'symbol' => 'kg',
            'category' => 'Weight',
            'is_active' => true,
        ]);

        $g = UnitOfMeasurement::create([
            'code' => 'G',
            'name' => 'Gram',
            'symbol' => 'g',
            'category' => 'Weight',
            'is_active' => true,
        ]);

        $pcs = UnitOfMeasurement::create([
            'code' => 'PCS',
            'name' => 'Pieces',
            'symbol' => 'pcs',
            'category' => 'Quantity',
            'is_active' => true,
        ]);

        $l = UnitOfMeasurement::create([
            'code' => 'L',
            'name' => 'Liter',
            'symbol' => 'L',
            'category' => 'Volume',
            'is_active' => true,
        ]);

        $kwh = UnitOfMeasurement::create([
            'code' => 'KWH',
            'name' => 'Kilowatt Hour',
            'symbol' => 'kWh',
            'category' => 'Energy',
            'is_active' => true,
        ]);

        $flour = Material::create([
            'sku' => 'MAT-FLOUR',
            'name' => 'Flour',
            'unit_id' => $kg->id,
            'cost_per_unit' => 50.0000,
            'is_active' => true,
        ]);

        $sugar = Material::create([
            'sku' => 'MAT-SUGAR',
            'name' => 'Sugar',
            'unit_id' => $kg->id,
            'cost_per_unit' => 60.0000,
            'is_active' => true,
        ]);

        $eggs = Material::create([
            'sku' => 'MAT-EGGS',
            'name' => 'Eggs',
            'unit_id' => $pcs->id,
            'cost_per_unit' => 8.0000,
            'is_active' => true,
        ]);

        $cocoa = Material::create([
            'sku' => 'MAT-COCOA',
            'name' => 'Cocoa',
            'unit_id' => $kg->id,
            'cost_per_unit' => 450.0000,
            'is_active' => true,
        ]);

        $cakeBox = Material::create([
            'sku' => 'MAT-CAKEBOX',
            'name' => 'Cake Box',
            'unit_id' => $pcs->id,
            'cost_per_unit' => 20.0000,
            'is_active' => true,
        ]);

        $electricity = Utility::create([
            'code' => 'ELEC',
            'name' => 'Electricity',
            'unit_id' => $kwh->id,
            'rate' => 12.0000,
            'is_active' => true,
        ]);

        $water = Utility::create([
            'code' => 'WATER',
            'name' => 'Water',
            'unit_id' => $l->id,
            'rate' => 1.5000,
            'is_active' => true,
        ]);

        $chocolateCake = Product::create([
            'sku' => 'PROD-CAKE-001',
            'name' => 'Chocolate Cake',
            'description' => 'Chocolate cake finished product',
            'default_unit_id' => $pcs->id,
            'list_price' => 150.0000,
            'is_active' => true,
        ]);

        ProductMaterial::create([
            'product_id' => $chocolateCake->id,
            'material_id' => $flour->id,
            'unit_id' => $kg->id,
            'quantity' => 0.25,
        ]);

        ProductMaterial::create([
            'product_id' => $chocolateCake->id,
            'material_id' => $sugar->id,
            'unit_id' => $kg->id,
            'quantity' => 0.10,
        ]);

        ProductMaterial::create([
            'product_id' => $chocolateCake->id,
            'material_id' => $eggs->id,
            'unit_id' => $pcs->id,
            'quantity' => 3.00,
        ]);

        ProductMaterial::create([
            'product_id' => $chocolateCake->id,
            'material_id' => $cocoa->id,
            'unit_id' => $kg->id,
            'quantity' => 0.05,
        ]);

        ProductMaterial::create([
            'product_id' => $chocolateCake->id,
            'material_id' => $cakeBox->id,
            'unit_id' => $pcs->id,
            'quantity' => 1.00,
        ]);

        ProductUtility::create([
            'product_id' => $chocolateCake->id,
            'utility_id' => $electricity->id,
            'unit_id' => $kwh->id,
            'quantity' => 0.50,
        ]);

        ProductUtility::create([
            'product_id' => $chocolateCake->id,
            'utility_id' => $water->id,
            'unit_id' => $l->id,
            'quantity' => 0.20,
        ]);
    }
}
