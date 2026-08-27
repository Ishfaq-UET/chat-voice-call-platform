<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserStatusMail;
use App\Models\NameChangeRequest;
use App\Support\PlatformMail;
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

        PlatformMail::send($nameChange->user, new UserStatusMail(
            user: $nameChange->user->fresh(),
            subjectLine: 'Name change approved',
            headline: 'Your display name was updated',
            body: 'Your name is now “'.$nameChange->requested_name.'”.',
            actionUrl: route('profile.edit'),
            actionLabel: 'View profile',
        ));

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

        PlatformMail::send($nameChange->user, new UserStatusMail(
            user: $nameChange->user,
            subjectLine: 'Name change rejected',
            headline: 'Your name change was not approved',
            body: 'Requested name “'.$nameChange->requested_name.'” was rejected. Note: '.$data['admin_notes'],
            actionUrl: route('profile.edit'),
            actionLabel: 'View profile',
        ));

        return back()->with('success', 'Name change rejected.');
    }
}
