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

// Public routes (no authentication required)
Route::prefix('public')->group(function () {
    Route::get('/alerts', [AlertController::class, 'active']);
    Route::get('/content', [EducationalContentController::class, 'index']);
    Route::get('/content/{slug}', [EducationalContentController::class, 'show']);
    Route::get('/diseases', [DiseaseController::class, 'index']);
});

// Authentication routes with rate limiting
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/revoke-all', [AuthController::class, 'revokeAll']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {

    // ==================================================
    // ADMIN ONLY ROUTES
    // ==================================================
    Route::middleware('role:admin')->group(function () {
        // Disease Management (Admin only can create/update/delete)
        Route::post('/diseases', [DiseaseController::class, 'store']);
        Route::put('/diseases/{disease}', [DiseaseController::class, 'update']);
        Route::delete('/diseases/{disease}', [DiseaseController::class, 'destroy']);

        // Alert Management (Admin only)
        Route::post('/alerts', [AlertController::class, 'store']);
        Route::put('/alerts/{alert}', [AlertController::class, 'update']);
        Route::delete('/alerts/{alert}', [AlertController::class, 'destroy']);

        // Educational Content Management (Admin only)
        Route::get('/admin/content', [EducationalContentController::class, 'adminIndex']);
        Route::post('/content', [EducationalContentController::class, 'store']);
        Route::put('/content/{content}', [EducationalContentController::class, 'update']);
        Route::delete('/content/{content}', [EducationalContentController::class, 'destroy']);
    });

    // ==================================================
    // ADMIN + HEALTH PROFESSIONAL ROUTES
    // ==================================================
    Route::middleware('role:admin,health_professional')->group(function () {
        // Cases CRUD (Health professionals can manage cases)
        Route::apiResource('cases', CaseController::class);
        Route::get('/cases/{case}/history', [CaseController::class, 'history']);

        // Disease/Alert Read (can view details)
        Route::get('/diseases/{disease}', [DiseaseController::class, 'show']);
        Route::get('/alerts', [AlertController::class, 'index']);
        Route::get('/alerts/{alert}', [AlertController::class, 'show']);

        // Reports (PDF/CSV)
        Route::prefix('reports')->group(function () {
            Route::get('/cases/pdf', [App\Http\Controllers\Api\ReportController::class, 'casesReport']);
            Route::get('/cases/csv', [App\Http\Controllers\Api\ReportController::class, 'exportCsv']);
            Route::get('/patient-card/{case}', [App\Http\Controllers\Api\ReportController::class, 'patientCard']);
        });

        // Statistics (for dashboard)
        Route::prefix('stats')->group(function () {
            Route::get('/dashboard', [StatsController::class, 'dashboard']);
            Route::get('/cases-by-disease', [StatsController::class, 'casesByDisease']);
            Route::get('/cases-by-province', [StatsController::class, 'casesByProvince']);
            Route::get('/cases-by-status', [StatsController::class, 'casesByStatus']);
            Route::get('/timeline', [StatsController::class, 'timeline']);
            Route::get('/geographic', [StatsController::class, 'geographic']);
            Route::get('/cases-by-age', [StatsController::class, 'casesByAgeGroup']);
            Route::get('/cases-by-gender', [StatsController::class, 'casesByGender']);
        });
    });

    // ==================================================
    // ALL AUTHENTICATED USERS (including public)
    // ==================================================
    Route::get('/diseases', [DiseaseController::class, 'index']);
});
