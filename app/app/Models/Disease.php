<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Disease extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'symptoms',
        'prevention',
        'treatment',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function cases(): HasMany
    {
        return $this->hasMany(DiseaseCase::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function educationalContents(): HasMany
    {
        return $this->hasMany(EducationalContent::class);
    }
}
