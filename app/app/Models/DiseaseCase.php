<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class DiseaseCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cases';

    protected $fillable = [
        'disease_id',
        'user_id',
        'patient_code',
        'patient_name',
        'patient_dob',
        'patient_id_number',
        'patient_gender',
        'symptoms_reported',
        'symptom_onset_date',
        'diagnosis_date',
        'status',
        'province',
        'municipality',
        'commune',
        'latitude',
        'longitude',
        'notes',
    ];

    protected $casts = [
        'patient_dob' => 'date',
        'symptom_onset_date' => 'date',
        'diagnosis_date' => 'date',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    protected $hidden = [
        'patient_id_number', // Masked by accessor
    ];

    protected static function boot(): void
    {
        parent::boot();
        
        static::creating(function ($case) {
            if (empty($case->patient_code)) {
                $case->patient_code = 'CASE-' . strtoupper(Str::random(8));
            }
        });
    }

    // Accessor for masked ID number
    public function getMaskedIdNumberAttribute(): ?string
    {
        if (empty($this->patient_id_number)) {
            return null;
        }
        return '****' . substr($this->patient_id_number, -4);
    }

    // Generate QR code data
    public function getQrDataAttribute(): string
    {
        return json_encode([
            'code' => $this->patient_code,
            'name' => $this->patient_name,
            'dob' => $this->patient_dob->format('Y-m-d'),
            'verified' => now()->toISOString(),
        ]);
    }

    public function disease(): BelongsTo
    {
        return $this->belongsTo(Disease::class);
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(CaseHistory::class, 'case_id');
    }

    // Scopes
    public function scopeByProvince($query, string $province)
    {
        return $query->where('province', $province);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDateRange($query, string $start, string $end)
    {
        return $query->whereBetween('diagnosis_date', [$start, $end]);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }
}
