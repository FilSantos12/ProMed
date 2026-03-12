<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\SpecialtyController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DoctorProfileController;
use App\Http\Controllers\Api\PatientProfileController;
use App\Http\Controllers\Api\AdvertisementController;
use App\Http\Controllers\Api\CarouselSlideController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health check (sem prefixo)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
});

// ========================================
// ROTAS PÚBLICAS (sem autenticação)
// ========================================
Route::prefix('v1')->group(function () {
    
    // Auth (com rate limiting para prevenir brute-force)
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:3,5');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');
    
    // Especialidades - PÚBLICA
    Route::get('/specialties/available', [SpecialtyController::class, 'available']);
    Route::get('/specialties', [SpecialtyController::class, 'index']);

    // Médicos - PÚBLICO (para visualização em agendamentos)
    Route::get('/doctors', [DoctorController::class, 'index']);
    Route::get('/doctors/{id}', [DoctorController::class, 'show']);

    // Carrossel - PÚBLICO (usado na HomePage)
    Route::get('/carousel-slides', [CarouselSlideController::class, 'index']);

    // Horários - PÚBLICO (para visualização em agendamentos)
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::get('/schedules/{id}', [ScheduleController::class, 'show']);
    Route::get('/schedules/{id}/slots', [ScheduleController::class, 'getAvailableSlots']);

    // Rotas públicas de documentos (com token na URL)
    Route::get('/public/doctors/{doctorId}/documents/{documentId}/view/{token}',
        [DoctorController::class, 'viewDocumentPublic']);
    Route::get('/public/doctors/{doctorId}/documents/{documentId}/download/{token}',
        [DoctorController::class, 'downloadDocumentPublic']);
});

