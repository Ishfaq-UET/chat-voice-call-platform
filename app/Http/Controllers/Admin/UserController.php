<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->where('role', '!=', 'admin')
            ->with('wallet')
            ->when($request->input('role'), fn ($q, $role) => $q->where('role', $role))
            ->when($request->input('q'), function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => $request->only(['role', 'q']),
        ]);
    }

    public function toggleBan(User $user): RedirectResponse
    {
        abort_if($user->isAdmin(), 403);

        $user->update(['is_banned' => ! $user->is_banned]);

        return back()->with('success', $user->is_banned ? 'User banned.' : 'User unbanned.');
    }
}
