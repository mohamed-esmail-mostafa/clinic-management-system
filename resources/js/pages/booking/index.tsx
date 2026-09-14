import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo } from 'react';
import { Booking, BookingFormValues, BookingStatus } from '@/types/booking';
import { Patient } from '@/types/patient';
import { User } from '@/types/auth';
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
import PageHeader from '@/components/shared/page-header';

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Phone,
    CalendarCheck,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    UserCheck,
    UserPlus,
} from 'lucide-react';

interface Props {
    clinic?: any;
    bookings?: Booking[];
    patients?: Patient[];
    doctors?: User[];
}

export default function BookingPage({
    clinic: serverClinic,
    bookings = [],
    patients = [],
}: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    // Clinic slug
    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Patient selection mode: registered or unregistered
    const [patientType, setPatientType] = useState<'registered' | 'unregistered'>('registered');

    // Sorting & Pagination
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Today's date YYYY-MM-DD
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Filter bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const registeredName = booking.patient
                ? `${booking.patient.first_name || ''} ${booking.patient.last_name || ''}`.toLowerCase()
                : '';
            const unregName = (booking.name || '').toLowerCase();
            const phone = (booking.patient?.phone || booking.phone || '').toLowerCase();
            const notes = (booking.notes || '').toLowerCase();
            const bookedBy = (booking.booked_by || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                registeredName.includes(search) ||
                unregName.includes(search) ||
                phone.includes(search) ||
                notes.includes(search) ||
                bookedBy.includes(search);

            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            const matchesType = typeFilter === 'all' || booking.type === typeFilter;
            const matchesDate = !dateFilter || booking.appointment_date === dateFilter;

            return matchesSearch && matchesStatus && matchesType && matchesDate;
        });
    }, [bookings, searchTerm, statusFilter, typeFilter, dateFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = bookings.length;
        const todays = bookings.filter((b) => b.appointment_date === todayStr).length;
        const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
        const pending = bookings.filter((b) => b.status === 'pending').length;

        return { total, todays, confirmed, pending };
    }, [bookings, todayStr]);

    // Validation Schema
    const validationSchema = Yup.object({
        appointment_date: Yup.string().required(t('common.required', 'This field is required')),
        appointment_time: Yup.string().required(t('common.required', 'This field is required')),
        type: Yup.string().required(t('common.required', 'This field is required')),
        status: Yup.string().required(t('common.required', 'This field is required')),
        patient_id: Yup.string().when([], {
            is: () => patientType === 'registered',
            then: (schema) => schema.required(t('common.required', 'This field is required')),
            otherwise: (schema) => schema.nullable(),
        }),
        name: Yup.string().when([], {
            is: () => patientType === 'unregistered',
            then: (schema) => schema.required(t('common.required', 'This field is required')),
            otherwise: (schema) => schema.nullable(),
        }),
    });

    const initialValues: BookingFormValues = {
        patient_id: editingBooking?.patient_id ? String(editingBooking.patient_id) : '',
        name: editingBooking?.name || '',
        phone: editingBooking?.phone || '',
        appointment_date: editingBooking?.appointment_date || todayStr,
        appointment_time: editingBooking?.appointment_time || '10:00',
        type: editingBooking?.type || 'new',
        status: editingBooking?.status || 'pending',
        booking_source: editingBooking?.booking_source || 'reception',
        booked_by: editingBooking?.booked_by || '',
        notes: editingBooking?.notes || '',
    };

    const formik = useFormik<BookingFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!clinicSlug) {
                toast.error('Clinic slug is missing.');
                setSubmitting(false);
                return;
            }

            const isReg = patientType === 'registered';
            const payload = {
                ...values,
                patient_id: isReg && values.patient_id ? Number(values.patient_id) : null,
                name: !isReg && values.name ? values.name.trim() : null,
                phone: !isReg && values.phone ? values.phone.trim() : null,
                doctor_id: null,
            };

            if (editingBooking) {
                // Update Booking
                router.put(`/clinic/${clinicSlug}/booking/${editingBooking.id}`, payload as any, {
                    onSuccess: () => {
                        toast.success(t('bookings.updated_success', 'Booking updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating booking');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create Booking
                router.post(`/clinic/${clinicSlug}/booking`, payload as any, {
                    onSuccess: () => {
                        toast.success(t('bookings.created_success', 'Booking created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating booking');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingBooking(null);
        setPatientType('registered');
        formik.resetForm();
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

    const handleUpdateStatus = (booking: Booking, newStatus: string) => {
        if (!clinicSlug) return;
        router.patch(
            `/clinic/${clinicSlug}/booking/${booking.id}/status`,
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.success(t('bookings.status_updated', 'Booking status updated!'));
                },
                onError: () => {
                    toast.error('Failed to update status');
                },
            }
        );
    };

    const handleDelete = () => {
        if (!deletingBooking || !clinicSlug) return;

        setIsDeleting(true);
        router.delete(`/clinic/${clinicSlug}/booking/${deletingBooking.id}`, {
            onSuccess: () => {
                toast.success(t('bookings.deleted_success', 'Booking deleted successfully!'));
                setDeletingBooking(null);
            },
            onError: () => {
                toast.error('Failed to delete booking');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const getStatusBadge = (status: BookingStatus) => {
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
            case 'no_show':
                return (
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200">
                        {t('bookings.status_no_show', 'No Show')}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return 'P';
        const parts = name.trim().split(' ');
        const f = parts[0]?.charAt(0).toUpperCase() || '';
        const l = parts[1]?.charAt(0).toUpperCase() || '';
        return `${f}${l}` || 'P';
    };

    // TanStack Table Columns
    const columns = useMemo<ColumnDef<Booking>[]>(
        () => [
            {
                id: 'patient',
                accessorFn: (row) =>
                    row.patient
                        ? `${row.patient.first_name} ${row.patient.last_name}`
                        : row.name || '',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-3 h-8 text-xs font-semibold"
                    >
                        <span>{t('bookings.patient', 'Patient')}</span>
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
                    const booking = row.original;
                    const isRegistered = Boolean(booking.patient);
                    const patientName = isRegistered
                        ? `${booking.patient?.first_name} ${booking.patient?.last_name}`
                        : booking.name || t('bookings.unregistered_patient', 'Unregistered Patient');
                    const phone = booking.patient?.phone || booking.phone;

                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 bg-primary/10 text-primary font-semibold">
                                <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {patientName}
                                    </p>
                                    {!isRegistered && (
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] py-0 px-1.5 h-4 text-muted-foreground font-normal"
                                        >
                                            {t('bookings.unregistered_patient', 'Unregistered')}
                                        </Badge>
                                    )}
                                </div>
                                {phone && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span>{phone}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'appointment_date',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-3 h-8 text-xs font-semibold"
                    >
                        <span>{t('bookings.appointment_date', 'Date & Time')}</span>
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
                    const booking = row.original;
                    return (
                        <div className="text-xs space-y-0.5">
                            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {booking.appointment_date}
                            </p>
                            <p className="text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                {booking.appointment_time}
                            </p>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'type',
                header: () => <span className="text-xs font-semibold">{t('bookings.type', 'Type')}</span>,
                cell: ({ row }) => {
                    const booking = row.original;
                    return (
                        <Badge variant="outline" className="capitalize text-xs font-normal">
                            {booking.type === 'new'
                                ? t('bookings.type_new', 'New Examination')
                                : t('bookings.type_follow_up', 'Follow-up')}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: () => <span className="text-xs font-semibold">{t('bookings.status', 'Status')}</span>,
                cell: ({ row }) => {
                    const booking = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Select
                                value={booking.status}
                                onValueChange={(val) => handleUpdateStatus(booking, val)}
                            >
                                <SelectTrigger className="h-7 text-xs border-none p-0 bg-transparent shadow-none w-auto">
                                    <SelectValue>{getStatusBadge(booking.status)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">{t('bookings.status_pending', 'Pending')}</SelectItem>
                                    <SelectItem value="confirmed">{t('bookings.status_confirmed', 'Confirmed')}</SelectItem>
                                    <SelectItem value="completed">{t('bookings.status_completed', 'Completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('bookings.status_cancelled', 'Cancelled')}</SelectItem>
                                    <SelectItem value="no_show">{t('bookings.status_no_show', 'No Show')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'booking_source',
                header: () => <span className="text-xs font-semibold">{t('bookings.booking_source', 'Source')}</span>,
                cell: ({ row }) => {
                    const booking = row.original;
                    return (
                        <div className="text-xs space-y-0.5">
                            <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                                {booking.booking_source === 'patient'
                                    ? t('bookings.source_patient', 'Online')
                                    : t('bookings.source_reception', 'Reception')}
                            </Badge>
                            {booking.booked_by && (
                                <p className="text-[11px] text-muted-foreground">{booking.booked_by}</p>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-end text-xs font-semibold">{t('common.actions', 'Actions')}</div>,
                cell: ({ row }) => {
                    const booking = row.original;
                    return (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(booking)}
                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                title={t('bookings.edit', 'Edit Booking')}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingBooking(booking)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title={t('bookings.delete', 'Delete Booking')}
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
        data: filteredBookings,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <ClinicLayout title={t('bookings.title', 'Bookings & Appointments')}>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    icon={<CalendarDays className="h-7 w-7 text-primary" />}
                    title={t('bookings.title', 'Bookings & Appointments')}
                    count={bookings.length}
                    subtitle={t('bookings.subtitle', 'Manage clinic appointments, patient schedules, and booking statuses.')}
                >
                    <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" />
                        {t('bookings.add_new', 'Add New Booking')}
                    </Button>
                </PageHeader>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('bookings.total', 'Total Bookings')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('bookings.todays_bookings', "Today's Bookings")}
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                    {stats.todays}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                                <CalendarCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('bookings.confirmed_count', 'Confirmed')}
                                </p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {stats.confirmed}
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
                                    {t('bookings.pending_count', 'Pending')}
                                </p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                    {stats.pending}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                            <Input
                                placeholder={t('bookings.search_placeholder', 'Search by patient name, phone, notes...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={isRtl ? 'pr-9' : 'pl-9'}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:w-auto">
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full sm:w-[170px]"
                            />

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t('bookings.status', 'Status')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('bookings.all_statuses', 'All Statuses')}</SelectItem>
                                    <SelectItem value="pending">{t('bookings.status_pending', 'Pending')}</SelectItem>
                                    <SelectItem value="confirmed">{t('bookings.status_confirmed', 'Confirmed')}</SelectItem>
                                    <SelectItem value="completed">{t('bookings.status_completed', 'Completed')}</SelectItem>
                                    <SelectItem value="cancelled">{t('bookings.status_cancelled', 'Cancelled')}</SelectItem>
                                    <SelectItem value="no_show">{t('bookings.status_no_show', 'No Show')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder={t('bookings.type', 'Type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('bookings.all_types', 'All Types')}</SelectItem>
                                    <SelectItem value="new">{t('bookings.type_new', 'New Examination')}</SelectItem>
                                    <SelectItem value="follow_up">{t('bookings.type_follow_up', 'Follow-up')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Responsive: Mobile Cards & Desktop TanStack Table */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    {/* Mobile View: Cards */}
                    <div className="block md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {table.getRowModel().rows.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <CalendarDays className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                {t('bookings.no_bookings', 'No bookings found.')}
                            </div>
                        ) : (
                            table.getRowModel().rows.map((row) => {
                                const booking = row.original;
                                const isRegistered = Boolean(booking.patient);
                                const patientName = isRegistered
                                    ? `${booking.patient?.first_name} ${booking.patient?.last_name}`
                                    : booking.name || t('bookings.unregistered_patient', 'Unregistered Patient');
                                const phone = booking.patient?.phone || booking.phone;

                                return (
                                    <div key={booking.id} className="p-4 space-y-3 bg-white dark:bg-gray-900">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 bg-primary/10 text-primary font-semibold">
                                                    <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-semibold text-gray-900 dark:text-white text-base">
                                                            {patientName}
                                                        </p>
                                                        {!isRegistered && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] py-0 px-1.5 h-4 text-muted-foreground font-normal"
                                                            >
                                                                {t('bookings.unregistered_patient', 'Unregistered')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {phone && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Phone className="h-3 w-3" />
                                                            {phone}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(booking)}
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setDeletingBooking(booking)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {booking.appointment_date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {booking.appointment_time}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs capitalize font-normal">
                                                    {booking.type === 'new'
                                                        ? t('bookings.type_new', 'New Examination')
                                                        : t('bookings.type_follow_up', 'Follow-up')}
                                                </Badge>
                                                <Select
                                                    value={booking.status}
                                                    onValueChange={(val) => handleUpdateStatus(booking, val)}
                                                >
                                                    <SelectTrigger className="h-7 text-xs border-none p-0 bg-transparent shadow-none w-auto">
                                                        <SelectValue>{getStatusBadge(booking.status)}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">{t('bookings.status_pending', 'Pending')}</SelectItem>
                                                        <SelectItem value="confirmed">{t('bookings.status_confirmed', 'Confirmed')}</SelectItem>
                                                        <SelectItem value="completed">{t('bookings.status_completed', 'Completed')}</SelectItem>
                                                        <SelectItem value="cancelled">{t('bookings.status_cancelled', 'Cancelled')}</SelectItem>
                                                        <SelectItem value="no_show">{t('bookings.status_no_show', 'No Show')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                            <CalendarDays className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                            {t('bookings.no_bookings', 'No bookings found.')}
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
                                {filteredBookings.length} {t('bookings.total', 'total')}
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
                            <CalendarDays className="h-5 w-5 text-primary" />
                            {editingBooking ? t('bookings.edit', 'Edit Booking') : t('bookings.add_new', 'Add New Booking')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBooking
                                ? t('bookings.edit_desc', 'Update appointment date, time, and patient details.')
                                : t('bookings.add_desc', 'Schedule a new appointment for a patient in your clinic.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Patient Selection Mode: Registered vs Unregistered */}
                        <div className="space-y-2">
                            <Label>{t('bookings.patient_type', 'Patient Type')}</Label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-lg">
                                <Button
                                    type="button"
                                    variant={patientType === 'registered' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => {
                                        setPatientType('registered');
                                        formik.setFieldValue('name', '');
                                        formik.setFieldValue('phone', '');
                                    }}
                                    className="gap-2 h-9"
                                >
                                    <UserCheck className="h-4 w-4" />
                                    {t('bookings.registered_patient', 'Registered Patient')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={patientType === 'unregistered' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => {
                                        setPatientType('unregistered');
                                        formik.setFieldValue('patient_id', '');
                                    }}
                                    className="gap-2 h-9"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {t('bookings.unregistered_patient', 'Unregistered Patient')}
                                </Button>
                            </div>
                        </div>

                        {/* Registered Patient Select */}
                        {patientType === 'registered' ? (
                            <div>
                                <Label htmlFor="patient_id" className="required">
                                    {t('bookings.patient', 'Patient')} *
                                </Label>
                                <Select
                                    value={formik.values.patient_id ? String(formik.values.patient_id) : ''}
                                    onValueChange={(val) => formik.setFieldValue('patient_id', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder={t('bookings.select_patient', 'Select Patient')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.first_name} {p.last_name} ({p.patient_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.patient_id && formik.errors.patient_id && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.patient_id}</p>
                                )}
                            </div>
                        ) : (
                            /* Unregistered Patient: Name and Phone */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="name" className="required">
                                        {t('bookings.patient_name', 'Patient Name')} *
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formik.values.name || ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder={t('bookings.enter_patient_name', 'Enter patient name')}
                                        className="mt-1"
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="phone">
                                        {t('bookings.patient_phone', 'Phone Number')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        value={formik.values.phone || ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder={t('bookings.enter_patient_phone', 'Enter phone number')}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Appointment Date & Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="appointment_date" className="required">
                                    {t('bookings.appointment_date', 'Date')} *
                                </Label>
                                <Input
                                    id="appointment_date"
                                    name="appointment_date"
                                    type="date"
                                    value={formik.values.appointment_date}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="mt-1"
                                />
                                {formik.touched.appointment_date && formik.errors.appointment_date && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.appointment_date}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="appointment_time" className="required">
                                    {t('bookings.appointment_time', 'Time')} *
                                </Label>
                                <Input
                                    id="appointment_time"
                                    name="appointment_time"
                                    type="time"
                                    value={formik.values.appointment_time}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="mt-1"
                                />
                                {formik.touched.appointment_time && formik.errors.appointment_time && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.appointment_time}</p>
                                )}
                            </div>
                        </div>

                        {/* Booking Type & Status */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="type" className="required">
                                    {t('bookings.type', 'Booking Type')} *
                                </Label>
                                <Select
                                    value={formik.values.type}
                                    onValueChange={(val) => formik.setFieldValue('type', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="new">{t('bookings.type_new', 'New Examination')}</SelectItem>
                                        <SelectItem value="follow_up">{t('bookings.type_follow_up', 'Follow-up')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status" className="required">
                                    {t('bookings.status', 'Status')} *
                                </Label>
                                <Select
                                    value={formik.values.status}
                                    onValueChange={(val) => formik.setFieldValue('status', val)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">{t('bookings.status_pending', 'Pending')}</SelectItem>
                                        <SelectItem value="confirmed">{t('bookings.status_confirmed', 'Confirmed')}</SelectItem>
                                        <SelectItem value="completed">{t('bookings.status_completed', 'Completed')}</SelectItem>
                                        <SelectItem value="cancelled">{t('bookings.status_cancelled', 'Cancelled')}</SelectItem>
                                        <SelectItem value="no_show">{t('bookings.status_no_show', 'No Show')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <Label htmlFor="notes">{t('bookings.notes', 'Notes')}</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={2}
                                value={formik.values.notes || ''}
                                onChange={formik.handleChange}
                                className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder={t('bookings.notes_placeholder', 'Additional appointment notes...')}
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="min-w-[100px]"
                            >
                                {formik.isSubmitting
                                    ? t('common.processing', 'Processing...')
                                    : editingBooking
                                    ? t('common.save', 'Save Changes')
                                    : t('common.save', 'Create Booking')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deletingBooking)} onOpenChange={() => setDeletingBooking(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {t('bookings.delete', 'Delete Booking')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('bookings.delete_confirm', 'Are you sure you want to delete this booking?')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeletingBooking(null)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('common.processing', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ClinicLayout>
    );
}
