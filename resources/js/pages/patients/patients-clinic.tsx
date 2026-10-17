import React, { useState, useEffect, useRef, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import useImport from '@/hooks/use-import';
import { Patient, PatientField, PaginatedPatients } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import Pagination from '@/components/shared/pagination';
import PatientFilterSearch from './components/patient-filter-search';
import NoPatientsFound from './components/no-patients-found';
import PatientCard from './components/patient-card';

interface Props {
    clinic?: any;
    patients: PaginatedPatients | Patient[];
    custom_fields?: PatientField[];
    filters?: {
        search?: string;
        gender?: string;
        status?: string;
    };
    
}

export default function PatientsClinic({ patients,custom_fields = [],filters}: Props) {
    const { t, isRtl } = useImport();
    const { authClinic } = useAuthClinics()
    const isPaginated = !Array.isArray(patients) && patients !== null && typeof patients === 'object' && 'data' in patients;
    const patientList: Patient[] = isPaginated ? (patients as PaginatedPatients).data : (Array.isArray(patients) ? patients : []);
    const paginationLinks = isPaginated ? (patients as PaginatedPatients).links : [];
    const paginationFrom = isPaginated ? (patients as PaginatedPatients).from : (patientList.length > 0 ? 1 : 0);
    const paginationTo = isPaginated ? (patients as PaginatedPatients).to : patientList.length;
    const paginationTotal = isPaginated ? (patients as PaginatedPatients).total : patientList.length;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [genderFilter, setGenderFilter] = useState(filters?.gender || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');


    // Debounced Backend Search & Filter query dispatch
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            if (!authClinic?.slug) return;

            router.get(
                `/clinic/${authClinic?.slug}/patients`,
                {
                    search: searchTerm.trim() ? searchTerm.trim() : undefined,
                    gender: genderFilter !== 'all' ? genderFilter : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
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
    }, [searchTerm, genderFilter, statusFilter, authClinic?.slug]);


    return (
        <ClinicLayout title={t('patients.title')}>
            <div className="space-y-6">
                <PageHeader
                    icon={<Users className="h-7 w-7 text-primary" />}
                    title={t('patients.title')}
                    subtitle={t('patients.subtitle')}
                >

                    <div className=''>
                        <Link href={`/clinic/${authClinic?.slug}/patients/create`}>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs shrink-0 cursor-pointer">
                                <Plus className="h-4 w-4" />
                                {t('patients.add_new')}
                            </Button>
                        </Link>
                    </div>
                </PageHeader>

                {/* Stats Cards */}
                {/* <PatientStats stats={stats} /> */}

                {/* Filters & Backend Search */}
                <PatientFilterSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    genderFilter={genderFilter}
                    setGenderFilter={setGenderFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {/* Patients Cards List View */}
                {patientList.length === 0 ? (
                    <NoPatientsFound
                        searchTerm={searchTerm}
                        genderFilter={genderFilter}
                        statusFilter={statusFilter}
                        setSearchTerm={setSearchTerm}
                        setGenderFilter={setGenderFilter}
                        setStatusFilter={setStatusFilter}
                        clinicSlug={authClinic?.slug} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patientList.map((patient) => <PatientCard key={patient.id} patient={patient} custom_fields={custom_fields} />)}
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="pt-2">
                    <Pagination
                        links={paginationLinks}
                        from={paginationFrom ?? undefined}
                        to={paginationTo ?? undefined}
                        total={paginationTotal ?? undefined}
                    />
                </div>
            </div>

            {/* View Details Dialog */}

        </ClinicLayout>
    );
}
