<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_logs_in_with_valid_credentials(): void
    {
        User::factory()->create([
            'username' => 'plantmanager',
            'password' => Hash::make('password'),
        ]);

        $response = $this->withStatefulHeaders()->postJson('/api/auth/login', [
            'username' => 'plantmanager',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.username', 'plantmanager');

        $this->assertAuthenticated();
    }

    public function test_it_rejects_invalid_credentials_and_tracks_attempts(): void
    {
        User::factory()->create([
            'username' => 'plantmanager',
            'password' => Hash::make('password'),
        ]);

        for ($attempt = 1; $attempt <= 4; $attempt++) {
            $response = $this->withStatefulHeaders()->postJson('/api/auth/login', [
                'username' => 'plantmanager',
                'password' => 'wrong-password',
            ]);

            $response->assertStatus(422)
                ->assertJsonPath('errors.remaining_attempts', 5 - $attempt);
        }

        $this->withStatefulHeaders()->postJson('/api/auth/login', [
            'username' => 'plantmanager',
            'password' => 'wrong-password',
        ])->assertStatus(423);
    }

    public function test_it_locks_login_after_five_failed_attempts(): void
    {
        User::factory()->create([
            'username' => 'plantmanager',
            'password' => Hash::make('password'),
        ]);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->withStatefulHeaders()->postJson('/api/auth/login', [
                'username' => 'plantmanager',
                'password' => 'wrong-password',
            ]);
        }

        $lockedResponse = $this->withStatefulHeaders()->postJson('/api/auth/login', [
            'username' => 'plantmanager',
            'password' => 'password',
        ]);

        $lockedResponse->assertStatus(423)
            ->assertJsonPath('errors.locked', true);

        $this->assertGuest();
    }

    public function test_protected_routes_require_authentication(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $this->authenticate();

        $this->getJson('/api/dashboard')->assertOk();
    }

    public function test_user_can_logout(): void
    {
        User::factory()->create([
            'username' => 'plantmanager',
            'password' => Hash::make('password'),
        ]);

        $this->withStatefulHeaders()->postJson('/api/auth/login', [
            'username' => 'plantmanager',
            'password' => 'password',
        ])->assertOk();

        $this->withStatefulHeaders()->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Signed out successfully.');
    }
}
