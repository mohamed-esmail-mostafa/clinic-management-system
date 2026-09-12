<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateWebsiteSettingRequest;
use App\Services\WebsiteSettingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteSettingController extends Controller
{
    public function __construct(
        protected WebsiteSettingService $websiteSettingService
    ) {}

    public function website_settings_page(): Response
    {
        $settings = $this->websiteSettingService->getSettings();

        return Inertia::render('website-setting/index', [
            'settings' => $settings,
        ]);
    }

    public function update(UpdateWebsiteSettingRequest $request): RedirectResponse
    {
        $files = [
            'logo' => $request->file('logo'),
            'dark_logo' => $request->file('dark_logo'),
            'favicon' => $request->file('favicon'),
        ];

        $this->websiteSettingService->updateSettings($request->validated(), array_filter($files));

        return redirect()->back()->with('success', 'Website settings updated successfully');
    }
}
