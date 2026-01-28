<?php

namespace App\Services;

use App\Models\Disease;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class DiseaseService
{
    /**
     * Get filtered diseases
     */
    public function getFilteredDiseases(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Disease::query();

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
     * Create a new disease with audit logging
     */
    public function createDisease(array $data, User $createdBy): Disease
    {
        $disease = Disease::create($data);

        $this->logAuditAction('disease.created', $createdBy, [
            'disease_id' => $disease->id,
            'name' => $disease->name,
            'code' => $disease->code,
        ]);

        return $disease;
    }

    /**
     * Update a disease with audit logging
     */
    public function updateDisease(Disease $disease, array $data, User $updatedBy): Disease
    {
        $previousData = $disease->only(['name', 'code', 'is_active']);
        
        $disease->update($data);

        $this->logAuditAction('disease.updated', $updatedBy, [
            'disease_id' => $disease->id,
            'changes' => array_diff_assoc($data, $previousData),
        ]);

        return $disease;
    }

    /**
     * Delete a disease with audit logging
     */
    public function deleteDisease(Disease $disease, User $deletedBy): void
    {
        $this->logAuditAction('disease.deleted', $deletedBy, [
            'disease_id' => $disease->id,
            'name' => $disease->name,
            'code' => $disease->code,
        ]);

        $disease->delete();
    }

    /**
     * Get disease with recent cases
     */
    public function getDiseaseWithCases(Disease $disease, int $limit = 10): Disease
    {
        return $disease->load(['cases' => function ($query) use ($limit) {
            $query->latest()->limit($limit);
        }]);
    }

    /**
     * Log audit action for compliance
     */
    private function logAuditAction(string $action, User $user, array $context = []): void
    {
        Log::channel('audit')->info($action, array_merge([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $user->role,
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString(),
        ], $context));
    }
}
