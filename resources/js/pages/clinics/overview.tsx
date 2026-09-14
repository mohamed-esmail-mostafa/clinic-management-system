import React, { useState, useMemo } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import PageHeader from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { Booking } from '@/types/booking';
import { Visit } from '@/types/visit';

// Icons
import {
    Users,
    Calendar,
    CalendarCheck,
    Activity,
    Pill,
    Plus,
    Clock,
    ArrowUpRight,
    CheckCircle2,
    Building2,
    TrendingUp,
    CalendarDays,
    Phone,
    FileText,
} from 'lucide-react';

interface ChartItem {
    date: string;
    day: string;
    label: string;
    visits: number;
    examinations: number;
    follow_ups: number;
}

interface Props {
    clinic?: any;
    stats?: {
        total_patients: number;
        new_patients_this_month: number;
        todays_bookings: number;
        todays_confirmed_bookings: number;
        total_bookings: number;
        total_visits: number;
        visits_this_month: number;
        active_medications: number;
    };
    visits_chart?: ChartItem[];
    booking_statuses?: {
        confirmed: number;
        pending: number;
        completed: number;
        cancelled: number;
    };
    todays_appointments?: Booking[];
    recent_visits?: Visit[];
}

export default function ClinicOverviewPage({
    clinic: propClinic,
    stats = {
        total_patients: 0,
        new_patients_this_month: 0,
        todays_bookings: 0,
        todays_confirmed_bookings: 0,
        total_bookings: 0,
        total_visits: 0,
        visits_this_month: 0,
        active_medications: 0,
    },
    visits_chart = [],
    booking_statuses = { confirmed: 0, pending: 0, completed: 0, cancelled: 0 },
    todays_appointments = [],
    recent_visits = [],
}: Props) {
    const { t, isRtl } = useImport();
    const { authClinic } = useAuthClinics();

    const clinic = propClinic || authClinic;
    const clinicSlug = clinic?.slug || '';

    // Chart Timeframe Switcher (7 days vs 14 days)
    const [chartDays, setChartDays] = useState<7 | 14>(14);
    const [hoveredBar, setHoveredBar] = useState<ChartItem | null>(null);

    const activeChartData = useMemo(() => {
        if (chartDays === 7) {
            return visits_chart.slice(-7);
        }
        return visits_chart;
    }, [visits_chart, chartDays]);

    // Chart Calculations
    const maxVisits = useMemo(() => {
        const max = Math.max(...activeChartData.map((d) => d.visits), 0);
        return max === 0 ? 5 : Math.ceil(max * 1.25);
    }, [activeChartData]);

    const totalVisitsInRange = useMemo(() => {
        return activeChartData.reduce((acc, curr) => acc + curr.visits, 0);
    }, [activeChartData]);

    const dailyAverage = useMemo(() => {
        if (activeChartData.length === 0) return 0;
        return (totalVisitsInRange / activeChartData.length).toFixed(1);
    }, [totalVisitsInRange, activeChartData]);

    const peakVisitsDay = useMemo(() => {
        if (activeChartData.length === 0) return null;
        return activeChartData.reduce(
            (prev, current) => (current.visits > prev.visits ? current : prev),
            activeChartData[0]
        );
    }, [activeChartData]);

    const getInitials = (name?: string) => {
        if (!name) return 'P';
        const parts = name.trim().split(' ');
        const f = parts[0]?.charAt(0).toUpperCase() || '';
        const l = parts[1]?.charAt(0).toUpperCase() || '';
        return `${f}${l}` || 'P';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[9px] sm:text-[10px] px-1.5 py-0.5">
                        {t('bookings.status_confirmed', 'Confirmed')}
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 text-[9px] sm:text-[10px] px-1.5 py-0.5">
                        {t('bookings.status_completed', 'Completed')}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[9px] sm:text-[10px] px-1.5 py-0.5">
                        {t('bookings.status_pending', 'Pending')}
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 text-[9px] sm:text-[10px] px-1.5 py-0.5">
                        {t('bookings.status_cancelled', 'Cancelled')}
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1.5 py-0.5">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <ClinicLayout title={clinic?.name || t('overview.title', 'Clinic Overview')}>
            <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-hidden">
                {/* Header with Quick Actions */}
                <PageHeader
                    icon={<Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />}
                    title={clinic?.name ? `${clinic.name} · ${t('overview.title', 'Clinic Overview')}` : t('overview.title', 'Clinic Overview')}
                    subtitle={t(
                        'overview.subtitle',
                        "Summary of patients, today's appointments, and daily visit performance."
                    )}
                >
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto min-w-0">
                        <Button asChild variant="outline" size="sm" className="gap-1.5 h-9 w-full sm:w-auto justify-center text-xs sm:text-sm">
                            <Link href={`/clinic/${clinicSlug}/patients`}>
                                <Plus className="h-4 w-4 shrink-0" />
                                <span className="truncate">{t('overview.add_patient', 'Add Patient')}</span>
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1.5 h-9 w-full sm:w-auto justify-center text-xs sm:text-sm">
                            <Link href={`/clinic/${clinicSlug}/booking`}>
                                <CalendarDays className="h-4 w-4 shrink-0" />
                                <span className="truncate">{t('overview.book_appointment', 'Book Appointment')}</span>
                            </Link>
                        </Button>
                    </div>
                </PageHeader>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full min-w-0">
                    {/* Total Patients */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-primary/40 transition-colors py-0 gap-0 overflow-hidden min-w-0 w-full">
                        <CardContent className="p-3 sm:p-4.5 md:p-5 flex items-start sm:items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {t('overview.total_patients', 'Total Patients')}
                                </p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.total_patients}
                                </p>
                                <div className="flex items-center gap-1 pt-0.5">
                                    <Badge
                                        variant="secondary"
                                        className="text-[9px] sm:text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 px-1 sm:px-1.5 py-0 max-w-full truncate"
                                    >
                                        +{stats.new_patients_this_month} {t('overview.new_patients_this_month', 'this month')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Bookings */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-blue-400/40 transition-colors py-0 gap-0 overflow-hidden min-w-0 w-full">
                        <CardContent className="p-3 sm:p-4.5 md:p-5 flex items-start sm:items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {t('overview.todays_bookings', "Today's Bookings")}
                                </p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.todays_bookings}
                                </p>
                                <div className="flex items-center gap-1 pt-0.5">
                                    <Badge
                                        variant="secondary"
                                        className="text-[9px] sm:text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0 px-1 sm:px-1.5 py-0 max-w-full truncate"
                                    >
                                        {stats.todays_confirmed_bookings} {t('overview.todays_confirmed', 'confirmed today')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Visits */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-emerald-400/40 transition-colors py-0 gap-0 overflow-hidden min-w-0 w-full">
                        <CardContent className="p-3 sm:p-4.5 md:p-5 flex items-start sm:items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {t('overview.total_visits', 'Total Visits')}
                                </p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {stats.total_visits}
                                </p>
                                <div className="flex items-center gap-1 pt-0.5">
                                    <Badge
                                        variant="secondary"
                                        className="text-[9px] sm:text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0 px-1 sm:px-1.5 py-0 max-w-full truncate"
                                    >
                                        {stats.visits_this_month} {t('overview.visits_this_month', 'this month')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Activity className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Medications */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-purple-400/40 transition-colors py-0 gap-0 overflow-hidden min-w-0 w-full">
                        <CardContent className="p-3 sm:p-4.5 md:p-5 flex items-start sm:items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                    {t('overview.active_medications', 'Active Medications')}
                                </p>
                                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.active_medications}
                                </p>
                                <div className="flex items-center gap-1 pt-0.5">
                                    <span className="text-[9px] sm:text-xs text-gray-400 truncate block">
                                        {t('medications.title', 'Pharmacy stock items')}
                                    </span>
                                </div>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                <Pill className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Visits Per Day Interactive Chart */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden w-full min-w-0 max-w-full py-0 gap-0">
                    <CardHeader className="p-3.5 sm:p-5 pb-2 w-full min-w-0 gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full min-w-0">
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                                    <span className="truncate">{t('overview.visits_trend', 'Daily Visits Trend')}</span>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5 line-clamp-1 sm:line-clamp-none">
                                    {t(
                                        'overview.visits_trend_desc',
                                        'Number of medical visits (examinations & follow-ups) per day.'
                                    )}
                                </CardDescription>
                            </div>

                            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0">
                                {/* Legend */}
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-primary" />
                                        <span>{t('overview.examinations', 'Examinations')}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span>{t('overview.follow_ups', 'Follow-ups')}</span>
                                    </span>
                                </div>

                                {/* Range Buttons */}
                                <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg shrink-0">
                                    <Button
                                        type="button"
                                        variant={chartDays === 7 ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setChartDays(7)}
                                        className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-2.5"
                                    >
                                        {t('overview.last_7_days', '7 Days')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={chartDays === 14 ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setChartDays(14)}
                                        className="h-6 sm:h-7 text-[10px] sm:text-xs px-2 sm:px-2.5"
                                    >
                                        {t('overview.last_14_days', '14 Days')}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-6 pt-2.5 mt-1 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 w-full min-w-0">
                            <div>
                                <span className="text-[10px] sm:text-xs">{t('overview.total_visits', 'Total in period')}: </span>
                                <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {totalVisitsInRange}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] sm:text-xs">{t('overview.daily_average', 'Daily Average')}: </span>
                                <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                    {dailyAverage}
                                </span>
                            </div>
                            {peakVisitsDay && (
                                <div className="col-span-2 sm:col-span-1">
                                    <span className="text-[10px] sm:text-xs">{t('overview.peak_day', 'Peak Day')}: </span>
                                    <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                        {peakVisitsDay.visits} ({peakVisitsDay.label})
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Selected / Hovered Bar Mobile Pill */}
                        {hoveredBar && (
                            <div className="mt-2 p-2 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-1.5 text-xs animate-in fade-in duration-150 w-full min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-bold text-gray-900 dark:text-white text-[11px] sm:text-xs truncate">
                                        {hoveredBar.label} ({hoveredBar.day}):
                                    </span>
                                    <span className="font-semibold text-primary text-[11px] sm:text-xs shrink-0">
                                        {hoveredBar.visits} {t('overview.visits_count', 'visits')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] shrink-0">
                                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span>{hoveredBar.examinations} Exam</span>
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span>{hoveredBar.follow_ups} Follow-up</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="p-3 sm:p-5 pt-0 pb-3 sm:pb-5 w-full min-w-0 max-w-full overflow-hidden">
                        {/* Scrollable Container on Mobile */}
                        <div className="w-full max-w-full overflow-x-auto pb-2 scrollbar-thin">
                            <div
                                className={`relative h-56 sm:h-64 flex items-end justify-between gap-1 sm:gap-3 px-1 sm:px-2 pt-8 pb-4 ${
                                    chartDays === 14 ? 'min-w-[400px] sm:min-w-0' : 'min-w-[260px] sm:min-w-0'
                                } w-full`}
                            >
                                {/* Gridlines */}
                                <div className="absolute inset-x-0 inset-y-8 flex flex-col justify-between pointer-events-none opacity-30">
                                    <div className="border-b border-dashed border-gray-300 dark:border-gray-700" />
                                    <div className="border-b border-dashed border-gray-300 dark:border-gray-700" />
                                    <div className="border-b border-dashed border-gray-300 dark:border-gray-700" />
                                    <div className="border-b border-gray-200 dark:border-gray-800" />
                                </div>

                                {activeChartData.map((item) => {
                                    const heightPercent =
                                        maxVisits > 0 ? Math.min((item.visits / maxVisits) * 100, 100) : 0;
                                    const examPercent =
                                        item.visits > 0 ? (item.examinations / item.visits) * 100 : 0;
                                    const isHovered = hoveredBar?.date === item.date;

                                    return (
                                        <div
                                            key={item.date}
                                            className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer z-10 select-none min-w-[22px] sm:min-w-0"
                                            onClick={() => setHoveredBar(hoveredBar?.date === item.date ? null : item)}
                                            onMouseEnter={() => setHoveredBar(item)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        >
                                            {/* Hover Tooltip (Desktop) */}
                                            {isHovered && (
                                                <div className="hidden sm:block absolute -top-12 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] font-medium shadow-xl pointer-events-none z-30 whitespace-nowrap animate-in fade-in zoom-in-95">
                                                    <div className="font-bold">{item.label}</div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-300">
                                                        <span>{item.visits} {t('overview.visits_count', 'visits')}</span>
                                                        <span>•</span>
                                                        <span className="text-primary-foreground">{item.examinations} Exam</span>
                                                        <span>•</span>
                                                        <span className="text-blue-300">{item.follow_ups} Follow-up</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bar Container */}
                                            <div className="w-full max-w-[26px] sm:max-w-[36px] flex flex-col justify-end h-full">
                                                <div
                                                    className={`w-full rounded-t-md overflow-hidden transition-all duration-300 flex flex-col justify-end ${
                                                        isHovered ? 'scale-105 shadow-md ring-2 ring-primary/40' : ''
                                                    } ${
                                                        item.visits === 0
                                                            ? 'bg-gray-100 dark:bg-gray-800 h-1'
                                                            : 'bg-primary'
                                                    }`}
                                                    style={{
                                                        height: item.visits === 0 ? '4px' : `${Math.max(heightPercent, 6)}%`,
                                                    }}
                                                >
                                                    {/* Stacked Follow-up Segment */}
                                                    {item.follow_ups > 0 && (
                                                        <div
                                                            className="w-full bg-blue-500"
                                                            style={{ height: `${100 - examPercent}%` }}
                                                        />
                                                    )}
                                                    {/* Examination Segment */}
                                                    {item.examinations > 0 && (
                                                        <div
                                                            className="w-full bg-primary"
                                                            style={{ height: `${examPercent}%` }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* X Axis Label */}
                                            <div className="mt-2 text-center w-full px-0.5">
                                                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 dark:text-gray-300 truncate">
                                                    {item.day}
                                                </p>
                                                <p className="text-[8px] sm:text-[9px] text-gray-400 font-mono">
                                                    {item.date.slice(8, 10)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Two Column Grid: Today's Queue & Recent Visits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-6 w-full min-w-0">
                    {/* Today's Appointments Queue */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden w-full min-w-0 py-0 gap-0">
                        <CardHeader className="p-3.5 sm:p-5 pb-3 border-b border-gray-100 dark:border-gray-800 w-full min-w-0 gap-1.5">
                            <div className="flex items-center justify-between gap-2 w-full min-w-0">
                                <div className="min-w-0 flex-1">
                                    <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />
                                        <span className="truncate">{t('overview.todays_queue', "Today's Appointments")}</span>
                                        <Badge variant="outline" className="ml-1 text-xs shrink-0 font-mono">
                                            {todays_appointments.length}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-0.5 line-clamp-1 sm:line-clamp-none">
                                        {t(
                                            'overview.todays_queue_desc',
                                            "Scheduled appointments for today and their statuses."
                                        )}
                                    </CardDescription>
                                </div>
                                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs h-8 shrink-0 px-2 sm:px-3">
                                    <Link href={`/clinic/${clinicSlug}/booking`}>
                                        <span>{t('overview.view_all_bookings', 'View All')}</span>
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Booking Statuses Breakdown Pills */}
                            {booking_statuses && (
                                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1.5">
                                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                                        {booking_statuses.confirmed} {t('bookings.status_confirmed', 'Confirmed')}
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0">
                                        {booking_statuses.pending} {t('bookings.status_pending', 'Pending')}
                                    </Badge>
                                    <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0">
                                        {booking_statuses.completed} {t('bookings.status_completed', 'Completed')}
                                    </Badge>
                                    {booking_statuses.cancelled > 0 && (
                                        <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-0">
                                            {booking_statuses.cancelled} {t('bookings.status_cancelled', 'Cancelled')}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800 w-full min-w-0">
                            {todays_appointments.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center text-gray-400 space-y-2">
                                    <Calendar className="h-7 w-7 sm:h-8 sm:w-8 mx-auto text-gray-300 dark:text-gray-600" />
                                    <p className="text-xs">
                                        {t('overview.no_bookings_today', 'No appointments scheduled for today.')}
                                    </p>
                                    <Button asChild size="sm" variant="outline" className="text-xs h-8">
                                        <Link href={`/clinic/${clinicSlug}/booking`}>
                                            {t('overview.book_appointment', 'Book an Appointment')}
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                todays_appointments.map((booking) => {
                                    const patientName = booking.patient
                                        ? `${booking.patient.first_name} ${booking.patient.last_name}`
                                        : booking.name || t('bookings.unregistered_patient', 'Unregistered Patient');
                                    const phone = booking.patient?.phone || booking.phone;

                                    return (
                                        <div
                                            key={booking.id}
                                            className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors w-full min-w-0"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                {/* Time Badge */}
                                                <div className="text-center px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 min-w-[50px] sm:min-w-[58px]">
                                                    <p className="text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white font-mono">
                                                        {booking.appointment_time}
                                                    </p>
                                                </div>

                                                {/* Patient Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                                        {patientName}
                                                    </p>
                                                    {phone && (
                                                        <p className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 truncate">
                                                            <Phone className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{phone}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                <Badge variant="outline" className="text-[9px] sm:text-[10px] capitalize font-normal px-1.5 py-0.5 hidden sm:inline-flex">
                                                    {booking.type === 'new'
                                                        ? t('bookings.type_new', 'New')
                                                        : t('bookings.type_follow_up', 'Follow-up')}
                                                </Badge>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Visits Log */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden w-full min-w-0 py-0 gap-0">
                        <CardHeader className="p-3.5 sm:p-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between w-full min-w-0 gap-2">
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
                                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
                                    <span className="truncate">{t('overview.recent_visits', 'Recent Visits')}</span>
                                    <Badge variant="outline" className="ml-1 text-xs shrink-0 font-mono">
                                        {recent_visits.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5 line-clamp-1 sm:line-clamp-none">
                                    {t(
                                        'overview.recent_visits_desc',
                                        'Log of latest patient visits to the clinic.'
                                    )}
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs h-8 shrink-0 px-2 sm:px-3">
                                <Link href={`/clinic/${clinicSlug}/patients`}>
                                    <span>{t('overview.view_all_patients', 'View Patients')}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800 w-full min-w-0">
                            {recent_visits.length === 0 ? (
                                <div className="p-6 sm:p-8 text-center text-gray-400 space-y-2">
                                    <Activity className="h-7 w-7 sm:h-8 sm:w-8 mx-auto text-gray-300 dark:text-gray-600" />
                                    <p className="text-xs">
                                        {t('overview.no_recent_visits', 'No recent visits recorded yet.')}
                                    </p>
                                    <Button asChild size="sm" variant="outline" className="text-xs h-8">
                                        <Link href={`/clinic/${clinicSlug}/patients`}>
                                            {t('overview.view_all_patients', 'Go to Patients')}
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                recent_visits.map((visit) => {
                                    const patientName = visit.patient
                                        ? `${visit.patient.first_name} ${visit.patient.last_name}`
                                        : 'Patient';

                                    return (
                                        <div
                                            key={visit.id}
                                            className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors w-full min-w-0"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-primary/10 text-primary font-semibold shrink-0">
                                                    <AvatarFallback className="text-xs sm:text-sm">{getInitials(patientName)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                                        {patientName}
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 font-mono truncate">
                                                        <Calendar className="h-3 w-3 shrink-0" />
                                                        <span className="truncate">{visit.visited_at}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[9px] sm:text-[10px] capitalize font-medium px-1.5 py-0.5 ${
                                                        visit.type === 'examination'
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                    }`}
                                                >
                                                    {visit.type === 'examination'
                                                        ? t('overview.examinations', 'Examination')
                                                        : t('overview.follow_ups', 'Follow-up')}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ClinicLayout>
    );
}
