<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'type',
    'title',
    'title_en',
    'title_ru',
    'content',
    'content_en',
    'content_ru',
    'position',
    'is_visible',
])]
class ResumeBlock extends Model
{
    protected function casts(): array
    {
        return [
            'content' => 'array',
            'content_en' => 'array',
            'content_ru' => 'array',
            'is_visible' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
