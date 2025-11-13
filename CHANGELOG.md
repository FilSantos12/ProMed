# Changelog

## [0.1.0] - 10-11-2025

### Adicionado
- Estrutura completa do backend Laravel 11
- Banco de dados MySQL com 8 tabelas (users, doctors, patients, specialties, appointments, schedules, medical_records, personal_access_tokens)
- 7 Models Eloquent com relacionamentos
- Controllers: AuthController, DoctorController, AppointmentController, SpecialtyController
- Autenticação JWT com Laravel Sanctum
- Rotas API REST (públicas e protegidas)
- Seeders de especialidades médicas
- Configuração CORS
- Usuário admin padrão

### Tecnologias
- Laravel 11
- PHP 8.2
- MySQL 8.0
- Laravel Sanctum
- React + TypeScript (frontend)

### Endpoints Implementados
- POST /api/v1/login - Autenticação
- POST /api/v1/register - Cadastro de pacientes
- GET /api/v1/specialties - Listar especialidades
- GET /api/v1/doctors - Listar médicos
- GET /api/v1/appointments - Gerenciar agendamentos
- GET /api/v1/me - Dados do usuário autenticado