<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appointment_date' => ['nullable', 'date', 'after_or_equal:today'],
            'appointment_time' => ['nullable', 'date_format:H:i'],
            'status' => ['nullable', 'in:pending,confirmed,completed,cancelled,no_show'],
            'patient_notes' => ['nullable', 'string', 'max:1000'],
            'doctor_notes' => ['nullable', 'string', 'max:2000'],
            'cancellation_reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'appointment_date.date' => 'Data inválida.',
            'appointment_date.after_or_equal' => 'A data deve ser hoje ou no futuro.',
            'appointment_time.date_format' => 'Formato de horário inválido (use HH:MM).',
            'status.in' => 'Status inválido.',
            'patient_notes.max' => 'As observações do paciente não podem ter mais de 1000 caracteres.',
            'doctor_notes.max' => 'As observações do médico não podem ter mais de 2000 caracteres.',
            'cancellation_reason.max' => 'O motivo de cancelamento não pode ter mais de 500 caracteres.',
        ];
    }
}