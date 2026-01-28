<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $healthProfessional;
    private User $publicUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->healthProfessional = User::factory()->create(['role' => 'health_professional']);
        $this->publicUser = User::factory()->create(['role' => 'public']);
    }

    // ============ ADMIN ONLY ROUTES ============

    public function test_admin_can_access_admin_routes(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/api/diseases', [
            'name' => 'New Disease',
            'code' => 'NEW01',
        ]);

        $response->assertStatus(201);
    }

    public function test_health_professional_cannot_create_disease(): void
    {
        $response = $this->actingAs($this->healthProfessional)->postJson('/api/diseases', [
            'name' => 'New Disease',
            'code' => 'NEW01',
        ]);

        $response->assertStatus(403);
    }

    public function test_public_user_cannot_create_disease(): void
    {
        $response = $this->actingAs($this->publicUser)->postJson('/api/diseases', [
            'name' => 'New Disease',
            'code' => 'NEW01',
        ]);

        $response->assertStatus(403);
    }

    // ============ HEALTH PROFESSIONAL ROUTES ============

    public function test_health_professional_can_access_stats(): void
    {
        $response = $this->actingAs($this->healthProfessional)->getJson('/api/stats/dashboard');

        $response->assertStatus(200);
    }

    public function test_public_user_cannot_access_stats(): void
    {
        $response = $this->actingAs($this->publicUser)->getJson('/api/stats/dashboard');

        $response->assertStatus(403);
    }

    // ============ PUBLIC ROUTES ============

    public function test_public_routes_accessible_without_auth(): void
    {
        $response = $this->getJson('/api/public/diseases');
        $response->assertStatus(200);

        $response = $this->getJson('/api/public/alerts');
        $response->assertStatus(200);

        $response = $this->getJson('/api/public/content');
        $response->assertStatus(200);
    }

    public function test_authenticated_public_can_list_diseases(): void
    {
        $response = $this->actingAs($this->publicUser)->getJson('/api/diseases');

        $response->assertStatus(200);
    }

    // ============ RATE LIMITING ============

    public function test_auth_endpoints_are_rate_limited(): void
    {
        // Make 11 requests (limit is 10)
        for ($i = 0; $i < 11; $i++) {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'fake@email.com',
                'password' => 'password',
            ]);
        }

        // The 11th should be rate limited
        $response->assertStatus(429);
    }
}
