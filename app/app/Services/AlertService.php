<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\Disease;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class AlertService
{
    /**
     * Get filtered alerts
     */
    public function getFilteredAlerts(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Alert::with(['disease:id,name', 'creator:id,name']);

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
     * Get active alerts for public display
     */
    public function getActiveAlerts(): Collection
    {
        return Alert::active()
            ->with('disease:id,name')
            ->orderByRaw("CASE severity 
                WHEN 'critical' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'medium' THEN 3 
                WHEN 'low' THEN 4 
                END")
            ->get();
    }

    /**
     * Create a new alert with audit logging
     */
    public function createAlert(array $data, User $createdBy): Alert
    {
        $data['created_by'] = $createdBy->id;
        
        $alert = Alert::create($data);

        $this->logAuditAction('alert.created', $createdBy, [
            'alert_id' => $alert->id,
            'title' => $alert->title,
            'severity' => $alert->severity,
        ]);

        return $alert->load(['disease:id,name']);
    }

    /**
     * Update an alert with audit logging
     */
    public function updateAlert(Alert $alert, array $data, User $updatedBy): Alert
    {
        $previousData = $alert->only(['title', 'severity', 'is_active']);
        
        $alert->update($data);

        $this->logAuditAction('alert.updated', $updatedBy, [
            'alert_id' => $alert->id,
            'changes' => array_diff_assoc($data, $previousData),
        ]);

        return $alert;
    }

    /**
     * Delete an alert with audit logging
     */
    public function deleteAlert(Alert $alert, User $deletedBy): void
    {
        $this->logAuditAction('alert.deleted', $deletedBy, [
            'alert_id' => $alert->id,
            'title' => $alert->title,
        ]);

        $alert->delete();
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
