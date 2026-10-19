import React, { useState, useMemo, useRef, useEffect } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import PageHeader from '@/components/shared/page-header';
import useAuthClinics from '@/hooks/use-auth-clinics';
import useImport from '@/hooks/use-import';
import Pagination from '@/components/shared/pagination';
import { Booking, PaginatedBookings } from '@/types/booking';
import { PaginatedPatients } from '@/types/patient';
import { User } from '@/types/auth';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import {
    Plus,
    CalendarCheck,
    CalendarDays,
    RotateCw,
} from 'lucide-react';
import BookingStats from './components/booking-stats';
import BookingProgressBar from './components/booking-progress-bar';
import BookingSearchFilter from './components/booking-search-filter';
import useBookingSearch from './hooks/use-booking-search';
import NoBooking from './components/no-booking';
import BookingCard from './components/booking-card';
import BookingDialog from './components/booking-dialog';
import { formatToday, getTodayDate } from '@/utils/date';

interface Props {
    bookings: PaginatedBookings;
    patients: PaginatedPatients;
    doctors?: User[];
    filters?: {
        search?: string;
        status?: string;
        type?: string;
        doctor_id?: string;
    };
    stats?: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        completionRate: number;
    };
}

export default function TodayBookingsPage({ bookings, patients, doctors = [], filters, stats: serverStats }: Props) {


    const { t, isRtl } = useImport();
    const { authClinic } = useAuthClinics()
    const bookingList = bookings.data;

    const {
        links: paginationLinks,
        from: paginationFrom,
        to: paginationTo,
        total: paginationTotal,
    } = bookings;
    const {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        doctorFilter,
        setDoctorFilter,
        typeFilter,
        setTypeFilter,
        isRefreshing,
        patientType, 
        setPatientType,
        setIsRefreshing ,
        stats
    } = useBookingSearch({
            filters,
            serverStats,
            bookingList
        })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const todayStr = getTodayDate();
    const formattedToday = formatToday(isRtl);












    const patientList = useMemo(() => {
        const list = patients.data;

        if (
            editingBooking?.patient &&
            !list.some((patient) => patient.id === editingBooking.patient?.id)
        ) {
            return [editingBooking.patient, ...list];
        }

        return list;
    }, [patients.data, editingBooking?.patient]);

    const displayBookings = bookingList;


    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingBooking(null);
        setPatientType('registered');
        // formik.resetForm();
    };

    const handleOpenAdd = () => {
        setEditingBooking(null);
        setPatientType('registered');
        setIsAddModalOpen(true);
    };

    const handleOpenEdit = (booking: Booking) => {
        setEditingBooking(booking);
        if (booking.patient_id) {
            setPatientType('registered');
        } else if (booking.name || booking.phone) {
            setPatientType('unregistered');
        } else {
            setPatientType('registered');
        }
        setIsAddModalOpen(true);
    };




    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['bookings', 'stats'],
            onFinish: () => {
                setIsRefreshing(false);
                toast.success(t('common.refreshed', 'Data refreshed'));
            },
        });
    };





    return (
        <ClinicLayout title={t('bookings.todays_bookings', "Today's Bookings")}>
            <div className="space-y-6 w-full max-w-full">
                {/* Page Header */}
                <PageHeader
                    title={t('bookings.todays_bookings', "Today's Bookings")}
                    subtitle={`${formattedToday} • ${stats.total} ${t('bookings.scheduled_appointments', 'scheduled appointments')}`}
                    icon={<CalendarCheck className="h-6 w-6 text-primary" />}
                    count={stats.total}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        {authClinic?.slug && (
                            <Link href={`/clinic/${authClinic?.slug}/booking`}>
                                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span>{t('bookings.view_all_bookings', 'All Bookings')}</span>
                                </Button>
                            </Link>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RotateCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{t('common.refresh', 'Refresh')}</span>
                        </Button>
                        <Button size="sm" className="h-9 gap-1.5" onClick={handleOpenAdd}>
                            <Plus className="h-4 w-4" />
                            <span>{t('bookings.add_new', 'Add Booking')}</span>
                        </Button>
                    </div>
                </PageHeader>

                {/* booking stats */}
                <BookingStats statusFilter={statusFilter} setStatusFilter={setStatusFilter} stats={stats} />

                {/* Progress bar if bookings exist */}
                {stats.total > 0 && (
                    <BookingProgressBar stats={stats} />
                )}

                {/* Controls Bar: Search, Status Filter Pills, Type & View Switcher */}

                <BookingSearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setStatusFilter={setStatusFilter}
                    statusFilter={statusFilter}
                    stats={stats}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    doctors={doctors}
                    doctorFilter={doctorFilter}
                    setDoctorFilter={setDoctorFilter}
                />

                {/* Main Content Area: Queue Cards View or Table View */}
                {bookingList.length === 0 ? (
                    <NoBooking
                        stats={stats}
                        setSearchTerm={setSearchTerm}
                        setStatusFilter={setStatusFilter}
                        setTypeFilter={setTypeFilter}
                        setDoctorFilter={setDoctorFilter}
                        handleOpenAdd={handleOpenAdd}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            {displayBookings.map((booking, index) => (
                                <BookingCard booking={booking} index={index} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="pt-2">
                            <Pagination
                                links={paginationLinks}
                                from={paginationFrom ?? undefined}
                                to={paginationTo ?? undefined}
                                total={paginationTotal}
                            />
                        </div>
                    </div>
                )}



                <BookingDialog
                    isAddModalOpen={isAddModalOpen}
                    setIsAddModalOpen={setIsAddModalOpen}
                    patientType={patientType}
                    editingBooking={editingBooking}
                    setPatientType={setPatientType}
                    doctors={doctors}
                    handleCloseModal={handleCloseModal}
                    patientList={patientList}
                    todayStr={todayStr}
                />

            </div>
        </ClinicLayout>
    );
}
