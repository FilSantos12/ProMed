<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'exists:users,id'],
            'day_of_week' => ['required', 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'slot_duration' => ['nullable', 'integer', 'min:15', 'max:120'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'doctor_id.required' => 'O médico é obrigatório.',
            'doctor_id.exists' => 'Médico não encontrado.',
            'day_of_week.required' => 'O dia da semana é obrigatório.',
            'day_of_week.in' => 'Dia da semana inválido.',
            'start_time.required' => 'O horário de início é obrigatório.',
            'start_time.date_format' => 'Formato de horário inválido (use HH:MM).',
            'end_time.required' => 'O horário de término é obrigatório.',
            'end_time.date_format' => 'Formato de horário inválido (use HH:MM).',
            'end_time.after' => 'O horário de término deve ser após o horário de início.',
            'slot_duration.integer' => 'A duração do slot deve ser um número.',
            'slot_duration.min' => 'A duração mínima do slot é 15 minutos.',
            'slot_duration.max' => 'A duração máxima do slot é 120 minutos.',
        ];
    }
}