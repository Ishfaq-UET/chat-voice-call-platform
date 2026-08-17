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
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'commission_percent' => ['required', 'numeric', 'min:0', 'max:90'],
            'min_withdrawal' => ['required', 'numeric', 'min:1'],
            'logo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,svg', 'max:2048'],
            'favicon' => ['nullable', 'file', 'mimes:ico,png,jpg,jpeg,webp,svg,gif', 'max:1024'],
        ]);

        Setting::setValue('commission_percent', $data['commission_percent']);
        Setting::setValue('min_withdrawal', $data['min_withdrawal']);

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
