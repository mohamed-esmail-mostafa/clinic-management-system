import React, { useState, useMemo } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import useImport from '@/hooks/use-import';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { ClinicWorkingHour, ClinicWorkingHourFormValues, DAYS_OF_WEEK } from '@/types/clinic-working-hour';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

// UI Components
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// Icons
import {
    Timer,
    Clock,
    Plus,
    Pencil,
    Trash2,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
    CalendarDays,
    SunMedium,
    Moon,
} from 'lucide-react';

interface Props {
    clinic?: any;
    workingHours?: ClinicWorkingHour[];
}

/**
 * Helper to convert 24h string (e.g. "09:30:00" or "14:00") into 12h display
 */
function formatTime12h(timeStr: string, isAr: boolean): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parts[1].padStart(2, '0') : '00';

    if (isNaN(hours)) return timeStr;

    const period = hours >= 12 ? (isAr ? 'م' : 'PM') : (isAr ? 'ص' : 'AM');
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12

    return `${hours}:${minutes} ${period}`;
}

/**
 * Format time to HH:mm for <input type="time">
 */
function formatForTimeInput(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return timeStr;
}

export default function ClinicWorkingHoursPage({ clinic, workingHours = [] }: Props) {
    const { t, isRtl, i18n } = useImport();
    const isAr = i18n.language === 'ar';
    const { authClinic } = useAuthClinics();
    const clinicSlug = clinic?.slug || authClinic?.slug;

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<ClinicWorkingHour | null>(null);
    const [deletingShift, setDeletingShift] = useState<ClinicWorkingHour | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Group working hours by day_of_week
    const shiftsByDay = useMemo(() => {
        const map: Record<number, ClinicWorkingHour[]> = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: [],
        };
        workingHours.forEach((hour) => {
            if (map[hour.day_of_week]) {
                map[hour.day_of_week].push(hour);
            }
        });
        // Sort each day's shifts by start_time
        Object.keys(map).forEach((dayKey) => {
            map[Number(dayKey)].sort((a, b) => a.start_time.localeCompare(b.start_time));
        });
        return map;
    }, [workingHours]);

    // Current real-time status calculation
    const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const todayShifts = shiftsByDay[currentDay] || [];
    const isOpenNow = useMemo(() => {
        return todayShifts.some((shift) => {
            if (!shift.is_active) return false;
            const start = formatForTimeInput(shift.start_time);
            const end = formatForTimeInput(shift.end_time);
            return currentTimeStr >= start && currentTimeStr <= end;
        });
    }, [todayShifts, currentTimeStr]);

    // Statistics
    const stats = useMemo(() => {
        const activeDaysCount = Object.values(shiftsByDay).filter((shifts) =>
            shifts.some((s) => s.is_active)
        ).length;

        const totalActiveShifts = workingHours.filter((s) => s.is_active).length;

        return {
            activeDaysCount,
            totalActiveShifts,
            totalShifts: workingHours.length,
        };
    }, [shiftsByDay, workingHours]);

    // Formik & Yup for Add / Edit
    const validationSchema = Yup.object({
        day_of_week: Yup.number().required(t('common.required', 'This field is required')).min(0).max(6),
        start_time: Yup.string().required(t('common.required', 'This field is required')),
        end_time: Yup.string().required(t('common.required', 'This field is required')),
        is_active: Yup.boolean().default(true),
        sort_order: Yup.number().typeError(t('common.number_required', 'Must be a number')).min(0).default(0),
    });

    const initialValues: ClinicWorkingHourFormValues = {
        day_of_week: editingShift ? editingShift.day_of_week : 6, // Default Saturday
        start_time: editingShift ? formatForTimeInput(editingShift.start_time) : '09:00',
        end_time: editingShift ? formatForTimeInput(editingShift.end_time) : '17:00',
        is_active: editingShift ? Boolean(editingShift.is_active) : true,
        sort_order: editingShift?.sort_order ?? 0,
    };

    const formik = useFormik<ClinicWorkingHourFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!clinicSlug) {
                toast.error('Clinic slug is missing.');
                setSubmitting(false);
                return;
            }

            if (editingShift) {
                router.put(`/clinic/${clinicSlug}/working/hours/${editingShift.id}`, values as any, {
                    onSuccess: () => {
                        toast.success(t('clinic_working_hours.updated_success', 'Working hour shift updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating shift');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                router.post(`/clinic/${clinicSlug}/working/hours`, values as any, {
                    onSuccess: () => {
                        toast.success(t('clinic_working_hours.created_success', 'Working hour shift added successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error adding shift');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleOpenAddForDay = (day: number) => {
        setEditingShift(null);
        formik.setFieldValue('day_of_week', day);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (shift: ClinicWorkingHour) => {
        setEditingShift(shift);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingShift(null);
        formik.resetForm();
    };

    const handleToggleStatus = (shift: ClinicWorkingHour) => {
        if (!clinicSlug) return;
        router.patch(`/clinic/${clinicSlug}/working/hours/${shift.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('clinic_working_hours.status_updated', 'Working hour status updated successfully!'));
            },
            onError: () => {
                toast.error('Failed to update working hour status');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingShift || !clinicSlug) return;
        setIsDeleting(true);
        router.delete(`/clinic/${clinicSlug}/working/hours/${deletingShift.id}`, {
            onSuccess: () => {
                toast.success(t('clinic_working_hours.deleted_success', 'Working hour shift deleted successfully!'));
                setDeletingShift(null);
            },
            onError: () => {
                toast.error('Failed to delete shift');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Preset templates application
    const applyPreset = (presetType: 'regular' | 'two_shifts') => {
        if (!clinicSlug) return;
        setIsSyncing(true);

        const newSchedule: any[] = [];
        // Saturday (6), Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4)
        const workingDays = [6, 0, 1, 2, 3, 4];

        if (presetType === 'regular') {
            workingDays.forEach((d) => {
                newSchedule.push({
                    day_of_week: d,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                    is_active: true,
                    sort_order: 0,
                });
            });
        } else if (presetType === 'two_shifts') {
            workingDays.forEach((d) => {
                // Morning shift
                newSchedule.push({
                    day_of_week: d,
                    start_time: '10:00:00',
                    end_time: '14:00:00',
                    is_active: true,
                    sort_order: 1,
                });
                // Evening shift
                newSchedule.push({
                    day_of_week: d,
                    start_time: '18:00:00',
                    end_time: '22:00:00',
                    is_active: true,
                    sort_order: 2,
                });
            });
        }

        router.post(
            `/clinic/${clinicSlug}/working/hours/sync`,
            { schedule: newSchedule },
            {
                onSuccess: () => {
                    toast.success(t('clinic_working_hours.synced_success', 'Weekly schedule updated successfully!'));
                    setIsPresetModalOpen(false);
                },
                onError: () => {
                    toast.error('Failed to sync weekly schedule');
                },
                onFinish: () => setIsSyncing(false),
            }
        );
    };

    return (
        <ClinicLayout>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    icon={<Timer className="h-7 w-7 text-primary" />}
                    title={t('clinic_working_hours.title', 'Clinic Working Hours')}
                    subtitle={t(
                        'clinic_working_hours.subtitle',
                        'Configure clinic opening times, daily shifts, reception hours, and weekly schedule.'
                    )}
                >
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <Button
                            variant="outline"
                            onClick={() => setIsPresetModalOpen(true)}
                            className="gap-1.5 shrink-0"
                        >
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            {t('clinic_working_hours.quick_presets', 'Quick Weekly Presets')}
                        </Button>
                        <Button
                            onClick={() => {
                                setEditingShift(null);
                                setIsModalOpen(true);
                            }}
                            className="gap-2 shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            {t('clinic_working_hours.add_shift', 'Add Working Shift')}
                        </Button>
                    </div>
                </PageHeader>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Live Status */}
                    <Card className="shadow-xs border-primary/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_working_hours.status_title', 'Clinic Status Now')}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span
                                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                                            isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                                        }`}
                                    />
                                    <span
                                        className={`text-lg font-bold ${
                                            isOpenNow ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                        }`}
                                    >
                                        {isOpenNow
                                            ? t('clinic_working_hours.status_open', 'Currently Open')
                                            : t('clinic_working_hours.status_closed', 'Currently Closed')}
                                    </span>
                                </div>
                            </div>
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isOpenNow
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                        : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                                }`}
                            >
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Working Days */}
                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_working_hours.active_days', 'Active Working Days')}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-foreground">
                                    {stats.activeDaysCount}{' '}
                                    <span className="text-sm font-normal text-muted-foreground">/ 7 {t('clinic_working_hours.days_label', 'Days')}</span>
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Active Shifts */}
                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_working_hours.total_shifts', 'Total Active Shifts')}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-primary">
                                    {stats.totalActiveShifts}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Timer className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Schedule Overview */}
                    <Card className="shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('clinic_working_hours.today_schedule', "Today's Schedule")}
                                </p>
                                <p className="text-sm font-bold mt-1 truncate text-foreground">
                                    {todayShifts.length > 0
                                        ? todayShifts
                                              .map(
                                                  (s) =>
                                                      `${formatTime12h(s.start_time, isAr)} - ${formatTime12h(s.end_time, isAr)}`
                                              )
                                              .join(' | ')
                                        : t('clinic_working_hours.no_shifts', 'Closed / Day Off')}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                <SunMedium className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weekly Schedule 7-Day View */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {DAYS_OF_WEEK.map((dayInfo) => {
                        const dayShifts = shiftsByDay[dayInfo.day] || [];
                        const isToday = currentDay === dayInfo.day;
                        const hasActiveShifts = dayShifts.some((s) => s.is_active);

                        return (
                            <Card
                                key={dayInfo.day}
                                className={`p-0 gap-0 shadow-xs border transition-all duration-200 hover:shadow-md ${
                                    isToday
                                        ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.015]'
                                        : 'border-border'
                                }`}
                            >
                                {/* Day Card Header */}
                                <div className="p-4 pb-3 flex items-center justify-between gap-3 border-b bg-muted/20">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                                isToday
                                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                                    : 'bg-primary/10 text-primary'
                                            }`}
                                        >
                                            {isAr ? dayInfo.shortAr : dayInfo.shortEn}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-base text-foreground leading-tight">
                                                    {isAr ? dayInfo.defaultAr : dayInfo.defaultEn}
                                                </h3>
                                                {isToday && (
                                                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4">
                                                        {t('common.today', 'Today')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {dayShifts.length > 0
                                                    ? `${dayShifts.length} ${t('clinic_working_hours.shifts', 'shifts')}`
                                                    : t('clinic_working_hours.no_shifts', 'Closed / Day Off')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Add Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenAddForDay(dayInfo.day)}
                                        className="h-8 gap-1 text-xs"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>{t('common.add', 'Add')}</span>
                                    </Button>
                                </div>

                                {/* Shifts List */}
                                <div className="p-4 space-y-3 min-h-[140px] flex flex-col justify-between">
                                    {dayShifts.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-muted-foreground">
                                            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                                                <Moon className="h-5 w-5 text-muted-foreground/60" />
                                            </div>
                                            <p className="text-xs font-semibold text-foreground/80">
                                                {t('clinic_working_hours.no_shifts', 'Closed / Day Off')}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
                                                {t('clinic_working_hours.no_shifts_desc', 'No working shifts scheduled for this day.')}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenAddForDay(dayInfo.day)}
                                                className="mt-3 text-xs text-primary gap-1 h-7"
                                            >
                                                <Plus className="h-3 w-3" />
                                                {t('clinic_working_hours.add_first_shift', 'Add Hours')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5 flex-1">
                                            {dayShifts.map((shift, idx) => (
                                                <div
                                                    key={shift.id}
                                                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                                        shift.is_active
                                                            ? 'bg-card border-border hover:border-primary/40'
                                                            : 'bg-muted/30 border-dashed border-muted-foreground/30 opacity-70'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5" dir="ltr">
                                                                <span className="font-bold text-sm font-mono tracking-tight text-foreground">
                                                                    {formatTime12h(shift.start_time, isAr)}
                                                                </span>
                                                                <span className="text-muted-foreground text-xs font-bold">
                                                                    →
                                                                </span>
                                                                <span className="font-bold text-sm font-mono tracking-tight text-foreground">
                                                                    {formatTime12h(shift.end_time, isAr)}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-mono block">
                                                                {formatForTimeInput(shift.start_time)} - {formatForTimeInput(shift.end_time)} (24h)
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Shift Actions */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Switch
                                                            checked={shift.is_active}
                                                            onCheckedChange={() => handleToggleStatus(shift)}
                                                            title={
                                                                shift.is_active
                                                                    ? t('common.active', 'Active')
                                                                    : t('common.inactive', 'Inactive')
                                                                }
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(shift)}
                                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                            title={t('common.edit', 'Edit')}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setDeletingShift(shift)}
                                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                                            title={t('common.delete', 'Delete')}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bottom Info Bar */}
                                    <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>
                                            {hasActiveShifts
                                                ? t('clinic_working_hours.status_open', 'Open on this day')
                                                : t('clinic_working_hours.no_shifts', 'Closed / Day Off')}
                                        </span>
                                        {dayShifts.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenAddForDay(dayInfo.day)}
                                                className="text-primary hover:underline text-xs font-medium flex items-center gap-0.5"
                                            >
                                                <Plus className="h-3 w-3" />
                                                <span>{t('clinic_working_hours.add_shift', 'Add shift')}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Create / Edit Shift Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            {editingShift
                                ? t('clinic_working_hours.edit_shift', 'Edit Working Shift')
                                : t('clinic_working_hours.add_shift', 'Add Working Shift')}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
                        {/* Day of Week */}
                        <div>
                            <Label htmlFor="day_of_week">
                                {t('clinic_working_hours.day', 'Day of the Week')} *
                            </Label>
                            <Select
                                value={String(formik.values.day_of_week)}
                                onValueChange={(val) => formik.setFieldValue('day_of_week', parseInt(val, 10))}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={t('clinic_working_hours.select_day', 'Select day')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS_OF_WEEK.map((d) => (
                                        <SelectItem key={d.day} value={String(d.day)}>
                                            {isAr ? d.defaultAr : d.defaultEn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Start and End Times */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="start_time">
                                    {t('clinic_working_hours.start_time', 'Start Time')} *
                                </Label>
                                <Input
                                    id="start_time"
                                    name="start_time"
                                    type="time"
                                    value={formik.values.start_time}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="mt-1 font-mono"
                                />
                                {formik.touched.start_time && formik.errors.start_time && (
                                    <p className="text-xs text-destructive mt-1">{formik.errors.start_time}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="end_time">
                                    {t('clinic_working_hours.end_time', 'End Time')} *
                                </Label>
                                <Input
                                    id="end_time"
                                    name="end_time"
                                    type="time"
                                    value={formik.values.end_time}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="mt-1 font-mono"
                                />
                                {formik.touched.end_time && formik.errors.end_time && (
                                    <p className="text-xs text-destructive mt-1">{formik.errors.end_time}</p>
                                )}
                            </div>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <Label htmlFor="sort_order">
                                {t('clinic_working_hours.sort_order', 'Sort Order')}
                            </Label>
                            <Input
                                id="sort_order"
                                name="sort_order"
                                type="number"
                                min={0}
                                value={formik.values.sort_order}
                                onChange={formik.handleChange}
                                className="mt-1 font-mono"
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                                <Label htmlFor="is_active" className="cursor-pointer font-medium text-sm">
                                    {t('clinic_working_hours.is_active', 'Active Status')}
                                </Label>
                            </div>
                            <Switch
                                id="is_active"
                                checked={formik.values.is_active}
                                onCheckedChange={(val) => formik.setFieldValue('is_active', val)}
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={formik.isSubmitting}>
                                {formik.isSubmitting
                                    ? t('common.processing', 'Processing...')
                                    : editingShift
                                    ? t('common.save', 'Save Changes')
                                    : t('common.save', 'Add Shift')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Quick Weekly Presets Dialog */}
            <Dialog open={isPresetModalOpen} onOpenChange={setIsPresetModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            {t('clinic_working_hours.quick_presets', 'Quick Weekly Presets')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'clinic_working_hours.presets_desc',
                                'Select a standard schedule template to populate your working week in one click.'
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 pt-2">
                        {/* Preset 1: Regular single shift */}
                        <div
                            onClick={() => applyPreset('regular')}
                            className="p-4 rounded-xl border border-border hover:border-primary cursor-pointer hover:bg-primary/[0.03] transition-all flex items-start justify-between gap-3 group"
                        >
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                    {t('clinic_working_hours.preset_regular', 'Regular Week (Sat-Thu: 09:00 - 17:00)')}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'clinic_working_hours.preset_regular_desc',
                                        '6 days a week (Saturday through Thursday) from 9:00 AM to 5:00 PM. Friday is off.'
                                    )}
                                </p>
                            </div>
                            <Button size="sm" variant="outline" disabled={isSyncing} className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground">
                                {t('clinic_working_hours.apply_preset', 'Apply')}
                            </Button>
                        </div>

                        {/* Preset 2: Two shifts per day (Morning + Evening) */}
                        <div
                            onClick={() => applyPreset('two_shifts')}
                            className="p-4 rounded-xl border border-border hover:border-primary cursor-pointer hover:bg-primary/[0.03] transition-all flex items-start justify-between gap-3 group"
                        >
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                    {t('clinic_working_hours.preset_two_shifts', 'Two Shifts (Sat-Thu: 10:00 - 14:00 & 18:00 - 22:00)')}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'clinic_working_hours.preset_two_shifts_desc',
                                        'Morning shift (10 AM - 2 PM) & Evening shift (6 PM - 10 PM) Sat-Thu. Friday is off.'
                                    )}
                                </p>
                            </div>
                            <Button size="sm" variant="outline" disabled={isSyncing} className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground">
                                {t('clinic_working_hours.apply_preset', 'Apply')}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button variant="outline" onClick={() => setIsPresetModalOpen(false)}>
                            {t('common.close', 'Close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deletingShift)} onOpenChange={() => setDeletingShift(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {t('clinic_working_hours.delete_shift', 'Delete Working Shift')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('clinic_working_hours.delete_confirm', 'Are you sure you want to delete this working hour shift?')}
                            {deletingShift && (
                                <span className="block mt-2 font-bold font-mono text-foreground" dir="ltr">
                                    {formatTime12h(deletingShift.start_time, isAr)} - {formatTime12h(deletingShift.end_time, isAr)}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingShift(null)}
                            disabled={isDeleting}
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ClinicLayout>
    );
}
