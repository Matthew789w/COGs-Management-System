<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\User\CannotDeleteUserException;
use App\Services\User\UserManagementService;
use App\Support\UserRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\FeatureTestCase;

class UsersTest extends FeatureTestCase
{
    use RefreshDatabase;

    public function test_administrator_can_list_users(): void
    {
        User::factory()->create([
            'username' => 'operator1',
            'role' => 'Operator',
        ]);

        $response = $this->getJson('/api/users');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_non_administrator_cannot_manage_users(): void
    {
        $operator = User::factory()->create([
            'username' => 'operator1',
            'role' => 'Operator',
        ]);

        $this->actingAs($operator);

        $this->getJson('/api/users')->assertForbidden();
        $this->postJson('/api/users', [])->assertForbidden();
    }

    public function test_administrator_can_create_user(): void
    {
        $response = $this->postJson('/api/users', [
            'name' => 'New Operator',
            'username' => 'newoperator',
            'email' => 'operator@cogs.local',
            'role' => 'Operator',
            'avatar' => 'emerald',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.username', 'newoperator')
            ->assertJsonPath('data.role', 'Operator');

        $this->assertDatabaseHas('users', [
            'username' => 'newoperator',
            'email' => 'operator@cogs.local',
            'role' => 'Operator',
        ]);
    }

    public function test_administrator_can_update_user(): void
    {
        $user = User::factory()->create([
            'username' => 'staff1',
            'role' => 'Operator',
        ]);

        $response = $this->putJson("/api/users/{$user->id}", [
            'name' => 'Updated Staff',
            'username' => 'staff1',
            'email' => $user->email,
            'role' => 'Supervisor',
            'avatar' => 'violet',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Staff')
            ->assertJsonPath('data.role', 'Supervisor');
    }

    public function test_administrator_can_reset_user_password(): void
    {
        $user = User::factory()->create([
            'username' => 'staff2',
            'password' => Hash::make('old-password'),
        ]);

        $this->putJson("/api/users/{$user->id}", [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $user->refresh();

        $this->assertTrue(Hash::check('new-password', $user->password));
    }

    public function test_administrator_cannot_delete_their_own_account(): void
    {
        $admin = $this->authenticate();

        $this->deleteJson("/api/users/{$admin->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'You cannot delete your own account.');
    }

    public function test_cannot_delete_last_administrator_account(): void
    {
        $soleAdmin = User::factory()->create([
            'username' => 'soleadmin',
            'role' => UserRoles::ADMINISTRATOR,
        ]);

        User::query()->where('id', '!=', $soleAdmin->id)->delete();

        Auth::login(User::factory()->make(['role' => UserRoles::ADMINISTRATOR]));

        $this->expectException(CannotDeleteUserException::class);
        $this->expectExceptionMessage('Cannot delete the last administrator account.');

        app(UserManagementService::class)->delete($soleAdmin);
    }

    public function test_administrator_can_delete_user(): void
    {
        User::factory()->create([
            'username' => 'extra-admin',
            'role' => UserRoles::ADMINISTRATOR,
        ]);

        $user = User::factory()->create([
            'username' => 'deleteme',
            'role' => 'Operator',
        ]);

        $this->deleteJson("/api/users/{$user->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }
}
