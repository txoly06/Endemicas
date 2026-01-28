<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaseHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_id',
        'user_id',
        'previous_status',
        'new_status',
        'notes',
    ];

    public function case(): BelongsTo
    {
        return $this->belongsTo(DiseaseCase::class, 'case_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
