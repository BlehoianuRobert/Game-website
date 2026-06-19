<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

trait HasUuidKey
{
    protected static function bootHasUuidKey(): void
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function initializeHasUuidKey(): void
    {
        $this->incrementing = false;
        $this->keyType = 'string';
    }
}
