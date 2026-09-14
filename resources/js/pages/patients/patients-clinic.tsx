import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo } from 'react';
import { Patient, PatientField } from '@/types/patient';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { flexRender, SortingState } from '@tanstack/react-table';
import {
    useLegacyTable as useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    LegacyColumnDef as ColumnDef,
} from '@tanstack/react-table/legacy';

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
    Search,
    Users,
    Eye,
    Phone,
    MapPin,
    Calendar,
    AlertCircle,
    FileText,
    User,
    Stethoscope,
    Sliders,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Heart,
} from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import PatientStats from './components/patient-stats';

interface Props {
    clinic?: any;
    patients?: Patient[];
    custom_fields?: PatientField[];
}

export default function PatientsClinic({ clinic: serverClinic, patients = [], custom_fields = [] }: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    // Determine current clinic slug
    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals state (Viewing details & Deleting)
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewTab, setViewTab] = useState<'info' | 'emergency' | 'custom'>('info');

    // Filter patients
    const filteredPatients = useMemo(() => {
        return patients.filter((patient) => {
            const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
            const patientNum = (patient.patient_number || '').toLowerCase();
            const phone = (patient.phone || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                fullName.includes(search) ||
                patientNum.includes(search) ||
                phone.includes(search);

            const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && patient.is_active) ||
                (statusFilter === 'inactive' && !patient.is_active);

            return matchesSearch && matchesGender && matchesStatus;
        });
    }, [patients, searchTerm, genderFilter, statusFilter]);

    // Summary statistics
    const stats = useMemo(() => {
        return {
            total: patients.length,
            active: patients.filter((p) => p.is_active).length,
            inactive: patients.filter((p) => !p.is_active).length,
            customFieldsCount: custom_fields.length,
        };
    }, [patients, custom_fields]);

    const handleToggleStatus = (patient: Patient) => {
        if (!clinicSlug) return;
        router.patch(`/clinic/${clinicSlug}/patients/${patient.id}/toggle-status`, {}, {
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

    const getInitials = (firstName: string, lastName: string) => {
        const f = firstName ? firstName.charAt(0).toUpperCase() : '';
        const l = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${f}${l}` || 'P';
    };

    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const columns = useMemo<ColumnDef<Patient>[]>(
        () => [
            {
                accessorKey: 'patient_number',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-3 h-8 text-xs font-semibold data-[state=open]:bg-accent"
                    >
                        <span>{t('patients.patient_number', 'Patient')}</span>
                        {column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
                        ) : column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                        ) : (
                            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => {
                    const patient = row.original;
                    const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 font-semibold shrink-0">
                                <AvatarFallback>{getInitials(patient.first_name, patient.last_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {fullName}
                                </p>
                                <p className="text-xs text-primary font-mono">
                                    {patient.patient_number}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'phone',
                header: () => <span className="text-xs font-semibold">{t('patients.phone', 'Contact Info')}</span>,
                cell: ({ row }) => {
                    const patient = row.original;
                    return (
                        <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                            {patient.phone && (
                                <p className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    {patient.phone}
                                </p>
                            )}
                            {patient.address && (
                                <p className="flex items-center gap-1.5 text-gray-500">
                                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    {patient.address}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'gender_dob',
                header: () => <span className="text-xs font-semibold">{t('patients.gender', 'Gender / DOB')}</span>,
                cell: ({ row }) => {
                    const patient = row.original;
                    return (
                        <div className="text-xs space-y-1">
                            {patient.gender && (
                                <Badge variant="outline" className="capitalize text-[11px] font-normal">
                                    {t(`patients.${patient.gender}`, patient.gender)}
                                </Badge>
                            )}
                            {patient.date_of_birth && (
                                <p className="text-gray-500 text-[11px] flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    {patient.date_of_birth}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'blood_marital',
                header: () => <span className="text-xs font-semibold">{t('patients.blood_type', 'Blood & Marital')}</span>,
                cell: ({ row }) => {
                    const patient = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            {patient.blood_type && (
                                <Badge className="bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 font-bold text-[11px]">
                                    {patient.blood_type}
                                </Badge>
                            )}
                            {patient.marital_status && (
                                <Badge variant="secondary" className="capitalize text-[11px]">
                                    {t(`patients.${patient.marital_status}`, patient.marital_status)}
                                </Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'is_active',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-3 h-8 text-xs font-semibold data-[state=open]:bg-accent"
                    >
                        <span>{t('patients.is_active', 'Status')}</span>
                        {column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
                        ) : column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                        ) : (
                            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                        )}
                    </Button>
                ),
                cell: ({ row }) => {
                    const patient = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={patient.is_active}
                                onCheckedChange={() => handleToggleStatus(patient)}
                            />
                            <Badge
                                className={
                                    patient.is_active
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100'
                                }
                            >
                                {patient.is_active ? t('patients.active', 'Active') : t('patients.inactive', 'Inactive')}
                            </Badge>
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-end text-xs font-semibold">{t('common.actions', 'Actions')}</div>,
                cell: ({ row }) => {
                    const patient = row.original;
                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
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
                    );
                },
            },
        ],
        [clinicSlug, t]
    );

    const table = useReactTable({
        data: filteredPatients,
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

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
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs shrink-0">
                            <Plus className="h-4 w-4" />
                            {t('patients.add_new', 'Add New Patient')}
                        </Button>
                    </Link>
                </PageHeader>

                {/* Stats Cards */}
                <PatientStats stats={stats} />

                {/* Filters & Search */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                            <Input
                                placeholder={t('patients.search_placeholder', 'Search by name, phone, patient number...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={isRtl ? 'pr-9' : 'pl-9'}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:w-auto">
                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger className="w-full md:w-[160px]">
                                    <SelectValue placeholder={t('patients.gender', 'Gender')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('patients.all_genders', 'All Genders')}</SelectItem>
                                    <SelectItem value="male">{t('patients.male', 'Male')}</SelectItem>
                                    <SelectItem value="female">{t('patients.female', 'Female')}</SelectItem>
                                    <SelectItem value="other">{t('patients.other', 'Other')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[160px]">
                                    <SelectValue placeholder={t('patients.is_active', 'Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('patients.all_statuses', 'All Statuses')}</SelectItem>
                                    <SelectItem value="active">{t('patients.active', 'Active')}</SelectItem>
                                    <SelectItem value="inactive">{t('patients.inactive', 'Inactive')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Responsive View (Cards on mobile, TanStack Table on desktop) */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    {/* Mobile View: Cards */}
                    <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {table.getRowModel().rows.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <Users className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                {t('patients.no_patients', 'No patients found.')}
                            </div>
                        ) : (
                            table.getRowModel().rows.map((row) => {
                                const patient = row.original;
                                const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
                                return (
                                    <div key={patient.id} className="p-4 space-y-3 bg-white dark:bg-gray-900">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 font-semibold shrink-0">
                                                    <AvatarFallback>{getInitials(patient.first_name, patient.last_name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-base">
                                                        {fullName}
                                                    </p>
                                                    <p className="text-xs text-primary font-mono font-medium">
                                                        {patient.patient_number}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={patient.is_active}
                                                    onCheckedChange={() => handleToggleStatus(patient)}
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
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

                                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t('patients.phone', 'Phone')}</span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                                                    <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                                                    {patient.phone || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t('patients.gender', 'Gender / DOB')}</span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                                                    {patient.gender ? t(`patients.${patient.gender}`, patient.gender) : '-'}
                                                    {patient.date_of_birth ? ` (${patient.date_of_birth})` : ''}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t('patients.blood_type', 'Blood / Marital')}</span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                                                    {patient.blood_type || '-'} {patient.marital_status ? `/ ${patient.marital_status}` : ''}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">{t('patients.address', 'Address')}</span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200 truncate mt-0.5 flex items-center gap-1">
                                                    {patient.address ? (
                                                        <>
                                                            <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                                                            {patient.address}
                                                        </>
                                                    ) : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop View: TanStack Table */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                            <Users className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                            {t('patients.no_patients', 'No patients found.')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {table.getPageCount() > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span>
                                    {t('common.showing', 'Page')} <strong className="text-gray-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</strong> {t('common.of', 'of')} <strong className="text-gray-900 dark:text-white">{table.getPageCount()}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                    <strong className="text-gray-900 dark:text-white">{filteredPatients.length}</strong> {t('patients.total', 'total patients')}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('common.rows_per_page', 'Rows per page')}</span>
                                    <Select
                                        value={String(table.getState().pagination.pageSize)}
                                        onValueChange={(val) => table.setPageSize(Number(val))}
                                    >
                                        <SelectTrigger className="h-8 w-[70px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[10, 20, 30, 50].map((size) => (
                                                <SelectItem key={size} value={String(size)} className="text-xs">
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
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
                                    className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                        viewTab === 'info'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    {t('patients.tab_basic', 'Basic & Contact Info')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewTab('emergency')}
                                    className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                        viewTab === 'emergency'
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
                                        className={`pb-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                                            viewTab === 'custom'
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
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            {t('patients.delete_confirm_title', 'Delete Patient')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'patients.delete_confirm_desc',
                                'Are you sure you want to delete this patient record? This action cannot be undone.'
                            )}
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

                    <DialogFooter className="gap-2 sm:gap-0">
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
