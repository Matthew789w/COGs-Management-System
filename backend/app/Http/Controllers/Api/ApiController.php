<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller as BaseController;
use Illuminate\Http\JsonResponse;

abstract class ApiController extends BaseController
{
    protected function respondWithSuccess($data = null, string $message = null, int $status = 200): JsonResponse
    {
        $payload = ['success' => true];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json($payload, $status);
    }

    protected function respondCreated($data, string $message = null): JsonResponse
    {
        return $this->respondWithSuccess($data, $message, 201);
    }

    protected function respondWithError(string $message, int $status = 400, array $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
