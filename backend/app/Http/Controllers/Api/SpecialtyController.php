<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    /**
     * Listar todas as especialidades
     */
    public function index(Request $request)
    {
        // Se for admin, mostrar todas (incluindo inativas)
        // Se for público, mostrar apenas ativas
        $query = Specialty::query();

        // Verifica se a requisição vem de um admin autenticado
        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin';

        if (!$isAdmin) {
            $query->where('is_active', true);
        }

        $specialties = $query
            ->withCount('doctors')
            ->orderBy('name')
            ->get();

        return response()->json($specialties);
    }

    /**
     * Exibir uma especialidade específica
     */
    public function show($id)
    {
        $specialty = Specialty::with(['doctors.user'])
            ->findOrFail($id);

        return response()->json($specialty);
    }

    /**
     * Criar especialidade (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);

        $specialty = Specialty::create($request->all());

        return response()->json([
            'message' => 'Especialidade criada com sucesso!',
            'specialty' => $specialty,
        ], 201);
    }

    /**
     * Atualizar especialidade (Admin only)
     */
    public function update(Request $request, $id)
    {
        $specialty = Specialty::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $specialty->update($request->all());

        return response()->json([
            'message' => 'Especialidade atualizada com sucesso!',
            'specialty' => $specialty,
        ]);
    }

    /**
     * Deletar especialidade (Admin only)
     */
    public function destroy($id)
    {
        $specialty = Specialty::findOrFail($id);
        
        if ($specialty->doctors()->exists()) {
            return response()->json([
                'message' => 'Não é possível deletar uma especialidade com médicos cadastrados.'
            ], 422);
        }

        $specialty->delete();

        return response()->json([
            'message' => 'Especialidade deletada com sucesso!',
        ]);
    }
}