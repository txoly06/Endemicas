<?php

namespace Tests\Unit\Services;

use App\Models\Disease;
use App\Models\DiseaseCase;
use App\Models\User;
use App\Repositories\CaseRepository;
use App\Services\CaseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CaseServiceTest extends TestCase
{
    use RefreshDatabase;

    private CaseService $caseService;
    private User $user;
    private Disease $disease;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->caseService = app(CaseService::class);
        $this->user = User::factory()->create(['role' => 'health_professional']);
        $this->disease = Disease::create([
            'name' => 'Test Disease',
            'code' => 'TEST01',
            'is_active' => true,
        ]);
    }

    public function test_create_case_creates_case_and_history(): void
    {
        $data = [
            'disease_id' => $this->disease->id,
            'patient_name' => 'Test Patient',
            'patient_dob' => '1990-01-01',
            'patient_gender' => 'M',
            'symptoms_reported' => 'Fever',
            'symptom_onset_date' => now()->subDays(3)->format('Y-m-d'),
            'diagnosis_date' => now()->format('Y-m-d'),
            'status' => 'suspected',
            'province' => 'Luanda',
            'municipality' => 'Viana',
        ];

        $case = $this->caseService->createCase($data, $this->user);

        $this->assertEquals('Test Patient', $case->patient_name);
        $this->assertEquals($this->user->id, $case->user_id);
        $this->assertNotNull($case->patient_code);

        // Check history was created
        $this->assertDatabaseHas('case_histories', [
            'case_id' => $case->id,
            'new_status' => 'suspected',
            'notes' => 'Case created',
        ]);
    }

    public function test_update_case_creates_history_on_status_change(): void
    {
        $case = DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'status' => 'suspected',
        ]);

        $updatedCase = $this->caseService->updateCase($case, [
            'status' => 'confirmed',
            'status_notes' => 'Lab test positive',
        ], $this->user);

        $this->assertEquals('confirmed', $updatedCase->status);

        $this->assertDatabaseHas('case_histories', [
            'case_id' => $case->id,
            'previous_status' => 'suspected',
            'new_status' => 'confirmed',
            'notes' => 'Lab test positive',
        ]);
    }

    public function test_update_case_does_not_create_history_without_status_change(): void
    {
        $case = DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'status' => 'suspected',
        ]);

        $initialHistoryCount = $case->histories()->count();

        $this->caseService->updateCase($case, [
            'province' => 'Benguela', // No status change
        ], $this->user);

        $this->assertEquals($initialHistoryCount, $case->histories()->count());
    }

    public function test_delete_case_soft_deletes(): void
    {
        $case = DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
        ]);

        $this->caseService->deleteCase($case, $this->user);

        $this->assertSoftDeleted('cases', ['id' => $case->id]);
    }

    public function test_get_case_with_details_includes_masked_id(): void
    {
        $case = DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'patient_id_number' => '001234567LA001',
        ]);

        $details = $this->caseService->getCaseWithDetails($case);

        $this->assertArrayHasKey('masked_id_number', $details);
        $this->assertArrayHasKey('qr_data', $details);
        $this->assertStringStartsWith('****', $details['masked_id_number']);
    }

    public function test_create_case_invalidates_cache(): void
    {
        Cache::put('cases.counts_by_status', ['cached' => true], 300);

        $this->caseService->createCase([
            'disease_id' => $this->disease->id,
            'patient_name' => 'Test',
            'patient_dob' => '1990-01-01',
            'patient_gender' => 'M',
            'symptoms_reported' => 'Fever',
            'symptom_onset_date' => now()->format('Y-m-d'),
            'diagnosis_date' => now()->format('Y-m-d'),
            'province' => 'Luanda',
            'municipality' => 'Viana',
        ], $this->user);

        $this->assertFalse(Cache::has('cases.counts_by_status'));
    }
}
