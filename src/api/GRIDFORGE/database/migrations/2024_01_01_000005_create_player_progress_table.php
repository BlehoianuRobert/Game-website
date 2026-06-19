<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('player_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('player_id')->constrained('players')->cascadeOnDelete();
            $table->foreignUuid('game_id')->constrained('games')->cascadeOnDelete();
            $table->unsignedBigInteger('score')->default(0);
            $table->timestamp('updated_at')->useCurrent();
            $table->unique(['player_id', 'game_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('player_progress');
    }
};
