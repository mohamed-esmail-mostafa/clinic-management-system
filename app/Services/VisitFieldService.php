<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\VisitField;
use App\Models\VisitFieldOption;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class VisitFieldService
{
    public function getFieldsForClinic(Clinic $clinic): Collection
    {
        return VisitField::where('clinic_id', $clinic->id)
            ->with('options')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();
    }

    public function createField(Clinic $clinic, array $data): VisitField
    {
        $name = ! empty($data['name'])
            ? Str::slug($data['name'], '_')
            : Str::slug($data['label'], '_');

        if (empty($name)) {
            $name = 'field_'.Str::lower(Str::random(6));
        }

        $baseName = $name;
        $counter = 1;
        while (VisitField::where('clinic_id', $clinic->id)->where('name', $name)->exists()) {
            $name = $baseName.'_'.$counter;
            $counter++;
        }

        $nextSortOrder = isset($data['sort_order']) && $data['sort_order'] !== ''
            ? (int) $data['sort_order']
            : (VisitField::where('clinic_id', $clinic->id)->max('sort_order') ?? 0) + 1;

        $field = VisitField::create([
            'clinic_id' => $clinic->id,
            'clinic_type_id' => $clinic->clinic_type_id,
            'name' => $name,
            'label' => $data['label'],
            'type' => $data['type'],
            'unit' => ! empty($data['unit']) ? trim($data['unit']) : null,
            'is_required' => $data['is_required'] ?? false,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $nextSortOrder,
        ]);

        if (in_array($data['type'], ['select', 'radio', 'checkbox']) && ! empty($data['options']) && is_array($data['options'])) {
            $this->syncFieldOptions($field, $data['options']);
        }

        return $field;
    }

    public function updateField(VisitField $field, array $data): VisitField
    {
        $name = $field->name;
        if (! empty($data['name']) && $data['name'] !== $field->name) {
            $baseName = Str::slug($data['name'], '_');
            $name = $baseName;
            $counter = 1;
            while (VisitField::where('clinic_id', $field->clinic_id)->where('name', $name)->where('id', '!=', $field->id)->exists()) {
                $name = $baseName.'_'.$counter;
                $counter++;
            }
        }

        $field->update([
            'name' => $name,
            'label' => $data['label'],
            'type' => $data['type'],
            'unit' => ! empty($data['unit']) ? trim($data['unit']) : null,
            'is_required' => $data['is_required'] ?? false,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : $field->sort_order,
        ]);

        if (in_array($data['type'], ['select', 'radio', 'checkbox'])) {
            $options = $data['options'] ?? [];
            $this->syncFieldOptions($field, $options);
        } else {
            $field->options()->delete();
        }

        return $field;
    }

    public function deleteField(VisitField $field): ?bool
    {
        return $field->delete();
    }

    public function toggleFieldStatus(VisitField $field): VisitField
    {
        $field->update([
            'is_active' => ! $field->is_active,
        ]);

        return $field;
    }

    public function addOptionToField(VisitField $field, array $data): VisitFieldOption
    {
        $label = trim($data['label']);
        $value = ! empty($data['value']) ? trim($data['value']) : Str::slug($label, '_');
        $sortOrder = isset($data['sort_order']) ? (int) $data['sort_order'] : ($field->options()->max('sort_order') ?? 0) + 1;

        return VisitFieldOption::create([
            'visit_field_id' => $field->id,
            'label' => $label,
            'value' => $value,
            'sort_order' => $sortOrder,
            'is_active' => true,
        ]);
    }

    public function updateOption(VisitFieldOption $option, array $data): VisitFieldOption
    {
        $label = trim($data['label']);
        $value = ! empty($data['value']) ? trim($data['value']) : Str::slug($label, '_');

        $option->update([
            'label' => $label,
            'value' => $value,
            'sort_order' => isset($data['sort_order']) ? (int) $data['sort_order'] : $option->sort_order,
        ]);

        return $option;
    }

    public function deleteOption(VisitFieldOption $option): ?bool
    {
        return $option->delete();
    }

    protected function syncFieldOptions(VisitField $field, array $options): void
    {
        $field->options()->delete();

        foreach ($options as $index => $option) {
            if (empty($option['label'])) {
                continue;
            }

            $label = trim($option['label']);
            $value = ! empty($option['value']) ? trim($option['value']) : Str::slug($label, '_');

            VisitFieldOption::create([
                'visit_field_id' => $field->id,
                'label' => $label,
                'value' => $value,
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);
        }
    }
}
