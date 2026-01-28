<?php

namespace App\Repositories;

use App\Models\Disease;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class DiseaseRepository extends BaseRepository
{
    private const CACHE_TTL = 600; // 10 minutes

    public function __construct(Disease $model)
    {
        parent::__construct($model);
    }

    /**
     * Get all active diseases (cached)
     */
    public function getActive(): Collection
    {
        return Cache::remember('diseases.active', self::CACHE_TTL, function () {
            return $this->model
                ->where('is_active', true)
                ->orderBy('name')
                ->get();
        });
    }

    /**
     * Get diseases with filters
     */
    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->query();

        if (isset($filters['active'])) {
            $query->where('is_active', $filters['active']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('code', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    /**
     * Get disease with recent cases
     */
    public function getWithCases(int $id, int $caseLimit = 10): ?Disease
    {
        return $this->model
            ->with(['cases' => function ($query) use ($caseLimit) {
                $query->latest()->limit($caseLimit);
            }])
            ->find($id);
    }

    /**
     * Get count of monitored diseases (cached)
     */
    public function getActiveCount(): int
    {
        return Cache::remember('diseases.active_count', self::CACHE_TTL, function () {
            return $this->model->where('is_active', true)->count();
        });
    }

    /**
     * Clear disease-related caches
     */
    public function clearCache(): void
    {
        Cache::forget('diseases.active');
        Cache::forget('diseases.active_count');
    }
}
