<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        \Log::info('CreateAppointmentRequest - Request data: ' . json_encode($this->all()));
        return true;
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        \Log::error('CreateAppointmentRequest - Validation failed: ' . json_encode($validator->errors()->toArray()));
        parent::failedValidation($validator);
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:users,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'specialty_id' => ['nullable', 'exists:specialties,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'patient_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required' => 'O paciente é obrigatório.',
            'patient_id.exists' => 'Paciente não encontrado.',
            'doctor_id.required' => 'O médico é obrigatório.',
            'doctor_id.exists' => 'Médico não encontrado.',
            'specialty_id.exists' => 'Especialidade não encontrada.',
            'appointment_date.required' => 'A data da consulta é obrigatória.',
            'appointment_date.date' => 'Data inválida.',
            'appointment_date.after_or_equal' => 'A data deve ser hoje ou no futuro.',
            'appointment_time.required' => 'O horário da consulta é obrigatório.',
            'appointment_time.date_format' => 'Formato de horário inválido (use HH:MM).',
            'patient_notes.max' => 'As observações não podem ter mais de 1000 caracteres.',
        ];
    }

    /**
     * Validação adicional
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Verificar se o horário já está ocupado
            $exists = \App\Models\Appointment::where('doctor_id', $this->doctor_id)
                ->where('appointment_date', $this->appointment_date)
                ->where('appointment_time', $this->appointment_time)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists();

            if ($exists) {
                $validator->errors()->add('appointment_time', 'Este horário já está ocupado.');
            }
        });
    }
}