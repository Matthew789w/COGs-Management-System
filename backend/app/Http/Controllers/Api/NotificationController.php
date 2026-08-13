<?php

namespace App\Http\Controllers\Api;

use App\Services\Notifications\NotificationService;
use Illuminate\Http\JsonResponse;

class NotificationController extends ApiController
{
    public function index(NotificationService $notificationService): JsonResponse
    {
        return $this->respondWithSuccess($notificationService->list());
    }
}
