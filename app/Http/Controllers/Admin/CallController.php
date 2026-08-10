<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Call;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CallController extends Controller
{
    public function index(Request $request): Response
    {
        $calls = Call::query()
            ->with([
                'male:id,name,email',
                'female:id,name,email',
            ])
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->input('q'), function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->whereHas('male', function ($male) use ($search) {
                        $male->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })->orWhereHas('female', function ($female) use ($search) {
                        $female->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Calls/Index', [
            'calls' => $calls,
            'filters' => $request->only(['status', 'q']),
            'summary' => [
                'total' => Call::query()->count(),
                'active' => Call::query()->where('status', 'active')->count(),
                'ringing' => Call::query()->where('status', 'ringing')->count(),
                'total_minutes' => (int) ceil(((int) Call::query()->sum('duration_seconds')) / 60),
                'total_charged' => (float) Call::query()->sum('total_charged'),
                'total_commission' => (float) Call::query()->sum('commission_amount'),
            ],
        ]);
    }

    public function show(Call $call): Response
    {
        $call->load([
            'male:id,name,email,avatar',
            'female:id,name,email,avatar',
            'conversation:id,male_id,female_id',
        ]);

        return Inertia::render('Admin/Calls/Show', [
            'call' => $call,
        ]);
    }
}
