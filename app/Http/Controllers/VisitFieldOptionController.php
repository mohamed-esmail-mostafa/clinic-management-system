<?php

namespace App\Http\Controllers;

use App\Models\VisitField;
use App\Models\VisitFieldOption;
use App\Services\VisitFieldService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VisitFieldOptionController extends Controller
{
    public function __construct(protected VisitFieldService $visitFieldService) {}

    public function store(Request $request, string $slug, VisitField $field): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->visitFieldService->addOptionToField($field, $validated);

        return redirect()->back()->with('success', 'Option added successfully');
    }

    public function update(Request $request, string $slug, VisitFieldOption $option): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'value' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->visitFieldService->updateOption($option, $validated);

        return redirect()->back()->with('success', 'Option updated successfully');
    }

    public function destroy(string $slug, VisitFieldOption $option): RedirectResponse
    {
        $this->visitFieldService->deleteOption($option);

        return redirect()->back()->with('success', 'Option deleted successfully');
    }
}
