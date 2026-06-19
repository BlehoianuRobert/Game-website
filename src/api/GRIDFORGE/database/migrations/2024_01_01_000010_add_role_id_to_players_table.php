<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Seed the two roles before adding the FK column
        $now = now();

        $playerId = (string) Str::uuid();
        $devId    = (string) Str::uuid();

        DB::table('roles')->insertOrIgnore([
            ['id' => $playerId, 'name' => 'player', 'description' => 'Default role for registered players', 'created_at' => $now, 'updated_at' => $now],
            ['id' => $devId,    'name' => 'dev',    'description' => 'Developer / administrator role',      'created_at' => $now, 'updated_at' => $now],
        ]);

        $defaultRoleId = DB::table('roles')->where('name', 'player')->value('id');

        Schema::table('players', function (Blueprint $table) {
            $table->uuid('role_id')->nullable()->after('status');
            $table->foreign('role_id')->references('id')->on('roles')->nullOnDelete();
        });

        // Assign the player role to all existing players
        DB::table('players')->whereNull('role_id')->update(['role_id' => $defaultRoleId]);
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};
