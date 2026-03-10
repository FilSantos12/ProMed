<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarouselSlide;
use Illuminate\Http\Request;

class CarouselSlideController extends Controller
{
    /**
     * Lista slides ativos (público — usado na HomePage).
     */
    public function index()
    {
        $slides = CarouselSlide::active()
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();

        return response()->json($slides);
    }

    /**
     * Lista todos os slides (admin).
     */
    public function adminIndex()
    {
        $slides = CarouselSlide::orderBy('order')
            ->orderBy('created_at')
            ->get();

        return response()->json($slides);
    }

    /**
     * Criar slide (admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'image_url'   => 'required|string|max:500',
            'link_url'    => 'nullable|url|max:500',
            'is_active'   => 'boolean',
            'order'       => 'integer|min:0',
        ]);

        $slide = CarouselSlide::create($request->all());

        return response()->json([
            'message' => 'Slide criado com sucesso!',
            'slide'   => $slide,
        ], 201);
    }

    /**
     * Atualizar slide (admin).
     */
    public function update(Request $request, $id)
    {
        $slide = CarouselSlide::findOrFail($id);

        $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:255',
            'image_url'   => 'sometimes|string|max:500',
            'link_url'    => 'nullable|url|max:500',
            'is_active'   => 'boolean',
            'order'       => 'integer|min:0',
        ]);

        $slide->update($request->all());

        return response()->json([
            'message' => 'Slide atualizado com sucesso!',
            'slide'   => $slide,
        ]);
    }

    /**
     * Deletar slide (admin).
     */
    public function destroy($id)
    {
        CarouselSlide::findOrFail($id)->delete();

        return response()->json(['message' => 'Slide removido com sucesso!']);
    }

    /**
     * Ativar/desativar slide (admin).
     */
    public function toggleStatus($id)
    {
        $slide = CarouselSlide::findOrFail($id);
        $slide->update(['is_active' => !$slide->is_active]);

        return response()->json([
            'message' => $slide->is_active ? 'Slide ativado.' : 'Slide desativado.',
            'slide'   => $slide,
        ]);
    }
}
