<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\NewAccessToken;

class AuthService
{
    private const ACCESS_TOKEN_EXPIRATION_MINUTES = 60;
    private const REFRESH_TOKEN_EXPIRATION_DAYS = 30;

    /*
    |--------------------------------------------------------------------------
    | REGISTO DE UTILIZADOR
    |--------------------------------------------------------------------------
    | 1. Cria o registo na tabela 'users'.
    | 2. Faz hash da password para segurança (nunca guardada em texto limpo).
    | 3. Gera tokens (acesso e refresh) para login imediato.
    | 4. Regista a ação no log de auditoria.
    */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'public',
            'phone' => $data['phone'] ?? null,
            'institution' => $data['institution'] ?? null,
        ]);

        $tokens = $this->createTokens($user);

        $this->logAuditAction('auth.register', $user);

        return [
            'user' => $user,
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'expires_in' => self::ACCESS_TOKEN_EXPIRATION_MINUTES * 60,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | LOGIN / AUTENTICAÇÃO
    |--------------------------------------------------------------------------
    | 1. Busca utilizador pelo email.
    | 2. Verifica se a senha corresponde ao hash guardado.
    | 3. Emite novos tokens se sucesso.
    | 4. Loga falhas para deteção de ataques de força bruta.
    */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        // Verificação segura de senha
        if (!$user || !Hash::check($password, $user->password)) {
            $this->logAuditAction('auth.login_failed', null, ['email' => $email]);
            
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $tokens = $this->createTokens($user);

        $this->logAuditAction('auth.login', $user);

        return [
            'user' => $user,
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'expires_in' => self::ACCESS_TOKEN_EXPIRATION_MINUTES * 60,
        ];
    }

    /**
     * Logout user by revoking current token
     */
    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();
        
        // TransientToken is used in tests with actingAs()
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }
        
        $this->logAuditAction('auth.logout', $user);
    }

    /**
     * Refresh access token using refresh token
     */
    public function refreshToken(string $refreshToken): array
    {
        // Find the refresh token
        $token = \Laravel\Sanctum\PersonalAccessToken::findToken($refreshToken);

        if (!$token) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Invalid refresh token.'],
            ]);
        }

        // Check if it's a refresh token
        if ($token->name !== 'refresh-token') {
            throw ValidationException::withMessages([
                'refresh_token' => ['Invalid token type.'],
            ]);
        }

        // Check if expired
        $expiresAt = $token->created_at->addDays(self::REFRESH_TOKEN_EXPIRATION_DAYS);
        if (now()->isAfter($expiresAt)) {
            $token->delete();
            throw ValidationException::withMessages([
                'refresh_token' => ['Refresh token has expired.'],
            ]);
        }

        $user = $token->tokenable;

        // Delete old refresh token
        $token->delete();

        // Delete all old access tokens
        $user->tokens()->where('name', 'access-token')->delete();

        // Create new tokens
        $tokens = $this->createTokens($user);

        $this->logAuditAction('auth.token_refreshed', $user);

        return [
            'user' => $user,
            'access_token' => $tokens['access_token'],
            'refresh_token' => $tokens['refresh_token'],
            'expires_in' => self::ACCESS_TOKEN_EXPIRATION_MINUTES * 60,
        ];
    }

    /**
     * Revoke all tokens for user (full logout)
     */
    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
        
        $this->logAuditAction('auth.revoke_all', $user);
    }

    /**
     * Create access and refresh tokens
     */
    private function createTokens(User $user): array
    {
        // Create access token with expiration
        $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(self::ACCESS_TOKEN_EXPIRATION_MINUTES));
        
        // Create refresh token (longer lived)
        $refreshToken = $user->createToken('refresh-token', ['refresh']);

        return [
            'access_token' => $accessToken->plainTextToken,
            'refresh_token' => $refreshToken->plainTextToken,
        ];
    }

    /**
     * Log audit action for auth events
     */
    private function logAuditAction(string $action, ?User $user, array $context = []): void
    {
        Log::channel('audit')->info($action, array_merge([
            'user_id' => $user?->id,
            'user_email' => $user?->email ?? $context['email'] ?? null,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ], $context));
    }
}
