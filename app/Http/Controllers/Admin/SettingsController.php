<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
                'logo_url' => Setting::logoUrl(),
                'favicon_url' => Setting::faviconUrl(),
                'contact_email' => Setting::contactEmail(),
                'whatsapp_number' => Setting::whatsappNumber(),
                'whatsapp_message' => Setting::whatsappMessage(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'commission_percent' => ['required', 'numeric', 'min:0', 'max:90'],
            'min_withdrawal' => ['required', 'numeric', 'min:1'],
            'contact_email' => ['required', 'email', 'max:255'],
            'whatsapp_number' => ['nullable', 'string', 'max:32'],
            'whatsapp_message' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,svg', 'max:2048'],
            'favicon' => ['nullable', 'file', 'mimes:ico,png,jpg,jpeg,webp,svg,gif', 'max:1024'],
        ]);

        $whatsappDigits = preg_replace('/\D+/', '', (string) ($data['whatsapp_number'] ?? '')) ?? '';
        if (str_starts_with($whatsappDigits, '00')) {
            $whatsappDigits = substr($whatsappDigits, 2);
        }

        if ($whatsappDigits !== '') {
            if (str_starts_with($whatsappDigits, '0') || strlen($whatsappDigits) < 10 || strlen($whatsappDigits) > 15) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'whatsapp_number' => 'Enter a full international number with country code, no leading 0. Example: 923001234567',
                    ]);
            }
        }

        Setting::setValue('commission_percent', $data['commission_percent']);
        Setting::setValue('min_withdrawal', $data['min_withdrawal']);
        Setting::setValue('contact_email', $data['contact_email']);
        Setting::setValue('whatsapp_number', $whatsappDigits);
        Setting::setValue('whatsapp_message', trim((string) ($data['whatsapp_message'] ?? '')));

        if ($request->hasFile('logo')) {
            $this->storeBrandingFile($request->file('logo'), 'logo_path', 'branding/logo');
        }

        if ($request->hasFile('favicon')) {
            $this->storeBrandingFile($request->file('favicon'), 'favicon_path', 'branding/favicon');
        }

        return back()->with('success', 'Settings saved.');
    }

    private function storeBrandingFile(UploadedFile $file, string $settingKey, string $directory): void
    {
        $previous = Setting::getValue($settingKey);
        $path = $file->store($directory, 'public');

        Setting::setValue($settingKey, $path);

        if (is_string($previous) && $previous !== '' && $previous !== $path) {
            Storage::disk('public')->delete($previous);
        }
    }
}
