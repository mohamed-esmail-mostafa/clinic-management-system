import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo } from 'react';
import { Medication, MedicationFormValues } from '@/types/medication';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';

// TanStack Table
import { flexRender, SortingState } from '@tanstack/react-table';
import {
    useLegacyTable as useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    LegacyColumnDef as ColumnDef,
} from '@tanstack/react-table/legacy';

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

import PageHeader from '@/components/shared/page-header';

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Pill,
    CheckCircle2,
    XCircle,
    Layers,
    AlertCircle,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface Props {
    clinic?: any;
    medications?: Medication[];
}

const DOSAGE_FORMS = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Ointment',
    'Drops',
    'Inhaler',
    'Patch',
    'Powder',
    'Cream',
    'Gel',
    'Solution',
    'Suppository',
];

const DOSAGE_UNITS = ['mg', 'ml', 'g', 'mcg', 'IU', '%', 'mg/ml', 'mcg/ml', 'units'];

export default function MedicationsPage({ clinic: serverClinic, medications = [] }: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [formFilter, setFormFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
    const [deletingMedication, setDeletingMedication] = useState<Medication | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sorting & Pagination
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Filter medications
    const filteredMedications = useMemo(() => {
        return medications.filter((med) => {
            const name = (med.name || '').toLowerCase();
            const genericName = (med.generic_name || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch = !search || name.includes(search) || genericName.includes(search);
            const matchesForm = formFilter === 'all' || med.form === formFilter;
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && med.is_active) ||
                (statusFilter === 'inactive' && !med.is_active);

            return matchesSearch && matchesForm && matchesStatus;
        });
    }, [medications, searchTerm, formFilter, statusFilter]);

    // Statistics
    const stats = useMemo(() => {
        const uniqueForms = new Set(medications.map((m) => m.form).filter(Boolean));
        return {
            total: medications.length,
            active: medications.filter((m) => m.is_active).length,
            inactive: medications.filter((m) => !m.is_active).length,
            forms: uniqueForms.size,
        };
    }, [medications]);

    // Validation Schema
    const validationSchema = Yup.object({
        name: Yup.string().trim().required(t('common.required', 'This field is required')),
        generic_name: Yup.string().nullable(),
        form: Yup.string().nullable(),
        strength: Yup.string().nullable(),
        unit: Yup.string().nullable(),
        is_active: Yup.boolean().default(true),
    });

    const initialValues: MedicationFormValues = {
        name: editingMedication?.name || '',
        generic_name: editingMedication?.generic_name || '',
        form: editingMedication?.form || '',
        strength: editingMedication?.strength || '',
        unit: editingMedication?.unit || '',
        is_active: editingMedication ? Boolean(editingMedication.is_active) : true,
    };

    const formik = useFormik<MedicationFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!clinicSlug) {
                toast.error('Clinic slug is missing.');
                setSubmitting(false);
                return;
            }

            if (editingMedication) {
                // Update Medication
                router.put(`/clinic/${clinicSlug}/medications/${editingMedication.id}`, values as any, {
                    onSuccess: () => {
                        toast.success(t('medications.updated_success', 'Medication updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating medication');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create Medication
                router.post(`/clinic/${clinicSlug}/medications`, values as any, {
                    onSuccess: () => {
                        toast.success(t('medications.created_success', 'Medication created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating medication');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingMedication(null);
        formik.resetForm();
    };

    const handleOpenEdit = (medication: Medication) => {
        setEditingMedication(medication);
        setIsAddModalOpen(true);
    };

    const handleToggleStatus = (medication: Medication) => {
        if (!clinicSlug) return;
        router.patch(`/clinic/${clinicSlug}/medications/${medication.id}/toggle-status`, {}, {
            onSuccess: () => {
                toast.success(t('medications.status_updated', 'Medication status updated!'));
            },
            onError: () => {
                toast.error('Failed to update medication status');
            },
        });
    };

    const handleDelete = () => {
        if (!deletingMedication || !clinicSlug) return;

        setIsDeleting(true);
        router.delete(`/clinic/${clinicSlug}/medications/${deletingMedication.id}`, {
            onSuccess: () => {
                toast.success(t('medications.deleted_success', 'Medication deleted successfully!'));
                setDeletingMedication(null);
            },
            onError: () => {
                toast.error('Failed to delete medication');
            },
            onFinish: () => setIsDeleting(false),
        });
    };


    // TanStack Table Columns
    const columns = useMemo<ColumnDef<Medication>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-3 h-8 text-xs font-semibold"
                    >
                        <span>{t('medications.name', 'Medication Name')}</span>
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
                    const medication = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Pill className="h-4 w-4" />
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {medication.name}
                            </p>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'generic_name',
                header: () => <span className="text-xs font-semibold">{t('medications.generic_name', 'Generic Name')}</span>,
                cell: ({ row }) => (
                    <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                        {row.original.generic_name || '-'}
                    </p>
                ),
            },
            {
                accessorKey: 'form',
                header: () => <span className="text-xs font-semibold">{t('medications.form', 'Form')}</span>,
                cell: ({ row }) =>
                    row.original.form ? (
                        <Badge variant="outline" className="text-xs capitalize font-normal bg-gray-50 dark:bg-gray-900">
                            {row.original.form}
                        </Badge>
                    ) : (
                        <span className="text-xs text-gray-400">-</span>
                    ),
            },
            {
                id: 'dosage',
                header: () => <span className="text-xs font-semibold">{t('medications.dosage', 'Dosage & Strength')}</span>,
                cell: ({ row }) => {
                    const medication = row.original;
                    return medication.strength ? (
                        <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 font-mono text-xs">
                            {medication.strength} {medication.unit || ''}
                        </Badge>
                    ) : (
                        <span className="text-xs text-gray-400">-</span>
                    );
                },
            },
            {
                accessorKey: 'is_active',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-3 h-8 text-xs font-semibold"
                    >
                        <span>{t('medications.is_active', 'Status')}</span>
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
                    const medication = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={medication.is_active}
                                onCheckedChange={() => handleToggleStatus(medication)}
                            />
                            <Badge
                                className={
                                    medication.is_active
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100'
                                }
                            >
                                {medication.is_active ? t('medications.active', 'Active') : t('medications.inactive', 'Inactive')}
                            </Badge>
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-end text-xs font-semibold">{t('common.actions', 'Actions')}</div>,
                cell: ({ row }) => {
                    const medication = row.original;
                    return (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(medication)}
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                title={t('medications.edit', 'Edit Medication')}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingMedication(medication)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title={t('medications.delete', 'Delete Medication')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [t]
    );

    const table = useReactTable({
        data: filteredMedications,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <ClinicLayout title={t('medications.title', 'Medications Management')}>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    icon={<Pill className="h-7 w-7 text-primary" />}
                    title={t('medications.title', 'Medications Management')}
                    subtitle={t('medications.subtitle', 'Manage clinic pharmacy items, dosage forms, strengths, and units.')}
                >
                    <Button
                        onClick={() => {
                            setEditingMedication(null);
                            setIsAddModalOpen(true);
                        }}
                        className="gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        {t('medications.add_new', 'Add New Medication')}
                    </Button>
                </PageHeader>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('medications.total', 'Total Medications')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Pill className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('medications.active_count', 'Active Medications')}
                                </p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {stats.active}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('medications.inactive_count', 'Inactive Medications')}
                                </p>
                                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                                    {stats.inactive}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                <XCircle className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('medications.forms_count', 'Dosage Forms')}
                                </p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                    {stats.forms}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
                                <Layers className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Filters */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                            <Input
                                placeholder={t('medications.search_placeholder', 'Search by medication name or generic name...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={isRtl ? 'pr-9' : 'pl-9'}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:w-auto">
                            <Select value={formFilter} onValueChange={setFormFilter}>
                                <SelectTrigger className="w-full md:w-[170px]">
                                    <SelectValue placeholder={t('medications.form', 'Dosage Form')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('medications.all_forms', 'All Forms')}</SelectItem>
                                    {DOSAGE_FORMS.map((form) => (
                                        <SelectItem key={form} value={form}>
                                            {form}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder={t('medications.is_active', 'Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('medications.all_statuses', 'All Statuses')}</SelectItem>
                                    <SelectItem value="active">{t('medications.active', 'Active')}</SelectItem>
                                    <SelectItem value="inactive">{t('medications.inactive', 'Inactive')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Responsive: Cards on mobile, TanStack Table on desktop */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    {/* Mobile View: Cards */}
                    <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {table.getRowModel().rows.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <Pill className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                {t('medications.no_medications', 'No medications found.')}
                            </div>
                        ) : (
                            table.getRowModel().rows.map((row) => {
                                const medication = row.original;
                                return (
                                    <div key={medication.id} className="p-4 space-y-3 bg-white dark:bg-gray-900">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Pill className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-base">
                                                        {medication.name}
                                                    </p>
                                                    {medication.generic_name && (
                                                        <p className="text-xs text-gray-500 italic">{medication.generic_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(medication)}
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeletingMedication(medication)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {medication.form && (
                                                <Badge variant="outline" className="text-xs capitalize font-normal">
                                                    {medication.form}
                                                </Badge>
                                            )}
                                            {medication.strength && (
                                                <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 font-mono text-xs">
                                                    {medication.strength} {medication.unit || ''}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={medication.is_active}
                                                onCheckedChange={() => handleToggleStatus(medication)}
                                            />
                                            <Badge
                                                className={
                                                    medication.is_active
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100'
                                                }
                                            >
                                                {medication.is_active ? t('medications.active', 'Active') : t('medications.inactive', 'Inactive')}
                                            </Badge>
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
                                            <Pill className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                            {t('medications.no_medications', 'No medications found.')}
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

                    {/* Pagination */}
                    {table.getPageCount() > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('common.page', 'Page')} {table.getState().pagination.pageIndex + 1}{' '}
                                {t('common.of', 'of')} {table.getPageCount()}
                                {' · '}
                                {filteredMedications.length} {t('medications.total', 'total')}
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Pill className="h-5 w-5 text-primary" />
                            {editingMedication ? t('medications.edit', 'Edit Medication') : t('medications.add_new', 'Add New Medication')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMedication
                                ? t('medications.edit_desc', 'Update medication details, dosage form, and strength.')
                                : t('medications.add_desc', 'Enter the medication brand name, generic name, form, and dosage.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">
                                {t('medications.name', 'Medication Name')} *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Panadol Extra 500mg"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="mt-1"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="generic_name">
                                {t('medications.generic_name', 'Generic / Scientific Name')}
                            </Label>
                            <Input
                                id="generic_name"
                                name="generic_name"
                                placeholder="e.g. Paracetamol"
                                value={formik.values.generic_name || ''}
                                onChange={formik.handleChange}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="form">{t('medications.form', 'Dosage Form')}</Label>
                            <Select
                                value={formik.values.form || ''}
                                onValueChange={(val) => formik.setFieldValue('form', val)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={t('medications.select_form', 'Select Dosage Form')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOSAGE_FORMS.map((form) => (
                                        <SelectItem key={form} value={form}>
                                            {form}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="strength">{t('medications.strength', 'Strength')}</Label>
                                <Input
                                    id="strength"
                                    name="strength"
                                    placeholder="e.g. 500"
                                    value={formik.values.strength || ''}
                                    onChange={formik.handleChange}
                                    className="mt-1 font-mono"
                                />
                            </div>

                            <div>
                                <Label htmlFor="unit">{t('medications.unit', 'Unit')}</Label>
                                <Select
                                    value={formik.values.unit || ''}
                                    onValueChange={(val) => formik.setFieldValue('unit', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={t('medications.select_unit', 'Select Unit')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DOSAGE_UNITS.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Label htmlFor="is_active" className="cursor-pointer font-medium text-sm">
                                {t('medications.is_active', 'Active Status')}
                            </Label>
                            <Switch
                                id="is_active"
                                checked={formik.values.is_active}
                                onCheckedChange={(val) => formik.setFieldValue('is_active', val)}
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={formik.isSubmitting}>
                                {formik.isSubmitting
                                    ? t('common.processing', 'Processing...')
                                    : editingMedication
                                    ? t('common.save', 'Save Changes')
                                    : t('common.save', 'Create Medication')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deletingMedication)} onOpenChange={() => setDeletingMedication(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {t('medications.delete', 'Delete Medication')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('medications.delete_confirm', 'Are you sure you want to delete this medication?')}
                            {deletingMedication && (
                                <span className="block mt-2 font-bold text-gray-900 dark:text-white">
                                    {deletingMedication.name}{' '}
                                    {deletingMedication.strength
                                        ? `(${deletingMedication.strength} ${deletingMedication.unit || ''})`
                                        : ''}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeletingMedication(null)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? t('common.processing', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ClinicLayout>
    );
}

