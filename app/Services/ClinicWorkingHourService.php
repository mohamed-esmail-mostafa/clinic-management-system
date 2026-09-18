<?php

namespace App\Services;

use App\Models\Clinic;
use App\Models\ClinicWorkingHour;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ClinicWorkingHourService
{
    /**
     * Retrieve all working hours for a clinic ordered by day and start time.
     */
    public function getClinicWorkingHours(Clinic $clinic): Collection
    {
        return $clinic->workingHours()
            ->orderBy('day_of_week', 'asc')
            ->orderBy('start_time', 'asc')
            ->orderBy('sort_order', 'asc')
            ->get();
    }

    /**
     * Create a new working hour shift for a clinic.
     */
    public function createWorkingHour(Clinic $clinic, array $data): ClinicWorkingHour
    {
        $workingHour = new ClinicWorkingHour;
        $workingHour->clinic_id = $clinic->id;
        $workingHour->day_of_week = (int) $data['day_of_week'];
        $workingHour->start_time = $this->formatTime($data['start_time']);
        $workingHour->end_time = $this->formatTime($data['end_time']);
        $workingHour->is_active = isset($data['is_active'])
            ? filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN)
            : true;
        $workingHour->sort_order = isset($data['sort_order']) ? (int) $data['sort_order'] : 0;
        $workingHour->save();

        return $workingHour;
    }

    /**
     * Update an existing working hour shift.
     */
    public function updateWorkingHour(ClinicWorkingHour $workingHour, array $data): ClinicWorkingHour
    {
        if (isset($data['day_of_week'])) {
            $workingHour->day_of_week = (int) $data['day_of_week'];
        }

        if (isset($data['start_time'])) {
            $workingHour->start_time = $this->formatTime($data['start_time']);
        }

        if (isset($data['end_time'])) {
            $workingHour->end_time = $this->formatTime($data['end_time']);
        }

        if (isset($data['is_active'])) {
            $workingHour->is_active = filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        if (isset($data['sort_order'])) {
            $workingHour->sort_order = (int) $data['sort_order'];
        }

        $workingHour->save();

        return $workingHour;
    }

    /**
     * Delete a working hour record.
     */
    public function deleteWorkingHour(ClinicWorkingHour $workingHour): ?bool
    {
        return $workingHour->delete();
    }

    /**
     * Toggle active status of a working hour shift.
     */
    public function toggleStatus(ClinicWorkingHour $workingHour): ClinicWorkingHour
    {
        $workingHour->is_active = ! $workingHour->is_active;
        $workingHour->save();

        return $workingHour;
    }

    /**
     * Bulk sync or replace weekly schedule for a clinic.
     */
    public function syncWeeklySchedule(Clinic $clinic, array $schedule): void
    {
        DB::transaction(function () use ($clinic, $schedule) {
            $clinic->workingHours()->delete();

            foreach ($schedule as $item) {
                $clinic->workingHours()->create([
                    'day_of_week' => (int) $item['day_of_week'],
                    'start_time' => $this->formatTime($item['start_time']),
                    'end_time' => $this->formatTime($item['end_time']),
                    'is_active' => isset($item['is_active'])
                        ? filter_var($item['is_active'], FILTER_VALIDATE_BOOLEAN)
                        : true,
                    'sort_order' => isset($item['sort_order']) ? (int) $item['sort_order'] : 0,
                ]);
            }
        });
    }

    /**
     * Format time to HH:mm:ss for consistent database storage.
     */
    protected function formatTime(string $time): string
    {
        $parts = explode(':', trim($time));
        if (count($parts) === 2) {
            return sprintf('%02d:%02d:00', (int) $parts[0], (int) $parts[1]);
        }
        if (count($parts) >= 3) {
            return sprintf('%02d:%02d:%02d', (int) $parts[0], (int) $parts[1], (int) $parts[2]);
        }

        return $time;
    }
}
