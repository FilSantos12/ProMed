<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Solicitar recuperação de senha
     * Envia email com token de recuperação
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        try {
            $email = $request->email;

            // Buscar usuário
            $user = User::where('email', $email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Email não encontrado no sistema.'
                ], 404);
            }

            // Gerar token único
            $token = Str::random(60);

            // Deletar tokens antigos deste email
            DB::table('password_reset_tokens')
                ->where('email', $email)
                ->delete();

            // Criar novo token
            DB::table('password_reset_tokens')->insert([
                'email' => $email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            // Enviar email com token
            $user->notify(new ResetPasswordNotification($token));

            return response()->json([
                'message' => 'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao processar solicitação. Tente novamente.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Redefinir senha com token
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        try {
            $email = $request->email;
            $token = $request->token;
            $newPassword = $request->password;

            // Buscar token no banco
            $passwordReset = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->first();

            if (!$passwordReset) {
                return response()->json([
                    'message' => 'Token de recuperação não encontrado ou expirado.'
                ], 404);
            }

            // Verificar se token é válido
            if (!Hash::check($token, $passwordReset->token)) {
                return response()->json([
                    'message' => 'Token inválido.'
                ], 400);
            }

            // Verificar se token expirou (60 minutos)
            $createdAt = \Carbon\Carbon::parse($passwordReset->created_at);
            if ($createdAt->addMinutes(60)->isPast()) {
                // Deletar token expirado
                DB::table('password_reset_tokens')->where('email', $email)->delete();

                return response()->json([
                    'message' => 'Token expirado. Solicite um novo link de recuperação.'
                ], 400);
            }

            // Atualizar senha do usuário
            $user = User::where('email', $email)->first();
            $user->password = Hash::make($newPassword);
            $user->save();

            // Deletar token usado
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return response()->json([
                'message' => 'Senha redefinida com sucesso! Você já pode fazer login.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao redefinir senha. Tente novamente.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar se token é válido (opcional - para validar antes de mostrar formulário)
     */
    public function verifyToken(Request $request)
    {
        $email = $request->email;
        $token = $request->token;

        $passwordReset = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$passwordReset) {
            return response()->json([
                'valid' => false,
                'message' => 'Token não encontrado.'
            ], 404);
        }

        if (!Hash::check($token, $passwordReset->token)) {
            return response()->json([
                'valid' => false,
                'message' => 'Token inválido.'
            ], 400);
        }

        // Verificar expiração
        $createdAt = \Carbon\Carbon::parse($passwordReset->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'Token expirado.'
            ], 400);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Token válido.'
        ], 200);
    }
}