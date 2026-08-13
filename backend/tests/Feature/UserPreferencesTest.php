<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPreferencesTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_user_preferences(): void
    {
        $user = User::factory()->create([
            'theme_mode' => 'dark',
            'accent_preset' => 'emerald',
        ]);
        $this->actingAs($user);

        $this->getJson('/api/user/preferences')
            ->assertOk()
            ->assertJsonPath('data.theme_mode', 'dark')
            ->assertJsonPath('data.accent_preset', 'emerald');
    }

    public function test_it_updates_user_preferences(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->putJson('/api/user/preferences', [
            'theme_mode' => 'dark',
            'accent_preset' => 'custom',
            'accent_custom' => '#ff5500',
            'accent_style' => 'solid',
        ])
            ->assertOk()
            ->assertJsonPath('data.theme_mode', 'dark')
            ->assertJsonPath('data.accent_preset', 'custom')
            ->assertJsonPath('data.accent_custom', '#ff5500')
            ->assertJsonPath('data.accent_style', 'solid');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'theme_mode' => 'dark',
            'accent_preset' => 'custom',
            'accent_custom' => '#ff5500',
            'accent_style' => 'solid',
        ]);
    }

    public function test_it_includes_preferences_in_auth_me_response(): void
    {
        $user = User::factory()->create([
            'theme_mode' => 'dark',
            'accent_preset' => 'rose',
        ]);
        $this->actingAs($user);

        $this->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.preferences.theme_mode', 'dark')
            ->assertJsonPath('data.preferences.accent_preset', 'rose');
    }

    public function test_it_resets_user_preferences(): void
    {
        $user = User::factory()->create([
            'theme_mode' => 'dark',
            'accent_preset' => 'custom',
            'accent_custom' => '#123456',
        ]);
        $this->actingAs($user);

        $this->postJson('/api/user/preferences/reset')
            ->assertOk()
            ->assertJsonPath('data.theme_mode', 'light')
            ->assertJsonPath('data.accent_preset', 'indigo')
            ->assertJsonPath('data.accent_custom', null)
            ->assertJsonPath('data.accent_style', 'gradient');
    }
}
