<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // URL do frontend para redefinir senha
        $url = env('FRONTEND_URL', 'http://localhost:3000') . '/redefinir-senha?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('ProMed - Recuperação de Senha')
            ->greeting('Olá, ' . $notifiable->name . '!')
            ->line('Você está recebendo este email porque recebemos uma solicitação de recuperação de senha para sua conta.')
            ->action('Redefinir Senha', $url)
            ->line('Este link expira em 60 minutos.')
            ->line('Se você não solicitou a recuperação de senha, nenhuma ação é necessária.')
            ->salutation('Atenciosamente, Equipe ProMed');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}