<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\StoreMaterialReceiptRequest;
use App\Http\Resources\InventoryBalanceResource;
use App\Http\Resources\InventoryTransactionResource;
use App\Models\InventoryTransaction;
use App\Models\Material;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends ApiController
{
    public function balances(InventoryService $inventoryService)
    {
        return $this->respondWithSuccess([
            'materials' => InventoryBalanceResource::collection(
                $inventoryService->listMaterialBalances()
            ),
            'products' => InventoryBalanceResource::collection(
                $inventoryService->listProductBalances()
            ),
        ]);
    }

    public function transactions(Request $request)
    {
        $query = InventoryTransaction::query()
            ->with(['material.unit', 'product.defaultUnit', 'unit'])
            ->orderByDesc('created_at');

        if ($request->filled('material_id')) {
            $query->where('material_id', $request->query('material_id'));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }

        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->query('transaction_type'));
        }

        if ($request->filled('reference_type') && $request->filled('reference_id')) {
            $query->where('reference_type', $request->query('reference_type'))
                ->where('reference_id', $request->query('reference_id'));
        }

        $limit = min((int) $request->query('limit', 50), 200);

        return $this->respondWithSuccess(
            InventoryTransactionResource::collection($query->limit($limit)->get())
        );
    }

    public function receiveMaterial(
        StoreMaterialReceiptRequest $request,
        InventoryService $inventoryService,
    ) {
        $validated = $request->validated();
        $material = Material::query()->findOrFail($validated['material_id']);

        $balance = $inventoryService->receiveMaterial(
            $material,
            (float) $validated['quantity'],
            isset($validated['unit_cost']) ? (float) $validated['unit_cost'] : null,
            $validated['notes'] ?? null,
        );

        return $this->respondCreated(
            new InventoryBalanceResource($balance->load(['material.unit', 'unit'])),
            'Material receipt recorded successfully.'
        );
    }
}