// ========================================
// ROTAS PROTEGIDAS (requer autenticação)
// ========================================
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    
    // ========================================
    // AUTH (autenticado)
    // ========================================
    Route::post('/logout', [AuthController::class, 'logout']);

    // Anúncios - disponíveis para todos autenticados (médicos veem na home)
    Route::get('/advertisements', [AdvertisementController::class, 'index']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', [AuthController::class, 'user']);

    // ========================================
    // APPOINTMENTS (requer autenticação)
    // ========================================
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);

    // ========================================
    // SCHEDULES (gerenciamento - requer autenticação)
    // ========================================
    Route::post('/schedules', [ScheduleController::class, 'store']);
    Route::put('/schedules/{id}', [ScheduleController::class, 'update']);
    Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy']);
    
    // ========================================
    // ROTAS DE ADMIN
    // ========================================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        
        // ========================================
        // DASHBOARD
        // ========================================
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
        
        // ========================================
        // DOCTORS (Admin)
        // ========================================
        Route::get('/doctors', [DoctorController::class, 'adminIndex']); // Listar todos
        Route::get('/doctors/{id}', [DoctorController::class, 'show']); // Ver detalhes
        Route::put('/doctors/{id}', [DoctorController::class, 'update']); // Editar
        Route::put('/doctors/{id}/approve', [DoctorController::class, 'approve']); // Aprovar
        Route::put('/doctors/{id}/reject', [DoctorController::class, 'reject']); // Rejeitar
        Route::patch('/doctors/{id}/toggle-status', [DoctorController::class, 'toggleStatus']); // Ativar/Desativar
        Route::get('/doctors/{id}/appointments', [DoctorController::class, 'appointments']); // Histórico
        
        // Documentos dos médicos
        Route::get('/doctors/{id}/documents', [DoctorController::class, 'documents']);
        Route::get('/doctors/{doctorId}/documents/{documentId}/view', [DoctorController::class, 'viewDocument']);
        Route::get('/doctors/{doctorId}/documents/{documentId}/download', [DoctorController::class, 'downloadDocument']);
        Route::put('/doctors/{doctorId}/documents/{documentId}/approve', [DoctorController::class, 'approveDocument']);
        Route::put('/doctors/{doctorId}/documents/{documentId}/reject', [DoctorController::class, 'rejectDocument']);

        // Solicitações de médicos pendentes
        Route::get('/doctors/pending', [\App\Http\Controllers\Api\DoctorApplicationController::class, 'getPendingDoctors']);
        Route::post('/doctors/{id}/approve', [\App\Http\Controllers\Api\DoctorApplicationController::class, 'approveDoctor']);
        Route::post('/doctors/{id}/reject', [\App\Http\Controllers\Api\DoctorApplicationController::class, 'rejectDoctor']);

        // ========================================
        // PATIENTS (Admin)
        // ========================================
        Route::get('/patients', [PatientController::class, 'index']); // Listar todos
        Route::get('/patients/{id}', [PatientController::class, 'show']); // Ver detalhes
        Route::put('/patients/{id}', [PatientController::class, 'update']); // Editar
        Route::patch('/patients/{id}/toggle-status', [PatientController::class, 'toggleStatus']); // Ativar/Desativar
        Route::get('/patients/{id}/appointments', [PatientController::class, 'appointments']); // Histórico
        
        // ========================================
        // APPOINTMENTS (Admin)
        // ========================================
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::post('/appointments', [AppointmentController::class, 'store']);
        Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
        Route::put('/appointments/{id}', [AppointmentController::class, 'update']);
        Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);
        Route::post('/appointments/{id}/confirm', [AppointmentController::class, 'confirm']);
        Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);
        Route::post('/appointments/{id}/complete', [AppointmentController::class, 'complete']);
        Route::post('/appointments/{id}/reschedule', [AppointmentController::class, 'reschedule']);
        Route::get('/appointments-statistics', [AppointmentController::class, 'statistics']);

        // ========================================
        // SPECIALTIES (Admin)
        // ========================================
        Route::get('/specialties', [SpecialtyController::class, 'index']); // Listar todas
        Route::post('/specialties', [SpecialtyController::class, 'store']); // Criar
        Route::get('/specialties/{id}', [SpecialtyController::class, 'show']); // Ver detalhes
        Route::put('/specialties/{id}', [SpecialtyController::class, 'update']); // Editar
        Route::delete('/specialties/{id}', [SpecialtyController::class, 'destroy']); // Deletar

        // ========================================
        // CAROUSEL SLIDES (Admin)
        // ========================================
        Route::get('/carousel-slides', [CarouselSlideController::class, 'adminIndex']);
        Route::post('/carousel-slides', [CarouselSlideController::class, 'store']);
        Route::put('/carousel-slides/{id}', [CarouselSlideController::class, 'update']);
        Route::delete('/carousel-slides/{id}', [CarouselSlideController::class, 'destroy']);
        Route::patch('/carousel-slides/{id}/toggle-status', [CarouselSlideController::class, 'toggleStatus']);

        // ========================================
        // ADVERTISEMENTS (Admin)
        // ========================================
        Route::get('/advertisements', [AdvertisementController::class, 'adminIndex']);
        Route::post('/advertisements', [AdvertisementController::class, 'store']);
        Route::put('/advertisements/{id}', [AdvertisementController::class, 'update']);
        Route::delete('/advertisements/{id}', [AdvertisementController::class, 'destroy']);
        Route::patch('/advertisements/{id}/toggle-status', [AdvertisementController::class, 'toggleStatus']);
    });

    // ============================================
    // ROTAS DA ÁREA DO MÉDICO (role: doctor)
    // ============================================
    Route::middleware('role:doctor')->prefix('doctor')->group(function () {

        // Perfil
        Route::get('/profile', [DoctorProfileController::class, 'show']);
        Route::put('/profile', [DoctorProfileController::class, 'update']);
        Route::post('/profile/avatar', [DoctorProfileController::class, 'uploadAvatar']);
        Route::post('/profile/change-password', [DoctorProfileController::class, 'changePassword']);

        // Horários
        Route::get('/schedules', [DoctorProfileController::class, 'getSchedules']);
        Route::post('/schedules', [DoctorProfileController::class, 'addSchedule']);
        Route::put('/schedules/{scheduleId}', [DoctorProfileController::class, 'updateSchedule']);
        Route::delete('/schedules/{scheduleId}', [DoctorProfileController::class, 'deleteSchedule']);

        // Documentos
        Route::get('/documents', [DoctorProfileController::class, 'getDocuments']);
        Route::post('/documents', [DoctorProfileController::class, 'uploadDocument']);
        Route::delete('/documents/{documentId}', [DoctorProfileController::class, 'deleteDocument']);
    });

    // ============================================
    // ROTAS DA ÁREA DO PACIENTE (role: patient)
    // ============================================
    Route::middleware('role:patient')->prefix('patient')->group(function () {

        // Perfil
        Route::get('/profile', [PatientProfileController::class, 'show']);
        Route::put('/profile', [PatientProfileController::class, 'update']);
        Route::post('/profile/avatar', [PatientProfileController::class, 'uploadAvatar']);
        Route::post('/profile/change-password', [PatientProfileController::class, 'changePassword']);

        // Consultas
        Route::get('/appointments', [PatientProfileController::class, 'getAppointments']);
        Route::get('/appointments/upcoming', [PatientProfileController::class, 'getUpcomingAppointments']);
        Route::post('/appointments/{appointmentId}/cancel', [PatientProfileController::class, 'cancelAppointment']);

        // Prontuários Médicos
        Route::get('/medical-records', [PatientProfileController::class, 'getMedicalRecords']);

        // Estatísticas
        Route::get('/stats', [PatientProfileController::class, 'getStats']);

        // Solicitação para se tornar médico
        Route::post('/apply-as-doctor', [\App\Http\Controllers\Api\DoctorApplicationController::class, 'applyAsDoctor']);
        Route::get('/doctor-application-status', [\App\Http\Controllers\Api\DoctorApplicationController::class, 'checkApplicationStatus']);
    });

    // ========================================
    // ROTAS DE GERENCIAMENTO DE PERFIL (Todos os usuários autenticados)
    // ========================================
    Route::prefix('user')->group(function () {
        Route::post('/switch-profile', [\App\Http\Controllers\Api\UserProfileController::class, 'switchProfile']);
        Route::get('/available-profiles', [\App\Http\Controllers\Api\UserProfileController::class, 'getAvailableProfiles']);
    });

});