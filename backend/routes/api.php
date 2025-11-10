<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\SpecialtyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rotas públicas
Route::prefix('v1')->group(function () {
    
    // Autenticação
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    
    // Especialidades (público)
    Route::get('/specialties', [SpecialtyController::class, 'index']);
    Route::get('/specialties/{id}', [SpecialtyController::class, 'show']);
    
    // Médicos (público - para busca)
    Route::get('/doctors', [DoctorController::class, 'index']);
    Route::get('/doctors/{id}', [DoctorController::class, 'show']);
    
    // Horários disponíveis
    Route::get('/doctors/{id}/available-slots', [AppointmentController::class, 'availableSlots']);
});

// Rotas protegidas (requer autenticação)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Agendamentos
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
    Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
    
    // Médicos (área do médico)
    Route::get('/doctors/{id}/appointments', [DoctorController::class, 'appointments']);
    Route::get('/doctors/{id}/dashboard', [DoctorController::class, 'dashboard']);
    Route::put('/doctors/{id}', [DoctorController::class, 'update']);
    
    // Admin apenas
    Route::middleware('role:admin')->group(function () {
        Route::post('/admin/doctors', [AuthController::class, 'registerDoctor']);
        Route::post('/specialties', [SpecialtyController::class, 'store']);
        Route::put('/specialties/{id}', [SpecialtyController::class, 'update']);
        Route::delete('/specialties/{id}', [SpecialtyController::class, 'destroy']);
    });
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});