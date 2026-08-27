<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManualPaymentMethod;
use App\Support\CountryCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class ManualPaymentMethodController extends Controller
{
    public function index(): Response
    {
        $methods = ManualPaymentMethod::query()
            ->ordered()
            ->latest('updated_at')
            ->get()
            ->map(fn (ManualPaymentMethod $method) => [
                'id' => $method->id,
                'name' => $method->name,
                'logo_url' => $method->logo_url,
                'country_code' => $method->country_code,
                'country_name' => CountryCatalog::name($method->country_code),
                'account_title' => $method->account_title,
                'bank_name' => $method->bank_name,
                'account_number' => $method->account_number,
                'extra_instructions' => $method->extra_instructions,
                'is_active' => $method->is_active,
                'sort_order' => $method->sort_order,
            ]);

        return Inertia::render('Admin/PaymentMethods/Index', [
            'methods' => $methods,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/PaymentMethods/Form', [
            'method' => null,
            'countries' => CountryCatalog::optionsForSelect(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['logo_path'] = $this->storeLogo($request->file('logo'));

        ManualPaymentMethod::query()->create($data);

        return redirect()
            ->route('admin.payment-methods')
            ->with('success', 'Payment method created.');
    }

    public function edit(ManualPaymentMethod $paymentMethod): Response
    {
        return Inertia::render('Admin/PaymentMethods/Form', [
            'method' => [
                'id' => $paymentMethod->id,
                'name' => $paymentMethod->name,
                'logo_url' => $paymentMethod->logo_url,
                'country_code' => $paymentMethod->country_code,
                'account_title' => $paymentMethod->account_title,
                'bank_name' => $paymentMethod->bank_name ?? '',
                'account_number' => $paymentMethod->account_number,
                'extra_instructions' => $paymentMethod->extra_instructions ?? '',
                'is_active' => $paymentMethod->is_active,
                'sort_order' => $paymentMethod->sort_order,
            ],
            'countries' => CountryCatalog::optionsForSelect(),
        ]);
    }

    public function update(Request $request, ManualPaymentMethod $paymentMethod): RedirectResponse
    {
        $data = $this->validated($request);

        if ($request->hasFile('logo')) {
            $paymentMethod->deleteLogo();
            $data['logo_path'] = $this->storeLogo($request->file('logo'));
        }

        if ($request->boolean('remove_logo') && ! $request->hasFile('logo')) {
            $paymentMethod->deleteLogo();
            $data['logo_path'] = null;
        }

        $paymentMethod->update($data);

        return redirect()
            ->route('admin.payment-methods')
            ->with('success', 'Payment method updated.');
    }

    public function destroy(ManualPaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->deleteLogo();
        $paymentMethod->delete();

        return back()->with('success', 'Payment method deleted.');
    }

    public function toggle(ManualPaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->update(['is_active' => ! $paymentMethod->is_active]);

        return back()->with(
            'success',
            $paymentMethod->is_active ? 'Payment method activated.' : 'Payment method deactivated.',
        );
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'logo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,svg,gif', 'max:2048'],
            'country_code' => ['required', 'string', 'size:2', CountryCatalog::countryCodeRule()],
            'account_title' => ['required', 'string', 'max:120'],
            'bank_name' => ['nullable', 'string', 'max:120'],
            'account_number' => ['required', 'string', 'max:80'],
            'extra_instructions' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'remove_logo' => ['sometimes', 'boolean'],
        ]);

        $data['country_code'] = CountryCatalog::normalize($data['country_code']);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['bank_name'] = $data['bank_name'] ?: null;
        $data['extra_instructions'] = $data['extra_instructions'] ?: null;
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        unset($data['logo'], $data['remove_logo']);

        return $data;
    }

    private function storeLogo(?UploadedFile $file): ?string
    {
        if (! $file) {
            return null;
        }

        return $file->store('payment-logos', 'public');
    }
}
