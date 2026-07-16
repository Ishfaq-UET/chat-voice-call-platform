<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function index(): Response
    {
        $requests = VerificationRequest::query()
            ->with('user:id,name,email,avatar,verification_status')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Verifications', [
            'requests' => $requests,
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

        return back()->with('success', 'Verification rejected.');
    }
}
