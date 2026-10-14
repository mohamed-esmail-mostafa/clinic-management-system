
import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import useAuthClinics from '@/hooks/use-auth-clinics';

interface UseBookingSearchProps {
    filters?: {
        search?: string;
        status?: string;
        type?: string;
        doctor_id?: string;
    };
}

export default function useBookingSearch({
    filters,
}: UseBookingSearchProps) {
    const { authClinic } = useAuthClinics();

    const [searchTerm, setSearchTerm] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [doctorFilter, setDoctorFilter] = useState(filters?.doctor_id ?? 'all');
    const [typeFilter, setTypeFilter] = useState(filters?.type ?? 'all');
    const [isRefreshing, setIsRefreshing] = useState(false);

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
    };
}

