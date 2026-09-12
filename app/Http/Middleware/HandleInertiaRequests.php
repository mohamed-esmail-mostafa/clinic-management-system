<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->load([
                'clinics',
                'clinicUser.role',
            ]);

            $user->clinics->each(function ($clinic) use ($user) {
                $clinicUser = $user->clinicUser
                    ->firstWhere('clinic_id', $clinic->id);

                $clinic->setRelation('role', $clinicUser?->role);
            });

            // Remove clinicUser from the serialized user
            $user->unsetRelation('clinicUser');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            // 'auth' => [
            //     'user' => $request->user()?->load(['clinics', 'clinicUser.role']),
            // ],
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
