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
    clinic: serverClinic,
    patients,
    custom_fields = [],
    filters,
    stats: serverStats,
}: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    // Determine current clinic slug
    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

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
            if (!clinicSlug) return;

            router.get(
                `/clinic/${clinicSlug}/patients`,
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
    }, [searchTerm, genderFilter, statusFilter, clinicSlug]);

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
        if (!clinicSlug) return;
        router.patch(`/clinic/${clinicSlug}/patients/${patient.id}/toggle-status`, {}, {
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
        if (!deletingPatient || !clinicSlug) return;

        setIsDeleting(true);
        router.delete(`/clinic/${clinicSlug}/patients/${deletingPatient.id}`, {
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
                    <Link href={`/clinic/${clinicSlug}/patients/create`}>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs shrink-0 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            {t('patients.add_new', 'Add New Patient')}
                        </Button>
                    </Link>
                </PageHeader>

                {/* Stats Cards */}
                <PatientStats stats={stats} />

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
                        clinicSlug={clinicSlug} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patientList.map((patient) => {
                            const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.full_name || t('patients.unnamed', 'Unnamed Patient');
                            return (
                                <Card
                                    key={patient.id}
                                    className="group border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-primary/40 dark:hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden"
                                >
                                    <CardContent className="p-5 space-y-4">
                                        {/* Header: Avatar, Name, Number, Status Switch & Actions Menu */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-11 w-11 bg-primary/10 text-primary border border-primary/20 font-bold shrink-0">
                                                    <AvatarFallback>{getInitials(patient.first_name, patient.last_name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingPatient(patient)}
                                                        className="font-bold text-gray-900 dark:text-white text-base hover:text-primary transition-colors text-start truncate block max-w-[180px] sm:max-w-[200px]"
                                                        title={fullName}
                                                    >
                                                        {fullName}
                                                    </button>
                                                    <span className="text-xs text-primary font-mono font-medium block">
                                                        {patient.patient_number}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Switch
                                                    checked={patient.is_active}
                                                    onCheckedChange={() => handleToggleStatus(patient)}
                                                    title={patient.is_active ? t('patients.active', 'Active') : t('patients.inactive', 'Inactive')}
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/clinic/${clinicSlug}/patients/${patient.id}/visits`}
                                                                className="flex items-center gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                                                            >
                                                                <Stethoscope className="h-4 w-4" />
                                                                {t('visits.title', 'Patient Visits')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setViewingPatient(patient)}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            {t('patients.view', 'View Details')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={`/clinic/${clinicSlug}/patients/${patient.id}/edit`}
                                                                className="flex items-center gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                {t('patients.edit', 'Edit Patient')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingPatient(patient)}
                                                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 font-medium"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            {t('patients.delete', 'Delete Patient')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Quick Badges row */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                            <Badge
                                                className={
                                                    patient.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 text-[11px] font-medium'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[11px] font-medium'
                                                }
                                            >
                                                {patient.is_active ? t('patients.active', 'Active') : t('patients.inactive', 'Inactive')}
                                            </Badge>

                                            {patient.gender && (
                                                <Badge variant="outline" className="capitalize text-[11px] font-normal">
                                                    {t(`patients.${patient.gender}`, patient.gender)}
                                                </Badge>
                                            )}

                                            {patient.blood_type && (
                                                <Badge className="bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 font-bold text-[11px]">
                                                    {patient.blood_type}
                                                </Badge>
                                            )}

                                            {patient.marital_status && (
                                                <Badge variant="secondary" className="capitalize text-[11px] font-normal">
                                                    {t(`patients.${patient.marital_status}`, patient.marital_status)}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/80 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                                                    {t('patients.phone', 'Phone')}
                                                </span>
                                                {patient.phone ? (
                                                    <a
                                                        href={`tel:${patient.phone}`}
                                                        className="font-medium text-gray-800 dark:text-gray-200 hover:text-primary flex items-center gap-1 mt-0.5 truncate"
                                                        dir="ltr"
                                                    >
                                                        <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                                                        <span>{patient.phone}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 mt-0.5 block">-</span>
                                                )}
                                            </div>

                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                                                    {t('patients.date_of_birth', 'Date of Birth')}
                                                </span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5 truncate">
                                                    <Calendar className="h-3 w-3 text-gray-400 shrink-0" />
                                                    <span>{patient.date_of_birth || '-'}</span>
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                                                    {t('patients.address', 'Address')}
                                                </span>
                                                <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mt-0.5 truncate">
                                                    {patient.address ? (
                                                        <>
                                                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                                                            <span className="truncate">{patient.address}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Bottom Quick Card Actions */}
                                        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 gap-2">
                                            <Link
                                                href={`/clinic/${clinicSlug}/patients/${patient.id}/visits`}
                                                className="flex-1"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 gap-1.5 h-8 cursor-pointer"
                                                >
                                                    <Stethoscope className="h-3.5 w-3.5" />
                                                    {t('visits.title', 'Visits')}
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setViewingPatient(patient)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1 h-8 px-2.5 cursor-pointer"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                {t('patients.view', 'View')}
                                            </Button>

                                            <Link href={`/clinic/${clinicSlug}/patients/${patient.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1 h-8 px-2.5 cursor-pointer"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    {t('common.edit', 'Edit')}
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
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
            <Dialog open={!!viewingPatient} onOpenChange={(open) => !open && setViewingPatient(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-3">
                            <Avatar className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 font-semibold">
                                <AvatarFallback>{viewingPatient ? getInitials(viewingPatient.first_name, viewingPatient.last_name) : 'P'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span>{viewingPatient ? `${viewingPatient.first_name} ${viewingPatient.last_name}` : ''}</span>
                                <p className="text-xs text-primary font-mono font-normal">
                                    {viewingPatient?.patient_number}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {viewingPatient && (
                        <div className="space-y-4">
                            {/* View Modal Tabs */}
                            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setViewTab('info')}
                                    className={`pb-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${viewTab === 'info'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    {t('patients.tab_basic', 'Basic & Contact Info')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewTab('emergency')}
                                    className={`pb-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${viewTab === 'emergency'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    {t('patients.tab_emergency', 'Emergency & Notes')}
                                </button>
                                {custom_fields.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setViewTab('custom')}
                                        className={`pb-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${viewTab === 'custom'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                            }`}
                                    >
                                        <Sliders className="h-3.5 w-3.5" />
                                        {t('patients.tab_custom_fields', 'Clinic Custom Fields')}
                                    </button>
                                )}
                            </div>

                            {viewTab === 'info' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.gender', 'Gender')}</span>
                                        <p className="font-medium capitalize">{viewingPatient.gender ? t(`patients.${viewingPatient.gender}`, viewingPatient.gender) : '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.date_of_birth', 'Date of Birth')}</span>
                                        <p className="font-medium">{viewingPatient.date_of_birth || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.phone', 'Phone')}</span>
                                        <p className="font-medium">{viewingPatient.phone || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.secondary_phone', 'Secondary Phone')}</span>
                                        <p className="font-medium">{viewingPatient.secondary_phone || '-'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.address', 'Address')}</span>
                                        <p className="font-medium">{viewingPatient.address || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.is_active', 'Status')}</span>
                                        <div>
                                            <Badge className={viewingPatient.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}>
                                                {viewingPatient.is_active ? t('patients.active', 'Active') : t('patients.inactive', 'Inactive')}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewTab === 'emergency' && (
                                <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.emergency_name', 'Emergency Contact')}</span>
                                            <p className="font-medium">{viewingPatient.emergency_contact_name || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.emergency_phone', 'Emergency Phone')}</span>
                                            <p className="font-medium">{viewingPatient.emergency_contact_phone || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.emergency_relation', 'Relation')}</span>
                                            <p className="font-medium">{viewingPatient.emergency_contact_relation || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.blood_type', 'Blood Type')}</span>
                                            <p className="font-medium">{viewingPatient.blood_type || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.marital_status', 'Marital Status')}</span>
                                            <p className="font-medium capitalize">{viewingPatient.marital_status ? t(`patients.${viewingPatient.marital_status}`, viewingPatient.marital_status) : '-'}</p>
                                        </div>
                                    </div>

                                    {viewingPatient.notes && (
                                        <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <span className="text-gray-400 text-xs uppercase font-semibold">{t('patients.notes', 'Medical Notes')}</span>
                                            <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md whitespace-pre-wrap">{viewingPatient.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {viewTab === 'custom' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    {custom_fields.map((field) => (
                                        <div key={field.id} className="space-y-1 p-2.5 rounded-md bg-gray-50 dark:bg-gray-800/50">
                                            <span className="text-gray-400 text-xs uppercase font-semibold">{field.label}</span>
                                            <p className="font-medium">{renderFieldValueDisplay(field, viewingPatient)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Link href={`/clinic/${clinicSlug}/patients/${viewingPatient?.id}/edit`}>
                            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Pencil className="h-4 w-4" />
                                {t('patients.edit', 'Edit Patient')}
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => setViewingPatient(null)}>
                            {t('common.close', 'Close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deletingPatient} onOpenChange={(open) => !open && setDeletingPatient(null)}>
                <DialogContent>
                    <DialogHeader className="mt-6">
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            {t('patients.delete_confirm_title', 'Delete Patient')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('patients.delete_confirm_desc', 'Are you sure you want to delete this patient record? This action cannot be undone.')}
                        </DialogDescription>
                    </DialogHeader>

                    {deletingPatient && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-100 dark:border-red-900 text-sm space-y-1">
                            <p className="font-semibold text-red-900 dark:text-red-300">
                                {deletingPatient.first_name} {deletingPatient.last_name}
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-400 font-mono">
                                {deletingPatient.patient_number}
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-4">
                        <Button variant="outline" onClick={() => setDeletingPatient(null)} disabled={isDeleting}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ClinicLayout>
    );
}
