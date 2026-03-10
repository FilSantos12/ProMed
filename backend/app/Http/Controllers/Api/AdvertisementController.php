<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    /**
     * Lista anúncios ativos filtrados pelo role do usuário autenticado.
     */
    public function index(Request $request)
    {
        $role = $request->user()->role ?? 'patient';

        // Mapeia role do sistema para o valor de target_audience
        $audience = $role === 'doctor' ? 'medico' : 'paciente';

        $ads = Advertisement::active()
            ->where(function ($q) use ($audience) {
                $q->where('target_audience', 'todos')
                  ->orWhere('target_audience', $audience);
            })
            ->orderBy('order')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($ads);
    }

    /**
     * Lista todos os anúncios (admin).
     */
    public function adminIndex()
    {
        $ads = Advertisement::orderBy('order')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($ads);
    }

    /**
     * Criar anúncio (admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url'   => 'nullable|url|max:500',
            'link_url'    => 'nullable|url|max:500',
            'link_text'   => 'nullable|string|max:100',
            'category'         => 'required|in:medicamento,campanha,dispositivo,educacao,outro',
            'target_audience'  => 'sometimes|in:medico,paciente,todos',
            'is_active'        => 'boolean',
            'starts_at'        => 'nullable|date',
            'ends_at'          => 'nullable|date|after_or_equal:starts_at',
            'order'            => 'integer|min:0',
        ]);

        $ad = Advertisement::create($request->all());

        return response()->json([
            'message'       => 'Anúncio criado com sucesso!',
            'advertisement' => $ad,
        ], 201);
    }

    /**
     * Atualizar anúncio (admin).
     */
    public function update(Request $request, $id)
    {
        $ad = Advertisement::findOrFail($id);

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image_url'   => 'nullable|url|max:500',
            'link_url'    => 'nullable|url|max:500',
            'link_text'   => 'nullable|string|max:100',
            'category'        => 'sometimes|in:medicamento,campanha,dispositivo,educacao,outro',
            'target_audience' => 'sometimes|in:medico,paciente,todos',
            'is_active'       => 'boolean',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date',
            'order'       => 'integer|min:0',
        ]);

        $ad->update($request->all());

        return response()->json([
            'message'       => 'Anúncio atualizado com sucesso!',
            'advertisement' => $ad,
        ]);
    }

    /**
     * Deletar anúncio (admin).
     */
    public function destroy($id)
    {
        $ad = Advertisement::findOrFail($id);
        $ad->delete();

        return response()->json(['message' => 'Anúncio removido com sucesso!']);
    }

    /**
     * Ativar/desativar anúncio (admin).
     */
    public function toggleStatus($id)
    {
        $ad = Advertisement::findOrFail($id);
        $ad->update(['is_active' => !$ad->is_active]);

        return response()->json([
            'message'       => $ad->is_active ? 'Anúncio ativado.' : 'Anúncio desativado.',
            'advertisement' => $ad,
        ]);
    }
}
