<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\PatientFieldOption;
use App\Models\PatientFields;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class PatientFieldsService
{
    public function getFieldsForClinic(Clinic $clinic): Collection
    {
        return PatientFields::where('clinic_id', $clinic->id)
            ->with('options')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();
    }

    public function createField(Clinic $clinic, array $data): PatientFields
    {
        $name = ! empty($data['name'])
            ? Str::slug($data['name'], '_')
            : Str::slug($data['label'], '_');

        if (empty($name)) {
            $name = 'field_'.Str::lower(Str::random(6));
        }

        $baseName = $name;
        $counter = 1;
        while (PatientFields::where('clinic_id', $clinic->id)->where('name', $name)->exists()) {
            $name = $baseName.'_'.$counter;
            $counter++;
        }

        $nextSortOrder = isset($data['sort_order']) && $data['sort_order'] !== ''
            ? (int) $data['sort_order']
            : (PatientFields::where('clinic_id', $clinic->id)->max('sort_order') ?? 0) + 1;

        $field = PatientFields::create([
            'clinic_id' => $clinic->id,
            'clinic_type_id' => $clinic->clinic_type_id,
            'name' => $name,
            'label' => $data['label'],
            'type' => $data['type'],
            'is_required' => $data['is_required'] ?? false,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $nextSortOrder,
        ]);

        if (in_array($data['type'], ['select', 'radio', 'checkbox']) && ! empty($data['options']) && is_array($data['options'])) {
            $this->syncFieldOptions($field, $data['options']);
        }

        return $field;
    }

    public function updateField(PatientFields $field, array $data): PatientFields
    {
        $name = $field->name;
        if (! empty($data['name']) && $data['name'] !== $field->name) {
            $baseName = Str::slug($data['name'], '_');
            $name = $baseName;
            $counter = 1;
            while (PatientFields::where('clinic_id', $field->clinic_id)->where('name', $name)->where('id', '!=', $field->id)->exists()) {
                $name = $baseName.'_'.$counter;
                $counter++;
            }
        }

        $field->update([
            'name' => $name,
            'label' => $data['label'],
            'type' => $data['type'],
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

    public function deleteField(PatientFields $field): ?bool
    {
        return $field->delete();
    }

    public function toggleFieldStatus(PatientFields $field): PatientFields
    {
        $field->update([
            'is_active' => ! $field->is_active,
        ]);

        return $field;
    }

    public function addOptionToField(PatientFields $field, array $data): PatientFieldOption
    {
        $label = trim($data['label']);
        $value = ! empty($data['value']) ? trim($data['value']) : Str::slug($label, '_');
        $sortOrder = isset($data['sort_order']) ? (int) $data['sort_order'] : ($field->options()->max('sort_order') ?? 0) + 1;

        return PatientFieldOption::create([
            'patient_field_id' => $field->id,
            'label' => $label,
            'value' => $value,
            'sort_order' => $sortOrder,
        ]);
    }

    public function updateOption(PatientFieldOption $option, array $data): PatientFieldOption
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

    public function deleteOption(PatientFieldOption $option): ?bool
    {
        return $option->delete();
    }

    protected function syncFieldOptions(PatientFields $field, array $options): void
    {
        $field->options()->delete();

        foreach ($options as $index => $option) {
            if (empty($option['label'])) {
                continue;
            }

            $label = trim($option['label']);
            $value = ! empty($option['value']) ? trim($option['value']) : Str::slug($label, '_');

            PatientFieldOption::create([
                'patient_field_id' => $field->id,
                'label' => $label,
                'value' => $value,
                'sort_order' => $index + 1,
            ]);
        }
    }
}
