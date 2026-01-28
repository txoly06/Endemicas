<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EducationalContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'disease_id',
        'title',
        'slug',
        'content',
        'type',
        'image_url',
        'is_published',
        'author_id',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        
        static::creating(function ($content) {
            if (empty($content->slug)) {
                $content->slug = Str::slug($content->title);
            }
        });
    }

    public function disease(): BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // Scope for published content
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    // Scope by type
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
