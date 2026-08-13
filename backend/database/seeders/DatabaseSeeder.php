<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Plant Manager',
            'username' => 'plantmanager',
            'email' => 'admin@cogs.local',
            'role' => 'Administrator',
            'avatar' => 'indigo',
            'password' => Hash::make('password'),
        ]);

        $this->call([
            CogsSeeder::class,
        ]);
    }
}
