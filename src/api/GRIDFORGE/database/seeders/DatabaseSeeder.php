<?php

namespace Database\Seeders;

use App\Models\User\Player;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // -------------------------------------------------------------------------
        // 1. Fetch System Roles (Seeded via your migration file)
        // -------------------------------------------------------------------------
        $devRole   = DB::table('roles')->where('name', 'dev')->first();
        $playerRole = DB::table('roles')->where('name', 'player')->first();

        if (!$devRole || !$playerRole) {
            $this->command->error('Roles table is empty. Please run your migrations first!');
            return;
        }

        // -------------------------------------------------------------------------
        // 2. Seed Admin / Developer Account
        // -------------------------------------------------------------------------
        $adminId = (string) Str::uuid();
        DB::table('players')->insertOrIgnore([
            'id'         => $adminId,
            'username'   => 'admin_dev',
            'email'      => 'dev@gridforge.com',
            'password'   => Hash::make('password123'),
            'status'     => 'active',
            'role_id'    => $devRole->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('player_profiles')->insertOrIgnore([
            'id'          => (string) Str::uuid(),
            'player_id'   => $adminId,
            'display_name' => 'GridForge Admin',
            'bio'         => 'System administrator account.',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // -------------------------------------------------------------------------
        // 3. Seed Mock Players & Profiles (Using your updated PlayerFactory)
        // -------------------------------------------------------------------------
        $this->command->info('Seeding players and profiles...');

        // Generate 10 mock players linked to the default 'player' role
        $players = Player::factory()->count(10)->create([
            'role_id' => $playerRole->id,
        ]);

        foreach ($players as $player) {
            DB::table('player_profiles')->insert([
                'id'          => (string) Str::uuid(),
                'player_id'   => $player->id,
                'display_name' => fake()->name(),
                'avatar_url'  => 'https://api.dicebear.com/7.x/bottts/svg?seed=' . urlencode($player->username),
                'bio'         => fake()->sentence(),
                'subscribed'  => fake()->boolean(30), // 30% chance to be premium subscriber
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // -------------------------------------------------------------------------
        // 4. Seed Games & Game Versions
        // -------------------------------------------------------------------------
        $this->command->info('Seeding games and versions...');

        $gameData = [
            ['name' => 'Space Invaders Evolution', 'desc' => 'Classic retro arcade shooter redefined.'],
            ['name' => 'Grid Runner', 'desc' => 'High-speed cyberpunk endless runner.'],
            ['name' => 'Forge Clicker', 'desc' => 'Strategy tycoon incremental resource generator.'],
        ];

        $gameIds = [];

        foreach ($gameData as $g) {
            $gameId = (string) Str::uuid();
            $gameIds[] = $gameId;

            DB::table('games')->insert([
                'id'          => $gameId,
                'name'        => $g['name'],
                'description' => $g['desc'],
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            // Create an active game release version
            DB::table('game_versions')->insert([
                'id'         => (string) Str::uuid(),
                'game_id'    => $gameId,
                'version'    => 'v1.0.4',
                'is_active'  => true,
                'released_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // -------------------------------------------------------------------------
        // 5. Seed Items (Store Assets per Game)
        // -------------------------------------------------------------------------
        $this->command->info('Seeding loot items...');

        $rarities = ['common', 'rare', 'epic', 'legendary'];
        $itemIds = [];

        foreach ($gameIds as $gameId) {
            for ($i = 1; $i <= 4; $i++) {
                $itemId = (string) Str::uuid();
                $itemIds[] = $itemId;

                DB::table('items')->insert([
                    'id'          => $itemId,
                    'game_id'     => $gameId,
                    'name'        => fake()->word() . ' Powerup',
                    'description' => fake()->sentence(),
                    'rarity'      => fake()->randomElement($rarities),
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }

        // -------------------------------------------------------------------------
        // 6. Cross-Seed Player Interactions (Progress, Inventories & Gifts)
        // -------------------------------------------------------------------------
        $this->command->info('Seeding player relationships, scores, and items...');

        foreach ($players as $player) {
            // Assign score progress to 1-2 random games
            $assignedGames = fake()->randomElements($gameIds, fake()->numberBetween(1, 2));
            foreach ($assignedGames as $gameId) {
                DB::table('player_progress')->insertOrIgnore([
                    'id'        => (string) Str::uuid(),
                    'player_id' => $player->id,
                    'game_id'   => $gameId,
                    'score'     => fake()->numberBetween(500, 150000),
                    'updated_at'=> now(),
                ]);
            }

            // Grant 2-3 random items to player inventory
            $assignedItems = fake()->randomElements($itemIds, fake()->numberBetween(2, 3));
            foreach ($assignedItems as $itemId) {
                DB::table('player_items')->insertOrIgnore([
                    'id'        => (string) Str::uuid(),
                    'player_id' => $player->id,
                    'item_id'   => $itemId,
                    'quantity'  => fake()->numberBetween(1, 5),
                    'created_at'=> now(),
                    'updated_at'=> now(),
                ]);
            }
        }

        // Seed a few dummy peer-to-peer gifts
        for ($i = 0; $i < 5; $i++) {
            $sender    = $players->random();
            $recipient = $players->where('id', '!=', $sender->id)->random();

            if ($sender && $recipient) {
                DB::table('gifts')->insert([
                    'id'           => (string) Str::uuid(),
                    'sender_id'    => $sender->id,
                    'recipient_id' => $recipient->id,
                    'item_id'      => fake()->randomElement($itemIds),
                    'status'       => fake()->randomElement(['pending', 'accepted']),
                    'sent_at'      => now(),
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
        }

        $this->command->info('Database successfully populated with clean mock data! 🎮');
    }
}
