<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteBanner;
use App\Support\CountryCatalog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function index(): Response
    {
        $banners = SiteBanner::query()
            ->latest('updated_at')
            ->get()
            ->map(function (SiteBanner $banner) {
                $codes = $banner->targetedCountryCodes();
                $names = array_map(fn (string $code) => CountryCatalog::name($code), $codes);

                return [
                    'id' => $banner->id,
                    'title' => $banner->title,
                    'message' => $banner->message,
                    'image_url' => $banner->image_url,
                    'link_url' => $banner->link_url,
                    'link_label' => $banner->link_label,
                    'country_codes' => $codes,
                    'country_names' => $names,
                    'scope_label' => $codes === [] ? 'Global' : implode(', ', $names),
                    'is_active' => $banner->is_active,
                    'starts_at' => $banner->starts_at?->toIso8601String(),
                    'ends_at' => $banner->ends_at?->toIso8601String(),
                    'updated_at' => $banner->updated_at?->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Banners/Form', [
            'banner' => null,
            'countries' => CountryCatalog::optionsForSelect(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['image_path'] = $this->storeImage($request->file('image'));

        SiteBanner::query()->create($data);

        return redirect()
            ->route('admin.banners')
            ->with('success', 'Banner created.');
    }

    public function edit(SiteBanner $banner): Response
    {
        return Inertia::render('Admin/Banners/Form', [
            'banner' => [
                'id' => $banner->id,
                'title' => $banner->title,
                'message' => $banner->message,
                'image_url' => $banner->image_url,
                'link_url' => $banner->link_url,
                'link_label' => $banner->link_label,
                'country_codes' => $banner->targetedCountryCodes(),
                'is_active' => $banner->is_active,
                'starts_at' => $banner->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $banner->ends_at?->format('Y-m-d\TH:i'),
            ],
            'countries' => CountryCatalog::optionsForSelect(),
        ]);
    }

    public function update(Request $request, SiteBanner $banner): RedirectResponse
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            $banner->deleteImage();
            $data['image_path'] = $this->storeImage($request->file('image'));
        }

        if ($request->boolean('remove_image') && ! $request->hasFile('image')) {
            $banner->deleteImage();
            $data['image_path'] = null;
        }

        $banner->update($data);

        return redirect()
            ->route('admin.banners')
            ->with('success', 'Banner updated.');
    }

    public function destroy(SiteBanner $banner): RedirectResponse
    {
        $banner->deleteImage();
        $banner->delete();

        return back()->with('success', 'Banner deleted.');
    }

    public function toggle(SiteBanner $banner): RedirectResponse
    {
        $banner->update(['is_active' => ! $banner->is_active]);

        return back()->with('success', $banner->is_active ? 'Banner activated.' : 'Banner deactivated.');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'max:1000'],
            'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,gif', 'max:4096'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'link_label' => ['nullable', 'string', 'max:80'],
            'country_codes' => ['nullable', 'array'],
            'country_codes.*' => ['string', 'size:2'],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'remove_image' => ['sometimes', 'boolean'],
        ]);

        $codes = array_values(array_unique(array_filter(array_map(
            fn ($code) => strtoupper(trim((string) $code)),
            $data['country_codes'] ?? [],
        ), fn (string $code) => CountryCatalog::isSupported($code))));

        $data['country_codes'] = $codes;

        $data['is_active'] = $request->boolean('is_active');
        $data['title'] = $data['title'] ?? null;
        $data['link_url'] = $data['link_url'] ?: null;
        $data['link_label'] = $data['link_label'] ?: null;
        $data['starts_at'] = $data['starts_at'] ?? null;
        $data['ends_at'] = $data['ends_at'] ?? null;

        unset($data['image'], $data['remove_image']);

        return $data;
    }

    private function storeImage(?UploadedFile $file): ?string
    {
        if (! $file) {
            return null;
        }

        return $file->store('banners', 'public');
    }
}
