<?php

namespace App\Traits;

use Illuminate\Support\Facades\Crypt;

trait EncryptsAttributes
{
    /**
     * Boot do trait
     */
    public static function bootEncryptsAttributes()
    {
        static::saving(function ($model) {
            $model->encryptAttributes();
        });

        static::retrieved(function ($model) {
            $model->decryptAttributes();
        });
    }

    /**
     * Criptografar atributos antes de salvar
     */
    protected function encryptAttributes()
    {
        foreach ($this->encryptable as $attribute) {
            if (isset($this->attributes[$attribute]) && !empty($this->attributes[$attribute])) {
                // Verificar se já está criptografado (evitar dupla criptografia)
                if (!$this->isEncrypted($this->attributes[$attribute])) {
                    $this->attributes[$attribute] = Crypt::encryptString($this->attributes[$attribute]);
                }
            }
        }
    }

    /**
     * Descriptografar atributos ao recuperar
     */
    protected function decryptAttributes()
    {
        foreach ($this->encryptable as $attribute) {
            if (isset($this->attributes[$attribute]) && !empty($this->attributes[$attribute])) {
                try {
                    $this->attributes[$attribute] = Crypt::decryptString($this->attributes[$attribute]);
                } catch (\Exception $e) {
                    // Se falhar ao descriptografar, manter o valor original
                    // (pode ser um valor não criptografado ainda)
                }
            }
        }
    }

    /**
     * Verificar se um valor está criptografado
     */
    protected function isEncrypted($value): bool
    {
        try {
            Crypt::decryptString($value);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Obter valor descriptografado de um atributo
     */
    public function getDecrypted($attribute)
    {
        if (isset($this->attributes[$attribute]) && !empty($this->attributes[$attribute])) {
            try {
                return Crypt::decryptString($this->attributes[$attribute]);
            } catch (\Exception $e) {
                return $this->attributes[$attribute];
            }
        }
        return null;
    }
}