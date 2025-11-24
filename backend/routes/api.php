<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\SpecialtyController; // ← ADICIONAR

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
});

Route::prefix('v1')->group(function () {
    // ==========================================
    // ROTAS PÚBLICAS (sem autenticação)
    // ==========================================
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Especialidades - PÚBLICA (para formulário de cadastro)
    Route::get('/specialties', [SpecialtyController::class, 'index']);
    
    // ==========================================
    // ROTAS PROTEGIDAS (requer autenticação)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        
        // Doctors
        Route::get('/doctors', [DoctorController::class, 'index']);
        Route::get('/doctors/{id}', [DoctorController::class, 'show']);
        
        // Appointments
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::post('/appointments', [AppointmentController::class, 'store']);
        Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
        Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
        Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
        
        // ==========================================
        // ROTAS DE ADMIN
        // ==========================================
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/doctors', [DoctorController::class, 'adminIndex']);
            Route::put('/doctors/{id}/approve', [DoctorController::class, 'approve']);
            Route::put('/doctors/{id}/reject', [DoctorController::class, 'reject']);
        });
    });
});