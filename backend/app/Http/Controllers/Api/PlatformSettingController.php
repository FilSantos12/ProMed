<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;

class PlatformSettingController extends Controller
{
    public function index()
    {
        $settings = PlatformSetting::all()->keyBy('key');

        return response()->json([
            'service_fee_percentage' => (float) ($settings['service_fee_percentage']->value ?? 0),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'service_fee_percentage' => 'required|numeric|min:0|max:100',
        ]);

        PlatformSetting::where('key', 'service_fee_percentage')
            ->update([
                'value'      => $request->service_fee_percentage,
                'updated_at' => now(),
            ]);

        return response()->json([
            'message'                => 'Configurações salvas com sucesso.',
            'service_fee_percentage' => (float) $request->service_fee_percentage,
        ]);
    }
}
