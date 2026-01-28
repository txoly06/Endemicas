<?php

namespace App\Services;

use App\Models\CaseHistory;
use App\Models\DiseaseCase;
use App\Models\User;
use App\Repositories\CaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class CaseService
{
    public function __construct(
        private readonly CaseRepository $caseRepository
    ) {}

    /**
     * Get filtered and paginated cases
     */
    public function getFilteredCases(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->caseRepository->getFiltered($filters, $perPage);
    }

    /**
     * Create a new case with audit logging
     */
    public function createCase(array $data, User $registeredBy): DiseaseCase
    {
        $data['user_id'] = $registeredBy->id;
        
        $case = $this->caseRepository->create($data);

        // Create initial history entry
        $this->createHistoryEntry($case, $registeredBy, null, $case->status, 'Case created');

        // Invalidate cache
        $this->caseRepository->clearCache();

        // Audit log
        $this->logAuditAction('case.created', $registeredBy, [
            'case_id' => $case->id,
            'patient_code' => $case->patient_code,
            'disease_id' => $case->disease_id,
        ]);

        return $case->load('disease');
    }

    /**
     * Update an existing case with status tracking
     */
    public function updateCase(DiseaseCase $case, array $data, User $updatedBy): DiseaseCase
    {
        $previousStatus = $case->status;
        $previousData = $case->only(['status', 'province', 'municipality']);
        
        $case = $this->caseRepository->update($case, $data);

        // Create history entry if status changed
        if (isset($data['status']) && $data['status'] !== $previousStatus) {
            $this->createHistoryEntry(
                $case,
                $updatedBy,
                $previousStatus,
                $data['status'],
                $data['status_notes'] ?? 'Status updated'
            );
        }

        // Invalidate cache
        $this->caseRepository->clearCache();

        // Audit log
        $this->logAuditAction('case.updated', $updatedBy, [
            'case_id' => $case->id,
            'patient_code' => $case->patient_code,
            'changes' => array_diff_assoc($data, $previousData),
        ]);

        return $case->load('disease');
    }

    /**
     * Soft delete a case with audit logging
     */
    public function deleteCase(DiseaseCase $case, User $deletedBy): void
    {
        $this->logAuditAction('case.deleted', $deletedBy, [
            'case_id' => $case->id,
            'patient_code' => $case->patient_code,
        ]);

        $this->caseRepository->delete($case);
        $this->caseRepository->clearCache();
    }

    /**
     * Get case with full details including masked ID and QR data
     */
    public function getCaseWithDetails(DiseaseCase $case): array
    {
        $fullCase = $this->caseRepository->getWithRelations($case->id);

        $caseData = $fullCase->toArray();
        $caseData['masked_id_number'] = $fullCase->masked_id_number;
        $caseData['qr_data'] = $fullCase->qr_data;

        return $caseData;
    }

    /**
     * Create a history entry for case status changes
     */
    private function createHistoryEntry(
        DiseaseCase $case,
        User $user,
        ?string $previousStatus,
        string $newStatus,
        string $notes
    ): CaseHistory {
        return CaseHistory::create([
            'case_id' => $case->id,
            'user_id' => $user->id,
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'notes' => $notes,
        ]);
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
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ], $context));
    }
}
