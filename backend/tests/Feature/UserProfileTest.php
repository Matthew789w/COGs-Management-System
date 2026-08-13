<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\UserAvatars;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_profile_with_avatar_options(): void
    {
        $user = User::factory()->create([
            'name' => 'Plant Manager',
            'username' => 'plantmanager',
            'role' => 'Administrator',
            'avatar' => 'indigo',
        ]);
        $this->actingAs($user);

        $response = $this->getJson('/api/user/profile');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.profile.name', 'Plant Manager')
            ->assertJsonPath('data.profile.username', 'plantmanager')
            ->assertJsonPath('data.profile.avatar', 'indigo')
            ->assertJsonPath('data.profile.initials', 'PM')
            ->assertJsonStructure([
                'data' => [
                    'profile' => [
                        'id',
                        'name',
                        'username',
                        'email',
                        'role',
                        'avatar',
                        'profile_photo_url',
                        'has_profile_photo',
                        'initials',
                    ],
                    'avatars' => [['id', 'label']],
                ],
            ]);
    }

    public function test_it_updates_profile_fields(): void
    {
        $user = User::factory()->create([
            'name' => 'Plant Manager',
            'username' => 'plantmanager',
            'avatar' => 'indigo',
        ]);
        $this->actingAs($user);

        $response = $this->putJson('/api/user/profile', [
            'name' => 'Production Lead',
            'username' => 'prodlead',
            'email' => 'lead@cogs.local',
            'role' => 'Supervisor',
            'avatar' => 'emerald',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Production Lead')
            ->assertJsonPath('data.username', 'prodlead')
            ->assertJsonPath('data.avatar', 'emerald')
            ->assertJsonPath('data.initials', 'PL');

        $this->assertDatabaseHas('users', [
            'username' => 'prodlead',
            'avatar' => 'emerald',
            'role' => 'Supervisor',
        ]);
    }

    public function test_it_rejects_invalid_avatar(): void
    {
        $user = User::factory()->create([
            'username' => 'plantmanager',
            'avatar' => 'indigo',
        ]);
        $this->actingAs($user);

        $response = $this->putJson('/api/user/profile', [
            'name' => 'Plant Manager',
            'username' => 'plantmanager',
            'email' => 'admin@cogs.local',
            'role' => 'Administrator',
            'avatar' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['avatar']);
    }

    public function test_it_updates_password_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'username' => 'plantmanager',
            'password' => Hash::make('old-password'),
        ]);
        $this->actingAs($user);

        $response = $this->putJson('/api/user/password', [
            'current_password' => 'old-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Password updated successfully.');

        $user = User::query()->first();
        $this->assertTrue(Hash::check('new-password-123', $user->password));
    }

    public function test_it_rejects_password_update_with_wrong_current_password(): void
    {
        $user = User::factory()->create([
            'username' => 'plantmanager',
            'password' => Hash::make('old-password'),
        ]);
        $this->actingAs($user);

        $response = $this->putJson('/api/user/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The current password is incorrect.');
    }

    public function test_avatar_options_include_expected_presets(): void
    {
        $this->assertContains('indigo', UserAvatars::ids());
        $this->assertContains('brand', UserAvatars::ids());
        $this->assertCount(8, UserAvatars::options());
    }

    public function test_it_uploads_and_removes_profile_photo(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'username' => 'plantmanager',
            'avatar' => 'indigo',
        ]);
        $this->actingAs($user);

        $uploadResponse = $this->postJson('/api/user/profile/photo', [
            'photo' => UploadedFile::fake()->image('profile.jpg', 320, 320),
        ]);

        $uploadResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.has_profile_photo', true)
            ->assertJsonPath('message', 'Profile photo uploaded successfully.');

        $photoUrl = $uploadResponse->json('data.profile_photo_url');
        $this->assertNotNull($photoUrl);

        $user = User::query()->first();
        $this->assertNotNull($user->profile_photo_path);
        $storedPath = $user->profile_photo_path;
        Storage::disk('public')->assertExists($storedPath);

        $removeResponse = $this->deleteJson('/api/user/profile/photo');

        $removeResponse->assertOk()
            ->assertJsonPath('data.has_profile_photo', false)
            ->assertJsonPath('data.profile_photo_url', null);

        Storage::disk('public')->assertMissing($storedPath);
        $this->assertNull($user->fresh()->profile_photo_path);
    }

    public function test_it_rejects_invalid_profile_photo(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['username' => 'plantmanager']);
        $this->actingAs($user);

        $response = $this->postJson('/api/user/profile/photo', [
            'photo' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photo']);
    }
}
