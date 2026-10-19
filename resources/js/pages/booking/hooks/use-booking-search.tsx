
import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { Booking } from '@/types';

interface UseBookingSearchProps {
    filters?: {
        search?: string;
        status?: string;
        type?: string;
        doctor_id?: string;
        date?: string
    };
    serverStats?: any;
    bookingList: Booking[]

}

export default function useBookingSearch({
    filters,
    serverStats,
    bookingList
}: UseBookingSearchProps) {
    const { authClinic } = useAuthClinics();

    const [searchTerm, setSearchTerm] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [doctorFilter, setDoctorFilter] = useState(filters?.doctor_id ?? 'all');
    const [typeFilter, setTypeFilter] = useState(filters?.type ?? 'all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dateFilter, setDateFilter] = useState(filters?.date || '');
    const [patientType, setPatientType] = useState<'registered' | 'unregistered'>('registered');



    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            if (!authClinic?.slug) return;

            router.get(
                `/clinic/${authClinic.slug}/today/booking`,
                {
                    search: searchTerm.trim() || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    type: typeFilter !== 'all' ? typeFilter : undefined,
                    doctor_id: doctorFilter !== 'all' ? doctorFilter : undefined,
                    page: 1,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [
        searchTerm,
        statusFilter,
        typeFilter,
        doctorFilter,
        authClinic?.slug,
    ]);




    const stats = useMemo(() => {
        if (serverStats) {
            return serverStats;
        }
        const total = bookingList?.length;
        const pending = bookingList?.filter((b) => b.status === 'pending').length;
        const confirmed = bookingList?.filter((b) => b.status === 'confirmed').length;
        const completed = bookingList?.filter((b) => b.status === 'completed').length;
        const cancelled = bookingList?.filter((b) => b.status === 'cancelled' || b.status === 'no_show').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, pending, confirmed, completed, cancelled, completionRate };
    }, [serverStats, bookingList]);

    return {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        doctorFilter,
        setDoctorFilter,
        typeFilter,
        setTypeFilter,
        isRefreshing,
        setIsRefreshing,
        dateFilter,
        setDateFilter,
        patientType,
        setPatientType,
        stats
    };
}

