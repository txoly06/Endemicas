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

    /*
    |--------------------------------------------------------------------------
    | CRIAR CASO (LÓGICA DE NEGÓCIO)
    |--------------------------------------------------------------------------
    | Centraliza toda a lógica de criação de casos:
    | 1. Associa ao utilizador que criou.
    | 2. Cria o histórico inicial automaticamente.
    | 3. Limpa cache para refletir mudanças no dashboard.
    | 4. Gera log de auditoria detalhado.
    */
    public function createCase(array $data, User $registeredBy): DiseaseCase
    {
        $data['user_id'] = $registeredBy->id;
        
        $case = $this->caseRepository->create($data);

        // Cria entrada inicial no histórico (Rastreabilidade)
        $this->createHistoryEntry($case, $registeredBy, null, $case->status, 'Caso registado no sistema');

        // Invalida cache para que contadores do dashboard atualizem
        $this->caseRepository->clearCache();

        // Auditoria
        $this->logAuditAction('case.created', $registeredBy, [
            'case_id' => $case->id,
            'patient_code' => $case->patient_code,
            'disease_id' => $case->disease_id,
        ]);

        return $case->load('disease');
    }

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR CASO E RASTREAR MUDANÇAS
    |--------------------------------------------------------------------------
    | Ao atualizar um caso, verificamos se o STATUS mudou.
    | Se mudou (ex: Suspeito -> Confirmado), criamos um registo histórico.
    | Isso permite saber QUEM mudou o status e QUANDO.
    */
    public function updateCase(DiseaseCase $case, array $data, User $updatedBy): DiseaseCase
    {
        $previousStatus = $case->status;
        $previousData = $case->only(['status', 'province', 'municipality']);
        
        $case = $this->caseRepository->update($case, $data);

        // Deteta mudança de estado para histórico clínico
        if (isset($data['status']) && $data['status'] !== $previousStatus) {
            $this->createHistoryEntry(
                $case,
                $updatedBy,
                $previousStatus,
                $data['status'],
                $data['status_notes'] ?? 'Atualização de estado clínico'
            );
        }

        // Limpa cache
        $this->caseRepository->clearCache();

        // Auditoria de campos alterados
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
