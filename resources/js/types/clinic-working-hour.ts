export interface ClinicWorkingHour {
    id: number;
    clinic_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface ClinicWorkingHourFormValues {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
    sort_order: number;
}

export interface DayInfo {
    day: number;
    nameKey: string;
    defaultEn: string;
    defaultAr: string;
    shortEn: string;
    shortAr: string;
}

/**
 * Days ordered starting from Saturday (common in the Middle East) through Friday
 */
export const DAYS_OF_WEEK: DayInfo[] = [
    { day: 6, nameKey: 'days.saturday', defaultEn: 'Saturday', defaultAr: 'السبت', shortEn: 'Sat', shortAr: 'سبت' },
    { day: 0, nameKey: 'days.sunday', defaultEn: 'Sunday', defaultAr: 'الأحد', shortEn: 'Sun', shortAr: 'أحد' },
    { day: 1, nameKey: 'days.monday', defaultEn: 'Monday', defaultAr: 'الإثنين', shortEn: 'Mon', shortAr: 'إثنين' },
    { day: 2, nameKey: 'days.tuesday', defaultEn: 'Tuesday', defaultAr: 'الثلاثاء', shortEn: 'Tue', shortAr: 'ثلاثاء' },
    { day: 3, nameKey: 'days.wednesday', defaultEn: 'Wednesday', defaultAr: 'الأربعاء', shortEn: 'Wed', shortAr: 'أربعاء' },
    { day: 4, nameKey: 'days.thursday', defaultEn: 'Thursday', defaultAr: 'الخميس', shortEn: 'Thu', shortAr: 'خميس' },
    { day: 5, nameKey: 'days.friday', defaultEn: 'Friday', defaultAr: 'الجمعة', shortEn: 'Fri', shortAr: 'جمعة' },
];
