import React, { useState, useEffect, useRef, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import useImport from '@/hooks/use-import';
import { Patient, PatientField, PaginatedPatients } from '@/types/patient';

// UI Components
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Users,
    Eye,
    Phone,
    MapPin,
    Calendar,
    AlertCircle,
    Stethoscope,
    Sliders,
    MoreHorizontal,
} from 'lucide-react';

import PageHeader from '@/components/shared/page-header';
import Pagination from '@/components/shared/pagination';
import PatientStats from './components/patient-stats';
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
    stats?: {
        total: number;
        active: number;
        inactive: number;
        customFieldsCount?: number;
    };
}

export default function PatientsClinic({
    // clinic: serverClinic,
    patients,
    custom_fields = [],
    filters,
    stats: serverStats,
}: Props) {
    const { t, isRtl } = useImport();
    // const { clinics } = useAuthClinics() as { clinics?: any[] };
    const {authClinic}=useAuthClinics()

    // Determine current clinic slug
    // const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Extract paginated patients list and pagination metadata
    const isPaginated = !Array.isArray(patients) && patients !== null && typeof patients === 'object' && 'data' in patients;
    const patientList: Patient[] = isPaginated ? (patients as PaginatedPatients).data : (Array.isArray(patients) ? patients : []);
    const paginationLinks = isPaginated ? (patients as PaginatedPatients).links : [];
    const paginationFrom = isPaginated ? (patients as PaginatedPatients).from : (patientList.length > 0 ? 1 : 0);
    const paginationTo = isPaginated ? (patients as PaginatedPatients).to : patientList.length;
    const paginationTotal = isPaginated ? (patients as PaginatedPatients).total : patientList.length;

    // Search and filter states (synced with backend)
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [genderFilter, setGenderFilter] = useState(filters?.gender || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    // Modals state (Viewing details & Deleting)
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewTab, setViewTab] = useState<'info' | 'emergency' | 'custom'>('info');

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

    // Statistics computation
    const stats = useMemo(() => {
        if (serverStats) {
            return serverStats;
        }

        return {
            total: paginationTotal,
            active: patientList.filter((p) => p.is_active).length,
            inactive: patientList.filter((p) => !p.is_active).length,
            customFieldsCount: custom_fields.length,
        };
    }, [serverStats, paginationTotal, patientList, custom_fields]);

    const handleToggleStatus = (patient: Patient) => {
        if (!authClinic?.slug) return;
        router.patch(`/clinic/${authClinic?.slug}/patients/${patient.id}/toggle-status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('patients.status_updated', 'Patient status updated!'));
            },
            onError: () => {
                toast.error('Failed to update patient status');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingPatient || !authClinic?.slug) return;

        setIsDeleting(true);
        router.delete(`/clinic/${authClinic?.slug}/patients/${deletingPatient.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('patients.deleted_success', 'Patient deleted successfully!'));
                setDeletingPatient(null);
            },
            onError: () => {
                toast.error('Failed to delete patient');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const getInitials = (firstName?: string | null, lastName?: string | null) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : '';
        const l = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${f}${l}` || 'P';
    };

    const renderFieldValueDisplay = (field: PatientField, patient: Patient) => {
        const fieldValues = patient.field_values || (patient as any).fieldValues || [];
        const fVal = fieldValues.find((fv: any) => fv.patient_field_id === field.id);
        if (!fVal || fVal.value === null || fVal.value === '') return '-';

        let displayVal = fVal.value;
        if (field.type === 'checkbox') {
            try {
                const parsed = JSON.parse(fVal.value);
                if (Array.isArray(parsed)) {
                    displayVal = parsed.join(', ');
                }
            } catch {
                displayVal = fVal.value;
            }
        }
        return displayVal;
    };

    return (
        <ClinicLayout title={t('patients.title', 'Patients Management')}>
            <div className="space-y-6">
                <PageHeader
                    icon={<Users className="h-7 w-7 text-primary" />}
                    title={t('patients.title', 'Patients Management')}
                    subtitle={t('patients.subtitle', 'View and manage clinic patients, contact info, and custom clinic details.')}
                >
                    <Link href={`/clinic/${authClinic?.slug}/patients/create`}>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs shrink-0 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            {t('patients.add_new', 'Add New Patient')}
                        </Button>
                    </Link>
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
