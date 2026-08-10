<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NameChangeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NameChangeController extends Controller
{
    public function index(Request $request): Response
    {
        $requests = NameChangeRequest::query()
            ->with(['user:id,name,email,role,avatar', 'reviewer:id,name'])
            ->when(
                $request->filled('status'),
                fn ($q) => $q->where('status', $request->input('status')),
                fn ($q) => $q->where('status', 'pending'),
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/NameChanges/Index', [
            'requests' => $requests,
            'filters' => [
                'status' => $request->input('status', 'pending'),
            ],
            'counts' => [
                'pending' => NameChangeRequest::query()->where('status', 'pending')->count(),
                'approved' => NameChangeRequest::query()->where('status', 'approved')->count(),
                'rejected' => NameChangeRequest::query()->where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function approve(Request $request, NameChangeRequest $nameChange): RedirectResponse
    {
        abort_unless($nameChange->status === 'pending', 422);

        $nameChange->user->update([
            'name' => $nameChange->requested_name,
        ]);

        $nameChange->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => null,
        ]);

        return back()->with('success', 'Name change approved.');
    }

    public function reject(Request $request, NameChangeRequest $nameChange): RedirectResponse
    {
        abort_unless($nameChange->status === 'pending', 422);

        $data = $request->validate([
            'admin_notes' => ['required', 'string', 'max:1000'],
        ]);

        $nameChange->update([
            'status' => 'rejected',
            'admin_notes' => $data['admin_notes'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Name change rejected.');
    }
}
