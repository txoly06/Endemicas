<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = app(AuthService::class);
    }

    public function test_register_creates_user_and_returns_tokens(): void
    {
        $result = $this->authService->register([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'role' => 'public',
        ]);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('refresh_token', $result);
        $this->assertArrayHasKey('expires_in', $result);

        $this->assertEquals('test@example.com', $result['user']->email);
        $this->assertEquals('public', $result['user']->role);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'public',
        ]);
    }

    public function test_register_defaults_to_public_role(): void
    {
        $result = $this->authService->register([
            'name' => 'Test User',
            'email' => 'test2@example.com',
            'password' => 'password123',
        ]);

        $this->assertEquals('public', $result['user']->role);
    }

    public function test_login_returns_tokens_for_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $result = $this->authService->login('test@example.com', 'password123');

        $this->assertArrayHasKey('access_token', $result);
        $this->assertArrayHasKey('refresh_token', $result);
        $this->assertEquals('test@example.com', $result['user']->email);
    }

    public function test_login_throws_exception_for_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->expectException(ValidationException::class);

        $this->authService->login('test@example.com', 'wrongpassword');
    }

    public function test_login_throws_exception_for_nonexistent_user(): void
    {
        $this->expectException(ValidationException::class);

        $this->authService->login('nonexistent@example.com', 'password123');
    }

    public function test_refresh_token_returns_new_tokens(): void
    {
        $user = User::factory()->create();
        
        // Login to get tokens
        $loginResult = $this->authService->login($user->email, 'password');
        
        // Refresh
        $refreshResult = $this->authService->refreshToken($loginResult['refresh_token']);

        $this->assertArrayHasKey('access_token', $refreshResult);
        $this->assertArrayHasKey('refresh_token', $refreshResult);
        
        // New tokens should be different
        $this->assertNotEquals($loginResult['access_token'], $refreshResult['access_token']);
        $this->assertNotEquals($loginResult['refresh_token'], $refreshResult['refresh_token']);
    }

    public function test_refresh_token_invalidates_old_tokens(): void
    {
        $user = User::factory()->create();
        
        $loginResult = $this->authService->login($user->email, 'password');
        $oldRefreshToken = $loginResult['refresh_token'];
        
        // Refresh once
        $this->authService->refreshToken($oldRefreshToken);
        
        // Try to use old refresh token again
        $this->expectException(ValidationException::class);
        $this->authService->refreshToken($oldRefreshToken);
    }

    public function test_revoke_all_tokens_deletes_all_user_tokens(): void
    {
        $user = User::factory()->create();
        
        // Create multiple tokens
        $this->authService->login($user->email, 'password');
        $this->authService->login($user->email, 'password');
        
        $this->assertGreaterThan(0, $user->tokens()->count());
        
        // Revoke all
        $this->authService->revokeAllTokens($user);
        
        $this->assertEquals(0, $user->tokens()->count());
    }
}
