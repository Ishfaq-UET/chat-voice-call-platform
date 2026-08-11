<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Settings', [
            'settings' => [
                'commission_percent' => Setting::commissionPercent(),
                'min_withdrawal' => Setting::minWithdrawal(),
                'manual_topup_instructions' => Setting::manualTopUpInstructions(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'commission_percent' => ['required', 'numeric', 'min:0', 'max:90'],
            'min_withdrawal' => ['required', 'numeric', 'min:1'],
            'manual_topup_instructions' => ['required', 'string', 'max:2000'],
        ]);

        Setting::setValue('commission_percent', $data['commission_percent']);
        Setting::setValue('min_withdrawal', $data['min_withdrawal']);
        Setting::setValue('manual_topup_instructions', $data['manual_topup_instructions']);

        return back()->with('success', 'Settings saved.');
    }
}
