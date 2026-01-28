<?php

namespace Tests\Feature;

use App\Models\Disease;
use App\Models\DiseaseCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CaseTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $healthProfessional;
    private User $publicUser;
    private Disease $disease;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->healthProfessional = User::factory()->create(['role' => 'health_professional']);
        $this->publicUser = User::factory()->create(['role' => 'public']);
        
        $this->disease = Disease::create([
            'name' => 'Test Disease',
            'code' => 'TEST01',
            'description' => 'Test description',
            'is_active' => true,
        ]);
    }

    public function test_health_professional_can_create_case(): void
    {
        $response = $this->actingAs($this->healthProfessional)->postJson('/api/cases', [
            'disease_id' => $this->disease->id,
            'patient_name' => 'John Doe',
            'patient_dob' => '1990-01-15',
            'patient_gender' => 'M',
            'symptoms_reported' => 'Fever, headache',
            'symptom_onset_date' => now()->subDays(3)->format('Y-m-d'),
            'diagnosis_date' => now()->format('Y-m-d'),
            'status' => 'suspected',
            'province' => 'Luanda',
            'municipality' => 'Viana',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'case' => [
                    'id',
                    'patient_code',
                    'patient_name',
                    'disease',
                ],
            ]);

        $this->assertDatabaseHas('cases', [
            'patient_name' => 'John Doe',
            'province' => 'Luanda',
        ]);
    }

    public function test_public_user_cannot_create_case(): void
    {
        $response = $this->actingAs($this->publicUser)->postJson('/api/cases', [
            'disease_id' => $this->disease->id,
            'patient_name' => 'John Doe',
            'patient_dob' => '1990-01-15',
            'patient_gender' => 'M',
            'symptoms_reported' => 'Fever',
            'symptom_onset_date' => now()->format('Y-m-d'),
            'diagnosis_date' => now()->format('Y-m-d'),
            'province' => 'Luanda',
            'municipality' => 'Viana',
        ]);

        $response->assertStatus(403);
    }

    public function test_health_professional_can_list_cases(): void
    {
        // Create some cases
        DiseaseCase::factory()->count(5)->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->healthProfessional->id,
        ]);

        $response = $this->actingAs($this->healthProfessional)->getJson('/api/cases');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
                'total',
            ]);
    }

    public function test_case_status_change_creates_history(): void
    {
        $case = DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->healthProfessional->id,
            'status' => 'suspected',
        ]);

        $response = $this->actingAs($this->healthProfessional)->putJson("/api/cases/{$case->id}", [
            'status' => 'confirmed',
            'status_notes' => 'Test confirmed positive',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('case_histories', [
            'case_id' => $case->id,
            'previous_status' => 'suspected',
            'new_status' => 'confirmed',
        ]);
    }

    public function test_masked_id_number_in_response(): void
    {
        $case = DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->healthProfessional->id,
            'patient_id_number' => '001234567LA001',
        ]);

        $response = $this->actingAs($this->healthProfessional)->getJson("/api/cases/{$case->id}");

        $response->assertStatus(200);

        // Full ID should not be exposed
        $this->assertStringNotContainsString('001234567LA001', json_encode($response->json()));
        
        // Masked version should be present (starts with ****)
        $maskedId = $response->json('masked_id_number');
        $this->assertNotNull($maskedId);
        $this->assertStringStartsWith('****', $maskedId);
    }

    public function test_filter_cases_by_province(): void
    {
        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->healthProfessional->id,
            'province' => 'Luanda',
        ]);

        DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->healthProfessional->id,
            'province' => 'Benguela',
        ]);

        $response = $this->actingAs($this->healthProfessional)
            ->getJson('/api/cases?province=Luanda');

        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('total'));
    }

    public function test_soft_delete_case(): void
    {
        $case = DiseaseCase::factory()->create([
            'disease_id' => $this->disease->id,
            'user_id' => $this->healthProfessional->id,
        ]);

        $response = $this->actingAs($this->healthProfessional)
            ->deleteJson("/api/cases/{$case->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('cases', ['id' => $case->id]);
    }
}
