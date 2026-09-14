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
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200">
                        {t('bookings.status_confirmed', 'Confirmed')}
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200">
                        {t('bookings.status_completed', 'Completed')}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200">
                        {t('bookings.status_pending', 'Pending')}
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200">
                        {t('bookings.status_cancelled', 'Cancelled')}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <ClinicLayout title={clinic?.name || t('overview.title', 'Clinic Overview')}>
            <div className="space-y-6">
                {/* Header with Quick Actions */}
                <PageHeader
                    icon={<Building2 className="h-7 w-7 text-primary" />}
                    title={clinic?.name ? `${clinic.name} · ${t('overview.title', 'Clinic Overview')}` : t('overview.title', 'Clinic Overview')}
                    subtitle={t(
                        'overview.subtitle',
                        "Summary of patients, today's appointments, and daily visit performance."
                    )}
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button asChild variant="outline" size="sm" className="gap-1.5 h-9">
                            <Link href={`/clinic/${clinicSlug}/patients`}>
                                <Plus className="h-4 w-4" />
                                {t('overview.add_patient', 'Add Patient')}
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1.5 h-9">
                            <Link href={`/clinic/${clinicSlug}/booking`}>
                                <CalendarDays className="h-4 w-4" />
                                {t('overview.book_appointment', 'Book Appointment')}
                            </Link>
                        </Button>
                    </div>
                </PageHeader>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Patients */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-primary/40 transition-colors">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('overview.total_patients', 'Total Patients')}
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.total_patients}
                                </p>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0"
                                    >
                                        +{stats.new_patients_this_month} {t('overview.new_patients_this_month', 'this month')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Bookings */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-blue-400/40 transition-colors">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('overview.todays_bookings', "Today's Bookings")}
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {stats.todays_bookings}
                                </p>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0"
                                    >
                                        {stats.todays_confirmed_bookings} {t('overview.todays_confirmed', 'confirmed today')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <CalendarCheck className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Visits */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-emerald-400/40 transition-colors">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('overview.total_visits', 'Total Visits')}
                                </p>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {stats.total_visits}
                                </p>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0"
                                    >
                                        {stats.visits_this_month} {t('overview.visits_this_month', 'this month')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Activity className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Medications */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs hover:border-purple-400/40 transition-colors">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('overview.active_medications', 'Active Medications')}
                                </p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {stats.active_medications}
                                </p>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <span className="text-xs text-gray-400">
                                        {t('medications.title', 'Pharmacy stock items')}
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Pill className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Visits Per Day Interactive Chart */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    <span>{t('overview.visits_trend', 'Daily Visits Trend')}</span>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    {t(
                                        'overview.visits_trend_desc',
                                        'Number of medical visits (examinations & follow-ups) per day.'
                                    )}
                                </CardDescription>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Legend */}
                                <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        {t('overview.examinations', 'Examinations')}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                        {t('overview.follow_ups', 'Follow-ups')}
                                    </span>
                                </div>

                                {/* Range Buttons */}
                                <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <Button
                                        type="button"
                                        variant={chartDays === 7 ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setChartDays(7)}
                                        className="h-7 text-xs px-2.5"
                                    >
                                        {t('overview.last_7_days', '7 Days')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={chartDays === 14 ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setChartDays(14)}
                                        className="h-7 text-xs px-2.5"
                                    >
                                        {t('overview.last_14_days', '14 Days')}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className="flex flex-wrap items-center gap-6 pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                            <div>
                                <span>{t('overview.total_visits', 'Total in period')}: </span>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">
                                    {totalVisitsInRange}
                                </span>
                            </div>
                            <div>
                                <span>{t('overview.daily_average', 'Daily Average')}: </span>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">
                                    {dailyAverage}
                                </span>
                            </div>
                            {peakVisitsDay && (
                                <div>
                                    <span>{t('overview.peak_day', 'Peak Day')}: </span>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                                        {peakVisitsDay.visits} ({peakVisitsDay.label})
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4 pb-6">
                        {/* Custom Modern SVG Bar Chart */}
                        <div className="relative h-64 w-full flex items-end justify-between gap-2 sm:gap-3 px-2 pt-8 pb-4">
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
                                        className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer z-10"
                                        onMouseEnter={() => setHoveredBar(item)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    >
                                        {/* Hover Tooltip */}
                                        {isHovered && (
                                            <div className="absolute -top-12 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] font-medium shadow-xl pointer-events-none z-30 whitespace-nowrap animate-in fade-in zoom-in-95">
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
                                        <div className="w-full max-w-[36px] flex flex-col justify-end h-full">
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
                                        <div className="mt-2 text-center">
                                            <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                                                {item.day}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-mono">
                                                {item.date.slice(8, 10)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Two Column Grid: Today's Queue & Recent Visits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Appointments Queue */}
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    <span>{t('overview.todays_queue', "Today's Appointments")}</span>
                                    <Badge variant="outline" className="ml-1 text-xs">
                                        {todays_appointments.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    {t(
                                        'overview.todays_queue_desc',
                                        "Scheduled appointments for today and their statuses."
                                    )}
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs h-8">
                                <Link href={`/clinic/${clinicSlug}/booking`}>
                                    {t('overview.view_all_bookings', 'View All')}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                            {todays_appointments.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 space-y-2">
                                    <Calendar className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600" />
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
                                            className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Time Badge */}
                                                <div className="text-center px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 min-w-[62px]">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                                                        {booking.appointment_time}
                                                    </p>
                                                </div>

                                                {/* Patient Info */}
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {patientName}
                                                    </p>
                                                    {phone && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            {phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-[10px] capitalize font-normal">
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
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-emerald-500" />
                                    <span>{t('overview.recent_visits', 'Recent Visits')}</span>
                                    <Badge variant="outline" className="ml-1 text-xs">
                                        {recent_visits.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    {t(
                                        'overview.recent_visits_desc',
                                        'Log of latest patient visits to the clinic.'
                                    )}
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs h-8">
                                <Link href={`/clinic/${clinicSlug}/patients`}>
                                    {t('overview.view_all_patients', 'View Patients')}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                            {recent_visits.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 space-y-2">
                                    <Activity className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600" />
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
                                            className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 bg-primary/10 text-primary font-semibold">
                                                    <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {patientName}
                                                    </p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                                                        <Calendar className="h-3 w-3" />
                                                        {visit.visited_at}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] capitalize font-medium ${
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
