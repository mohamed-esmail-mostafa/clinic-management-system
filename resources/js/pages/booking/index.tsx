import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Booking, PaginatedBookings } from '@/types/booking';
import { PaginatedPatients } from '@/types/patient';
import { User } from '@/types/auth';
import { router } from '@inertiajs/react';
import useImport from '@/hooks/use-import';
import { Button } from '@/components/ui/button';
import BookingCard from './components/booking-card';
import PageHeader from '@/components/shared/page-header';
import Pagination from '@/components/shared/pagination';
import { Plus, CalendarDays } from 'lucide-react';
import AllBookingStats from './components/all-booking-stats';
import AllBookingSearchFilter from './components/all-booking-search-filter';
import NoBooking from './components/no-booking';
import useBookingSearch from './hooks/use-booking-search';
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

export default function BookingPage({
    bookings, patients, doctors = [], filters, stats: serverStats
}: Props) {
    const { t, isRtl } = useImport();
    const { authClinic } = useAuthClinics()
    const bookingList = bookings.data;

    const {
        links: paginationLinks,
        from: paginationFrom,
        to: paginationTo,
        total: paginationTotal,
    } = bookings;
    const displayBookings = bookingList;



    const patientList = useMemo(() => {
        const list = patients.data;

        // if (
        //     editingBooking?.patient &&
        //     !list.some((patient) => patient.id === editingBooking.patient?.id)
        // ) {
        //     return [editingBooking.patient, ...list];
        // }

        return list;
    }, [patients.data]);

    const {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        dateFilter,
        setDateFilter,
        patientType,
        setPatientType,
        stats
    } = useBookingSearch({
        filters,
        serverStats,
        bookingList
    })

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    const todayStr = getTodayDate();
    const formattedToday = formatToday(isRtl);




    // Debounced Backend Search & Filter query dispatch
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            if (!authClinic.slug) return;

            router.get(
                `/clinic/${authClinic.slug}/booking`,
                {
                    search: searchTerm.trim() ? searchTerm.trim() : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    type: typeFilter !== 'all' ? typeFilter : undefined,
                    date: dateFilter ? dateFilter : undefined,
                    page: 1, // Reset to page 1 on new filter criteria
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                }
            );
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, typeFilter, dateFilter, authClinic.slug]);



    const handleOpenAdd = () => {
        setEditingBooking(null);
        setPatientType('registered');
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingBooking(null);
        setPatientType('registered');
        // formik.resetForm();
    };



    return (
        <ClinicLayout title={t('bookings.title', 'Bookings & Appointments')}>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    icon={<CalendarDays className="h-7 w-7 text-primary" />}
                    title={t('bookings.title', 'Bookings & Appointments')}
                    count={stats.total}
                    subtitle={t('bookings.subtitle', 'Manage clinic appointments, patient schedules, and booking statuses.')}
                >
                    <Button onClick={handleOpenAdd} className="gap-2 w-full ">
                        <Plus className="h-4 w-4" />
                        {t('bookings.add_new', 'Add New Booking')}
                    </Button>
                </PageHeader>

                {/* Stats Cards */}

                <AllBookingStats stats={stats} />




                <AllBookingSearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                />

                {/* Responsive: Mobile Cards & Desktop TanStack Table */}
                {bookingList.length === 0 ? (
                    <NoBooking
                        stats={stats}
                        setSearchTerm={setSearchTerm}
                        setStatusFilter={setStatusFilter}
                        setTypeFilter={setTypeFilter}
                        //   setDoctorFilter={setDoctorFilter}
                        handleOpenAdd={handleOpenAdd}
                    />
                ) : (
                    <div className="space-y-4">


                        <div className=" grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                            {displayBookings.map((booking, index) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* <div className="space-y-3">
                            {displayBookings.map((booking, index) => (
                                <BookingCard booking={booking} index={index} />
                            ))}
                        </div> */}

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
            </div>



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

        </ClinicLayout>
    );
}
