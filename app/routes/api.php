<?php

use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CaseController;
use App\Http\Controllers\Api\DiseaseController;
use App\Http\Controllers\Api\EducationalContentController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Sistema de Monitorização de Doenças Endémicas
| Authorization: role:admin, role:health_professional, role:public
|
*/


// ==================================================
// ROTAS PÚBLICAS (Acesso Livre)
// ==================================================
// Estas rotas não exigem login. São usadas pelo portal público ou para verificação simples.
Route::get('/alerts', [AlertController::class, 'index']); // Acesso temporário público para listar alertas ativos

Route::prefix('public')->group(function () {
    // Lista alertas ativos para o público em geral
    Route::get('/alerts', [AlertController::class, 'active']);
    // Lista conteúdo educativo aprovado
    Route::get('/content', [EducationalContentController::class, 'index']);
    Route::get('/content/{slug}', [EducationalContentController::class, 'show']);
    // Lista doenças monitoradas
    Route::get('/diseases', [DiseaseController::class, 'index']);
    // Verifica autenticidade do cartão de paciente via QR Code
    Route::get('/verify/{code}', [CaseController::class, 'verifyPublic']);
});

// ==================================================
// AUTENTICAÇÃO (Login, Registo, Logout)
// ==================================================
// Estas rotas lidam com a entrada e saída do sistema.
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']); // Criar conta
    Route::post('/login', [AuthController::class, 'login']);       // Entrar
    Route::post('/refresh', [AuthController::class, 'refresh']);   // Atualizar token expirado
    
    // Ações que exigem estar logado
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);       // Sair
        Route::post('/revoke-all', [AuthController::class, 'revokeAll']); // Sair de todos os dispositivos
        Route::get('/me', [AuthController::class, 'me']);                 // Meus dados
    });
});

// ==================================================
// ROTAS PROTEGIDAS (Exige Login)
// ==================================================
Route::middleware('auth:sanctum')->group(function () {

    // --------------------------------------------------
    // Apenas ADMINISTRADORES
    // --------------------------------------------------
    Route::middleware('role:admin')->group(function () {
        // Gerir Doenças (Criar, Editar, Apagar)
        Route::post('/diseases', [DiseaseController::class, 'store']);
        Route::put('/diseases/{disease}', [DiseaseController::class, 'update']);
        Route::delete('/diseases/{disease}', [DiseaseController::class, 'destroy']);

        // Gerir Alertas (Apenas admin pode lançar alertas oficiais)
        Route::post('/alerts', [AlertController::class, 'store']);
        Route::put('/alerts/{alert}', [AlertController::class, 'update']);
        Route::delete('/alerts/{alert}', [AlertController::class, 'destroy']);

        // Gerir Conteúdo Educativo (Apenas admin publica)
        Route::get('/admin/content', [EducationalContentController::class, 'adminIndex']);
        Route::post('/content', [EducationalContentController::class, 'store']);
        Route::put('/content/{content}', [EducationalContentController::class, 'update']);
        Route::delete('/content/{content}', [EducationalContentController::class, 'destroy']);

        // Gerir Utilizadores (Mudar permissões, remover contas)
        Route::get('/users', [App\Http\Controllers\Api\UserController::class, 'index']);
        Route::put('/users/{user}/role', [App\Http\Controllers\Api\UserController::class, 'updateRole']);
        Route::delete('/users/{user}', [App\Http\Controllers\Api\UserController::class, 'destroy']);
    });

    // --------------------------------------------------
    // ADMIN + PROFISSIONAIS DE SAÚDE
    // --------------------------------------------------
    Route::middleware('role:admin,health_professional')->group(function () {
        // Gestão de Casos (Registar doentes, atualizar estado)
        Route::apiResource('cases', CaseController::class);
        Route::get('/cases/{case}/history', [CaseController::class, 'history']); // Histórico clínico

        // Ver Detalhes (Leitura detalhada)
        Route::get('/diseases/{disease}', [DiseaseController::class, 'show']);
        Route::get('/alerts/{alert}', [AlertController::class, 'show']);

        // Relatórios e Exportação
        Route::prefix('reports')->group(function () {
            Route::get('/cases/pdf', [App\Http\Controllers\Api\ReportController::class, 'casesReport']);      // PDF Geral
            Route::get('/cases/csv', [App\Http\Controllers\Api\ReportController::class, 'exportCsv']);        // Exportar Excel/CSV
            Route::get('/patient-card/{case}', [App\Http\Controllers\Api\ReportController::class, 'patientCard']); // Ficha do Paciente
        });

        // Estatísticas para Dashboard
        Route::prefix('stats')->group(function () {
            Route::get('/dashboard', [StatsController::class, 'dashboard']); // Resumo geral (cards)
            Route::get('/cases-by-disease', [StatsController::class, 'casesByDisease']);
            Route::get('/cases-by-province', [StatsController::class, 'casesByProvince']);
            Route::get('/cases-by-status', [StatsController::class, 'casesByStatus']);
            Route::get('/timeline', [StatsController::class, 'timeline']);
            Route::get('/geographic', [StatsController::class, 'geographic']); // Dados para o Mapa
            Route::get('/cases-by-age', [StatsController::class, 'casesByAgeGroup']);
            Route::get('/cases-by-gender', [StatsController::class, 'casesByGender']);
        });
    });

    // --------------------------------------------------
    // TODOS OS UTILIZADORES LOGADOS
    // --------------------------------------------------
    Route::get('/diseases', [DiseaseController::class, 'index']); // Listar doenças disponíveis
});

