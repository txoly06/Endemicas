<?php

namespace App\Repositories;

use App\Models\Alert;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class AlertRepository extends BaseRepository
{
    private const CACHE_TTL = 300; // 5 minutes

    public function __construct(Alert $model)
    {
        parent::__construct($model);
    }

    /**
     * Get active alerts (cached)
     */
    public function getActive(): Collection
    {
        return Cache::remember('alerts.active', self::CACHE_TTL, function () {
            return $this->model
                ->active()
                ->with('disease:id,name')
                ->orderByRaw("CASE severity 
                    WHEN 'critical' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'medium' THEN 3 
                    WHEN 'low' THEN 4 
                    END")
                ->get();
        });
    }

    /**
     * Get filtered alerts
     */
    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->with(['disease:id,name', 'creator:id,name']);

        if (isset($filters['active'])) {
            if ($filters['active']) {
                $query->active();
            } else {
                $query->where('is_active', false);
            }
        }

        if (!empty($filters['severity'])) {
            $query->bySeverity($filters['severity']);
        }

        if (!empty($filters['disease_id'])) {
            $query->where('disease_id', $filters['disease_id']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Get active alerts count (cached)
     */
    public function getActiveCount(): int
    {
        return Cache::remember('alerts.active_count', self::CACHE_TTL, function () {
            return $this->model->active()->count();
        });
    }

    /**
     * Clear alert-related caches
     */
    public function clearCache(): void
    {
        Cache::forget('alerts.active');
        Cache::forget('alerts.active_count');
    }
}
