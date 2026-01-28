<?php

namespace Tests\Unit\Repositories;

use App\Models\Disease;
use App\Models\DiseaseCase;
use App\Models\User;
use App\Repositories\CaseRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CaseRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private CaseRepository $caseRepository;
    private Disease $disease;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->caseRepository = app(CaseRepository::class);
        $this->user = User::factory()->create();
        $this->disease = Disease::create([
            'name' => 'Test Disease',
            'code' => 'TEST01',
            'is_active' => true,
        ]);
    }

    public function test_get_counts_by_status_returns_correct_counts(): void
    {
        // Create cases with different statuses
        DiseaseCase::factory()->count(3)->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'status' => 'confirmed',
        ]);

        DiseaseCase::factory()->count(2)->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'status' => 'suspected',
        ]);

        $counts = $this->caseRepository->getCountsByStatus();

        $this->assertEquals(5, $counts['total_cases']);
        $this->assertEquals(3, $counts['confirmed_cases']);
        $this->assertEquals(2, $counts['suspected_cases']);
    }

    public function test_get_counts_by_status_is_cached(): void
    {
        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
        ]);

        // First call - should cache
        $this->caseRepository->getCountsByStatus();

        $this->assertTrue(Cache::has('cases.counts_by_status'));
    }

    public function test_get_cases_by_province_groups_correctly(): void
    {
        DiseaseCase::factory()->count(3)->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'province' => 'Luanda',
        ]);

        DiseaseCase::factory()->count(2)->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'province' => 'Benguela',
        ]);

        $result = $this->caseRepository->getCasesByProvince();

        $luanda = $result->firstWhere('province', 'Luanda');
        $benguela = $result->firstWhere('province', 'Benguela');

        $this->assertEquals(3, $luanda->total);
        $this->assertEquals(2, $benguela->total);
    }

    public function test_get_filtered_with_province_filter(): void
    {
        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'province' => 'Luanda',
        ]);

        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'province' => 'Benguela',
        ]);

        $result = $this->caseRepository->getFiltered(['province' => 'Luanda']);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('Luanda', $result->first()->province);
    }

    public function test_get_filtered_with_status_filter(): void
    {
        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'status' => 'confirmed',
        ]);

        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'status' => 'suspected',
        ]);

        $result = $this->caseRepository->getFiltered(['status' => 'confirmed']);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('confirmed', $result->first()->status);
    }

    public function test_clear_cache_removes_all_case_caches(): void
    {
        // Populate caches
        Cache::put('cases.counts_by_status', 'test', 300);
        Cache::put('cases.by_disease', 'test', 300);
        Cache::put('cases.by_province', 'test', 300);

        $this->caseRepository->clearCache();

        $this->assertFalse(Cache::has('cases.counts_by_status'));
        $this->assertFalse(Cache::has('cases.by_disease'));
        $this->assertFalse(Cache::has('cases.by_province'));
    }

    public function test_get_cases_by_age_group_categorizes_correctly(): void
    {
        // Child (< 18)
        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'patient_dob' => now()->subYears(10)->format('Y-m-d'),
        ]);

        // Adult (18-35)
        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'patient_dob' => now()->subYears(25)->format('Y-m-d'),
        ]);

        // Senior (65+)
        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->user->id,
            'patient_dob' => now()->subYears(70)->format('Y-m-d'),
        ]);

        $result = $this->caseRepository->getCasesByAgeGroup();

        $this->assertCount(5, $result); // All age groups
        
        $child = collect($result)->firstWhere('age_group', '0-17');
        $adult = collect($result)->firstWhere('age_group', '18-35');
        $senior = collect($result)->firstWhere('age_group', '65+');
        
        $this->assertEquals(1, $child['total']);
        $this->assertEquals(1, $adult['total']);
        $this->assertEquals(1, $senior['total']);
    }
}
