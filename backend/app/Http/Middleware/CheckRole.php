<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $user = $request->user();

        // Verificar active_role primeiro, se não existir, usar role
        $activeRole = $user->active_role ?? $user->role;

        // Também verificar se o usuário tem o role no array de roles (suporte multi-role)
        if ($activeRole !== $role && !$user->hasRole($role)) {
            return response()->json(['message' => 'Você não tem permissão para acessar este recurso.'], 403);
        }

        return $next($request);
    }
}