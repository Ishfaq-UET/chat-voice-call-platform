<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UserStatusMail;
use App\Models\VerificationRequest;
use App\Support\PlatformMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'pending');

        $requests = VerificationRequest::query()
            ->with([
                'user:id,name,email,phone,bio,avatar,role,verification_status,is_banned,created_at,online_at',
                'user.femaleProfile:id,user_id,chat_price,voice_price,call_price_per_minute',
                'user.wallet:id,user_id,balance',
                'reviewer:id,name',
            ])
            ->when(
                $status !== 'all',
                fn ($q) => $q->where('status', $status),
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Verifications', [
            'requests' => $requests,
            'filters' => ['status' => $status],
            'counts' => [
                'pending' => VerificationRequest::query()->where('status', 'pending')->count(),
                'approved' => VerificationRequest::query()->where('status', 'approved')->count(),
                'rejected' => VerificationRequest::query()->where('status', 'rejected')->count(),
                'all' => VerificationRequest::query()->count(),
            ],
        ]);
    }

    public function approve(Request $request, VerificationRequest $verification): RedirectResponse
    {
        $verification->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ]);

        $verification->user->update(['verification_status' => 'approved']);

        PlatformMail::send($verification->user, new UserStatusMail(
            user: $verification->user,
            subjectLine: 'Creator verification approved',
            headline: 'You are verified',
            body: 'Your face verification was approved. You can now appear in Discover and receive chats and calls.',
            actionUrl: route('female.dashboard'),
            actionLabel: 'Open creator dashboard',
        ));

        return back()->with('success', 'Verification approved.');
    }

    public function reject(Request $request, VerificationRequest $verification): RedirectResponse
    {
        $data = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $verification->update([
            'status' => 'rejected',
            'rejection_reason' => $data['rejection_reason'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $verification->user->update(['verification_status' => 'rejected']);

        PlatformMail::send($verification->user, new UserStatusMail(
            user: $verification->user,
            subjectLine: 'Creator verification update',
            headline: 'Verification was not approved',
            body: 'Reason: '.$data['rejection_reason'].' You can submit a new verification from your dashboard.',
            actionUrl: route('female.dashboard'),
            actionLabel: 'Try again',
        ));

        return back()->with('success', 'Verification rejected.');
    }
}
