<?php

namespace App\Repositories;

use App\Models\DiseaseCase;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CaseRepository extends BaseRepository
{
    private const CACHE_TTL = 300; // 5 minutes

    public function __construct(DiseaseCase $model)
    {
        parent::__construct($model);
    }

    /**
     * Get filtered and paginated cases
     */
    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['disease', 'registeredBy:id,name']);

        if (!empty($filters['disease_id'])) {
            $query->where('disease_id', $filters['disease_id']);
        }

        if (!empty($filters['province'])) {
            $query->byProvince($filters['province']);
        }

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->byDateRange($filters['start_date'], $filters['end_date']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('patient_name', 'like', "%{$filters['search']}%")
                  ->orWhere('patient_code', 'like', "%{$filters['search']}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Get case with all relationships
     */
    public function getWithRelations(int $id): ?DiseaseCase
    {
        return $this->model
            ->with(['disease', 'registeredBy:id,name', 'histories.user:id,name'])
            ->find($id);
    }

    /**
     * Count cases by status (cached)
     */
    public function getCountsByStatus(): array
    {
        return Cache::remember('cases.counts_by_status', self::CACHE_TTL, function () {
            return $this->model
                ->selectRaw("
                    COUNT(*) as total_cases,
                    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_cases,
                    SUM(CASE WHEN status = 'suspected' THEN 1 ELSE 0 END) as suspected_cases,
                    SUM(CASE WHEN status = 'recovered' THEN 1 ELSE 0 END) as recovered_cases,
                    SUM(CASE WHEN status = 'deceased' THEN 1 ELSE 0 END) as deceased_cases
                ")
                ->first()
                ->toArray();
        });
    }

    /**
     * Get cases by disease (cached)
     */
    public function getCasesByDisease(): Collection
    {
        return Cache::remember('cases.by_disease', self::CACHE_TTL, function () {
            return $this->model
                ->select('disease_id', DB::raw('count(*) as total'))
                ->with('disease:id,name,code')
                ->groupBy('disease_id')
                ->orderByDesc('total')
                ->get();
        });
    }

    /**
     * Get cases by province (cached)
     */
    public function getCasesByProvince(): Collection
    {
        return Cache::remember('cases.by_province', self::CACHE_TTL, function () {
            return $this->model
                ->select('province', DB::raw('count(*) as total'))
                ->groupBy('province')
                ->orderByDesc('total')
                ->get();
        });
    }

    /**
     * Get cases by status (cached)
     */
    public function getCasesByStatusGrouped(): Collection
    {
        return Cache::remember('cases.by_status', self::CACHE_TTL, function () {
            return $this->model
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->get();
        });
    }

    /**
     * Get timeline data
     */
    public function getTimeline(int $days = 30): Collection
    {
        $cacheKey = "cases.timeline.{$days}";
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($days) {
            $startDate = now()->subDays($days)->startOfDay();
            
            return $this->model
                ->select(
                    DB::raw('DATE(diagnosis_date) as date'),
                    DB::raw('count(*) as total')
                )
                ->where('diagnosis_date', '>=', $startDate)
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        });
    }

    /**
     * Get geographic data for heatmap (cached)
     */
    public function getGeographicData(): Collection
    {
        return Cache::remember('cases.geographic', self::CACHE_TTL, function () {
            return $this->model
                ->select('latitude', 'longitude', 'status', 'disease_id')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->with('disease:id,name')
                ->get();
        });
    }

    /**
     * Get cases by age group (cached)
     */
    public function getCasesByAgeGroup(): array
    {
        return Cache::remember('cases.by_age', self::CACHE_TTL, function () {
            $cases = $this->model->select('patient_dob')->get();
            
            $ageGroups = [
                '0-17' => 0,
                '18-35' => 0,
                '36-50' => 0,
                '51-65' => 0,
                '65+' => 0,
            ];

            foreach ($cases as $case) {
                $age = Carbon::parse($case->patient_dob)->age;
                
                if ($age < 18) {
                    $ageGroups['0-17']++;
                } elseif ($age <= 35) {
                    $ageGroups['18-35']++;
                } elseif ($age <= 50) {
                    $ageGroups['36-50']++;
                } elseif ($age <= 65) {
                    $ageGroups['51-65']++;
                } else {
                    $ageGroups['65+']++;
                }
            }

            return collect($ageGroups)->map(function ($total, $ageGroup) {
                return ['age_group' => $ageGroup, 'total' => $total];
            })->values()->toArray();
        });
    }

    /**
     * Get cases by gender (cached)
     */
    public function getCasesByGender(): Collection
    {
        return Cache::remember('cases.by_gender', self::CACHE_TTL, function () {
            return $this->model
                ->select('patient_gender', DB::raw('count(*) as total'))
                ->groupBy('patient_gender')
                ->get();
        });
    }

    /**
     * Invalidate all case-related caches
     */
    public function clearCache(): void
    {
        $keys = [
            'cases.counts_by_status',
            'cases.by_disease',
            'cases.by_province',
            'cases.by_status',
            'cases.geographic',
            'cases.by_age',
            'cases.by_gender',
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }

        // Clear timeline caches (with different day values)
        for ($days = 1; $days <= 365; $days++) {
            Cache::forget("cases.timeline.{$days}");
        }
    }
}
