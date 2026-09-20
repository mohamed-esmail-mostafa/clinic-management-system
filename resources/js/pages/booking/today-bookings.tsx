import React, { useState, useMemo } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import PageHeader from '@/components/shared/page-header';
import useAuthClinics from '@/hooks/use-auth-clinics';
import useImport from '@/hooks/use-import';
import { Booking, BookingFormValues, BookingStatus } from '@/types/booking';
import { Patient } from '@/types/patient';
import { User } from '@/types/auth';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    RotateCw,
    LayoutGrid,
    List,
    Stethoscope,
    DollarSign,
    MoreVertical,
    XCircle,
    UserX,
    Filter,
} from 'lucide-react';

interface Props {
    clinic?: any;
    bookings?: Booking[];
    patients?: Patient[];
    doctors?: User[];
}

export default function TodayBookingsPage({
    clinic: serverClinic,
    bookings = [],
    patients = [],
    doctors = [],
}: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    // Clinic slug
    const clinicSlug =
        serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // View mode: 'cards' (Queue / Timeline) or 'table'
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Patient selection mode: registered or unregistered
    const [patientType, setPatientType] = useState<'registered' | 'unregistered'>('registered');

    // Sorting & Pagination for Table View
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Today's Date representation
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const formattedToday = useMemo(() => {
        try {
            return new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(new Date());
        } catch {
            return todayStr;
        }
    }, [todayStr, isRtl]);

    // Statistics counts
    const stats = useMemo(() => {
        const total = bookings.length;
        const pending = bookings.filter((b) => b.status === 'pending').length;
        const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
        const completed = bookings.filter((b) => b.status === 'completed').length;
        const cancelled = bookings.filter((b) => b.status === 'cancelled' || b.status === 'no_show').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, pending, confirmed, completed, cancelled, completionRate };
    }, [bookings]);

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const registeredName = booking.patient
                ? `${booking.patient.first_name || ''} ${booking.patient.last_name || ''}`.toLowerCase()
                : '';
            const unregName = (booking.name || '').toLowerCase();
            const phone = (booking.patient?.phone || booking.phone || '').toLowerCase();
            const notes = (booking.notes || '').toLowerCase();
            const bookedBy = (booking.booked_by || '').toLowerCase();
            const doctorName = booking.doctor ? booking.doctor.name.toLowerCase() : '';
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                registeredName.includes(search) ||
                unregName.includes(search) ||
                phone.includes(search) ||
                notes.includes(search) ||
                bookedBy.includes(search) ||
                doctorName.includes(search);

            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            const matchesType = typeFilter === 'all' || booking.type === typeFilter;
            const matchesDoctor =
                doctorFilter === 'all' ||
                (booking.doctor_id ? String(booking.doctor_id) === doctorFilter : false);

            return matchesSearch && matchesStatus && matchesType && matchesDoctor;
        });
    }, [bookings, searchTerm, statusFilter, typeFilter, doctorFilter]);

    // Validation Schema for Add/Edit
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
        doctor_id: editingBooking?.doctor_id ? String(editingBooking.doctor_id) : '',
        name: editingBooking?.name || '',
        phone: editingBooking?.phone || '',
        appointment_date: editingBooking?.appointment_date || todayStr,
        appointment_time: editingBooking?.appointment_time || '10:00',
        type: editingBooking?.type || 'new',
        status: editingBooking?.status || 'pending',
        booking_source: editingBooking?.booking_source || 'reception',
        booked_by: editingBooking?.booked_by || '',
        payment_method: editingBooking?.payment_method || 'cash',
        amount: editingBooking?.amount !== undefined && editingBooking?.amount !== null ? editingBooking.amount : 0,
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
                doctor_id: values.doctor_id ? Number(values.doctor_id) : null,
                amount: values.amount ? Number(values.amount) : 0,
            };

            if (editingBooking) {
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
                preserveScroll: true,
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
            preserveScroll: true,
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

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['bookings'],
            onFinish: () => {
                setIsRefreshing(false);
                toast.success(t('common.refreshed', 'Data refreshed'));
            },
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
                                    <a
                                        href={`tel:${phone}`}
                                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                                    >
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span>{phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'appointment_time',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="-ml-3 h-8 text-xs font-semibold"
                    >
                        <span>{t('bookings.appointment_time', 'Time')}</span>
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
                        <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900 dark:text-white">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span>{booking.appointment_time}</span>
                        </div>
                    );
                },
            },
            {
                id: 'doctor',
                header: () => <span className="text-xs font-semibold">{t('bookings.doctor', 'Doctor')}</span>,
                cell: ({ row }) => {
                    const booking = row.original;
                    return booking.doctor ? (
                        <div className="flex items-center gap-1.5 text-xs">
                            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {booking.doctor.name}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">
                            {t('bookings.unassigned', 'Unassigned')}
                        </span>
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
                id: 'quick_actions',
                header: () => <span className="text-xs font-semibold">{t('bookings.quick_transition', 'Quick Action')}</span>,
                cell: ({ row }) => {
                    const booking = row.original;
                    return (
                        <div className="flex items-center gap-1.5">
                            {booking.status === 'pending' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 border-emerald-300"
                                        onClick={() => handleUpdateStatus(booking, 'confirmed')}
                                    >
                                        <UserCheck className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                        {t('bookings.status_confirmed', 'Confirm')}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2.5 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 border-blue-300"
                                        onClick={() => handleUpdateStatus(booking, 'completed')}
                                    >
                                        <CheckCircle2 className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                        {t('bookings.status_completed', 'Complete')}
                                    </Button>
                                </>
                            )}
                            {booking.status === 'confirmed' && (
                                <Button
                                    size="sm"
                                    className="h-7 px-2.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleUpdateStatus(booking, 'completed')}
                                >
                                    <CheckCircle2 className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                    {t('bookings.mark_completed', 'Mark Completed')}
                                </Button>
                            )}
                            {booking.status === 'completed' && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>{t('bookings.status_completed', 'Completed')}</span>
                                </div>
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
        [t, clinicSlug]
    );

    const table = useReactTable({
        data: filteredBookings,
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

    return (
        <ClinicLayout title={t('bookings.todays_bookings', "Today's Bookings")}>
            <div className="space-y-6 w-full max-w-full pb-10">
                {/* Page Header */}
                <PageHeader
                    title={t('bookings.todays_bookings', "Today's Bookings")}
                    subtitle={`${formattedToday} • ${bookings.length} ${t('bookings.todays_bookings', 'scheduled appointments')}`}
                    icon={<CalendarCheck className="h-6 w-6 text-primary" />}
                    count={bookings.length}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        {clinicSlug && (
                            <Link href={`/clinic/${clinicSlug}/booking`}>
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

                {/* Metrics / Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    {/* Total Today */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-primary hover:shadow-md ${
                            statusFilter === 'all' ? 'ring-2 ring-primary/40' : ''
                        }`}
                        onClick={() => setStatusFilter('all')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('bookings.todays_bookings', "Today's Total")}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                                    {stats.total}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.scheduled', 'Scheduled')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Queue */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-amber-500 hover:shadow-md ${
                            statusFilter === 'pending' ? 'ring-2 ring-amber-500/50' : ''
                        }`}
                        onClick={() => setStatusFilter('pending')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                                        {t('bookings.status_pending', 'Pending')}
                                    </p>
                                    {stats.pending > 0 && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                    )}
                                </div>
                                <p className="text-2xl font-bold mt-1 text-amber-900 dark:text-amber-300">
                                    {stats.pending}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.awaiting_arrival', 'Awaiting arrival')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Confirmed / Ready */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-emerald-500 hover:shadow-md ${
                            statusFilter === 'confirmed' ? 'ring-2 ring-emerald-500/50' : ''
                        }`}
                        onClick={() => setStatusFilter('confirmed')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                                    {t('bookings.status_confirmed', 'Confirmed')}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-emerald-900 dark:text-emerald-300">
                                    {stats.confirmed}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.in_waiting_room', 'In clinic / ready')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <UserCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Bookings */}
                    <Card
                        className={`cursor-pointer transition-all border-l-4 border-l-blue-500 hover:shadow-md ${
                            statusFilter === 'completed' ? 'ring-2 ring-blue-500/50' : ''
                        }`}
                        onClick={() => setStatusFilter('completed')}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-400">
                                    {t('bookings.status_completed', 'Completed')}
                                </p>
                                <p className="text-2xl font-bold mt-1 text-blue-900 dark:text-blue-300">
                                    {stats.completed}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {t('bookings.finished_visits', 'Visits finished')}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress bar if bookings exist */}
                {stats.total > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border shadow-xs">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                {t('bookings.completion_progress', "Today's Clinic Progress")}
                            </span>
                            <span className="font-mono text-muted-foreground">
                                {stats.completed} / {stats.total} ({stats.completionRate}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-linear-to-r from-emerald-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Controls Bar: Search, Status Filter Pills, Type & View Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3.5 rounded-xl border shadow-xs">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('bookings.search_placeholder', 'Search by patient name, phone, notes...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 rtl:pl-3 rtl:pr-9 h-9 text-sm"
                        />
                    </div>

                    {/* Filter Pills / Selects */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Pills */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                                    statusFilter === 'all'
                                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {t('common.all', 'All')} ({stats.total})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('pending')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                                    statusFilter === 'pending'
                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs'
                                        : 'text-muted-foreground hover:text-amber-700'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {t('bookings.status_pending', 'Pending')} ({stats.pending})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('confirmed')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                                    statusFilter === 'confirmed'
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 shadow-xs'
                                        : 'text-muted-foreground hover:text-emerald-700'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {t('bookings.status_confirmed', 'Confirmed')} ({stats.confirmed})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('completed')}
                                className={`px-2.5 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                                    statusFilter === 'completed'
                                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 shadow-xs'
                                        : 'text-muted-foreground hover:text-blue-700'
                                }`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                {t('bookings.status_completed', 'Completed')} ({stats.completed})
                            </button>
                        </div>

                        {/* Type Select */}
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="h-9 w-[130px] text-xs">
                                <SelectValue placeholder={t('bookings.all_types', 'All Types')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('bookings.all_types', 'All Types')}</SelectItem>
                                <SelectItem value="new">{t('bookings.type_new', 'New Examination')}</SelectItem>
                                <SelectItem value="follow_up">{t('bookings.type_follow_up', 'Follow-up')}</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Doctor Filter if doctors exist */}
                        {doctors.length > 0 && (
                            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                                <SelectTrigger className="h-9 w-[140px] text-xs">
                                    <SelectValue placeholder={t('bookings.all_doctors', 'All Doctors')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('bookings.all_doctors', 'All Doctors')}</SelectItem>
                                    {doctors.map((doc) => (
                                        <SelectItem key={doc.id} value={String(doc.id)}>
                                            {doc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* View Switcher: Timeline Cards vs Table */}
                        <div className="flex items-center border rounded-lg p-0.5 bg-gray-50 dark:bg-gray-800">
                            <Button
                                type="button"
                                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('cards')}
                                title={t('bookings.cards_view', 'Queue Cards View')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode('table')}
                                title={t('bookings.table_view', 'Table View')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area: Queue Cards View or Table View */}
                {filteredBookings.length === 0 ? (
                    <Card className="border-dashed py-12 text-center bg-gray-50/50 dark:bg-gray-900/40">
                        <CardContent className="flex flex-col items-center justify-center space-y-3">
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <CalendarCheck className="h-7 w-7" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                {bookings.length === 0
                                    ? t('bookings.no_bookings_today', 'No appointments scheduled for today.')
                                    : t('bookings.no_matching_bookings', 'No bookings match your current filters.')}
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                {bookings.length === 0
                                    ? t(
                                          'bookings.no_bookings_today_desc',
                                          'Patients booked for today will appear here chronologically. Schedule your first appointment for today.'
                                      )
                                    : t('bookings.reset_filters_hint', 'Try clearing your search keyword or changing the status filter.')}
                            </p>
                            {bookings.length === 0 ? (
                                <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 mt-2">
                                    <Plus className="h-4 w-4" />
                                    <span>{t('bookings.add_new', 'Schedule Today')}</span>
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setTypeFilter('all');
                                        setDoctorFilter('all');
                                    }}
                                    className="gap-1.5 mt-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    <span>{t('common.reset_filters', 'Reset Filters')}</span>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : viewMode === 'cards' ? (
                    /* Queue Cards View */
                    <div className="space-y-3">
                        {filteredBookings.map((booking, index) => {
                            const isRegistered = Boolean(booking.patient);
                            const patientName = isRegistered
                                ? `${booking.patient?.first_name} ${booking.patient?.last_name}`
                                : booking.name || t('bookings.unregistered_patient', 'Unregistered Patient');
                            const phone = booking.patient?.phone || booking.phone;
                            const isCompleted = booking.status === 'completed';
                            const isPending = booking.status === 'pending';
                            const isConfirmed = booking.status === 'confirmed';

                            return (
                                <Card
                                    key={booking.id}
                                    className={`transition-all duration-200 border-l-4 hover:shadow-sm ${
                                        isCompleted
                                            ? 'border-l-blue-500 bg-blue-50/15 dark:bg-blue-950/10'
                                            : isConfirmed
                                            ? 'border-l-emerald-500 bg-white dark:bg-gray-900'
                                            : isPending
                                            ? 'border-l-amber-500 bg-white dark:bg-gray-900'
                                            : 'border-l-gray-300 dark:border-l-gray-700 bg-white dark:bg-gray-900 opacity-80'
                                    }`}
                                >
                                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left Side: Time, Patient Info, Doctor & Badges */}
                                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                            {/* Order / Time Badge */}
                                            <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shrink-0 min-w-[75px]">
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-sm font-bold flex items-center gap-1 mt-0.5">
                                                    <Clock className="h-3 w-3 text-primary" />
                                                    {booking.appointment_time}
                                                </span>
                                            </div>

                                            {/* Patient Avatar */}
                                            <Avatar className="h-11 w-11 bg-primary/10 text-primary font-bold text-sm shrink-0">
                                                <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
                                            </Avatar>

                                            {/* Patient Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                                                        {patientName}
                                                    </h4>
                                                    {!isRegistered ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] py-0 px-1.5 text-muted-foreground"
                                                        >
                                                            {t('bookings.unregistered_patient', 'Walk-in / Unregistered')}
                                                        </Badge>
                                                    ) : (
                                                        booking.patient?.patient_number && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] py-0 px-1.5 font-mono"
                                                            >
                                                                {booking.patient.patient_number}
                                                            </Badge>
                                                        )
                                                    )}
                                                    {getStatusBadge(booking.status)}
                                                </div>

                                                {/* Meta Details: Phone, Doctor, Type, Amount */}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                                    {phone && (
                                                        <a
                                                            href={`tel:${phone}`}
                                                            className="flex items-center gap-1 hover:text-primary transition-colors"
                                                        >
                                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span>{phone}</span>
                                                        </a>
                                                    )}

                                                    {booking.doctor && (
                                                        <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                            <Stethoscope className="h-3.5 w-3.5 text-primary" />
                                                            <span>{booking.doctor.name}</span>
                                                        </span>
                                                    )}

                                                    <Badge variant="outline" className="text-[11px] py-0 h-4.5 font-normal">
                                                        {booking.type === 'new'
                                                            ? t('bookings.type_new', 'New Examination')
                                                            : t('bookings.type_follow_up', 'Follow-up')}
                                                    </Badge>

                                                    {booking.amount ? (
                                                        <span className="flex items-center gap-0.5 text-gray-900 dark:text-gray-100 font-medium">
                                                            <DollarSign className="h-3 w-3 text-emerald-600" />
                                                            <span>
                                                                {booking.amount} {booking.payment_method ? `(${booking.payment_method})` : ''}
                                                            </span>
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {/* Notes / Reason */}
                                                {booking.notes && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded-md mt-2 italic border border-gray-100 dark:border-gray-800">
                                                        &ldquo;{booking.notes}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Quick Action Buttons & Dropdown */}
                                        <div className="flex items-center justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0">
                                            {/* Pending Quick Actions */}
                                            {isPending && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 border-emerald-300 gap-1.5"
                                                        onClick={() => handleUpdateStatus(booking, 'confirmed')}
                                                    >
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                        <span>{t('bookings.confirm_arrival', 'Confirm')}</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                                        onClick={() => handleUpdateStatus(booking, 'completed')}
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        <span>{t('bookings.mark_completed', 'Complete')}</span>
                                                    </Button>
                                                </>
                                            )}

                                            {/* Confirmed Quick Actions */}
                                            {isConfirmed && (
                                                <Button
                                                    size="sm"
                                                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                                                    onClick={() => handleUpdateStatus(booking, 'completed')}
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>{t('bookings.mark_completed', 'Mark Completed')}</span>
                                                </Button>
                                            )}

                                            {/* Completed state indicator */}
                                            {isCompleted && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300 py-1 px-2.5 gap-1.5 text-xs font-semibold"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                                                    <span>{t('bookings.status_completed', 'Completed')}</span>
                                                </Badge>
                                            )}

                                            {/* Action Menu Dropdown */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => handleOpenEdit(booking)}>
                                                        <Pencil className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-amber-600" />
                                                        <span>{t('bookings.edit', 'Edit Booking')}</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    {booking.status !== 'pending' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking, 'pending')}>
                                                            <Clock className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-amber-500" />
                                                            <span>{t('bookings.set_pending', 'Set as Pending')}</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {booking.status !== 'confirmed' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking, 'confirmed')}>
                                                            <UserCheck className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-emerald-500" />
                                                            <span>{t('bookings.set_confirmed', 'Set as Confirmed')}</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {booking.status !== 'completed' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking, 'completed')}>
                                                            <CheckCircle2 className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-500" />
                                                            <span>{t('bookings.set_completed', 'Set as Completed')}</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {booking.status !== 'no_show' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking, 'no_show')}>
                                                            <UserX className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-gray-500" />
                                                            <span>{t('bookings.set_no_show', 'Mark as No Show')}</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(booking, 'cancelled')}>
                                                            <XCircle className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-red-500" />
                                                            <span>{t('bookings.cancel', 'Cancel Appointment')}</span>
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={() => setDeletingBooking(booking)}
                                                        className="text-red-600 focus:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                                                        <span>{t('bookings.delete', 'Delete')}</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* Table View */
                    <Card className="overflow-hidden border">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-gray-800/60">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} className="py-3 px-4">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="py-3 px-4">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between p-4 border-t text-xs text-muted-foreground">
                            <span>
                                {t('common.showing', 'Showing')}{' '}
                                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
                                -{' '}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) *
                                        table.getState().pagination.pageSize,
                                    filteredBookings.length
                                )}{' '}
                                {t('common.of', 'of')} {filteredBookings.length}
                            </span>
                            <div className="flex items-center gap-1.5">
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
                    </Card>
                )}

                {/* Add / Edit Booking Dialog */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBooking
                                    ? t('bookings.edit', 'Edit Booking')
                                    : t('bookings.add_new', 'Add New Booking')}
                            </DialogTitle>
                            <DialogDescription>
                                {editingBooking
                                    ? t('bookings.edit_description', 'Update appointment details.')
                                    : t('bookings.add_description', 'Schedule an appointment for today.')}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            {/* Patient Type Switcher: Registered vs Unregistered */}
                            {!editingBooking && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        {t('bookings.patient_type', 'Registration Type')}
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            type="button"
                                            variant={patientType === 'registered' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-9 text-xs"
                                            onClick={() => {
                                                setPatientType('registered');
                                                formik.setFieldValue('name', '');
                                                formik.setFieldValue('phone', '');
                                            }}
                                        >
                                            {t('bookings.registered_patient', 'Registered Patient')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={patientType === 'unregistered' ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-9 text-xs"
                                            onClick={() => {
                                                setPatientType('unregistered');
                                                formik.setFieldValue('patient_id', '');
                                            }}
                                        >
                                            {t('bookings.unregistered_patient', 'Walk-in / Unregistered')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Registered Patient Selection */}
                            {patientType === 'registered' ? (
                                <div className="space-y-1.5">
                                    <Label htmlFor="patient_id" className="text-xs font-semibold">
                                        {t('bookings.select_patient', 'Select Patient')} *
                                    </Label>
                                    <Select
                                        value={formik.values.patient_id ? String(formik.values.patient_id) : ''}
                                        onValueChange={(val) => formik.setFieldValue('patient_id', val)}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder={t('bookings.select_patient', 'Select Patient')} />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-56">
                                            {patients.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.first_name} {p.last_name}{' '}
                                                    {p.phone ? `(${p.phone})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formik.touched.patient_id && formik.errors.patient_id && (
                                        <p className="text-xs text-red-500">{formik.errors.patient_id}</p>
                                    )}
                                </div>
                            ) : (
                                /* Unregistered Patient Inputs */
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name" className="text-xs font-semibold">
                                            {t('bookings.patient_name', 'Patient Name')} *
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder={t('bookings.enter_patient_name', 'Full name')}
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            className="h-9 text-xs"
                                        />
                                        {formik.touched.name && formik.errors.name && (
                                            <p className="text-xs text-red-500">{formik.errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone" className="text-xs font-semibold">
                                            {t('bookings.patient_phone', 'Phone Number')}
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder={t('bookings.enter_patient_phone', 'Phone number')}
                                            value={formik.values.phone}
                                            onChange={formik.handleChange}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Doctor Selection */}
                            {doctors.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="doctor_id" className="text-xs font-semibold">
                                        {t('bookings.doctor', 'Doctor')}
                                    </Label>
                                    <Select
                                        value={formik.values.doctor_id ? String(formik.values.doctor_id) : 'none'}
                                        onValueChange={(val) =>
                                            formik.setFieldValue('doctor_id', val === 'none' ? '' : val)
                                        }
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder={t('bookings.select_doctor', 'Select Doctor')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                {t('bookings.unassigned', 'Unassigned')}
                                            </SelectItem>
                                            {doctors.map((doc) => (
                                                <SelectItem key={doc.id} value={String(doc.id)}>
                                                    {doc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="appointment_date" className="text-xs font-semibold">
                                        {t('bookings.appointment_date', 'Date')} *
                                    </Label>
                                    <Input
                                        id="appointment_date"
                                        name="appointment_date"
                                        type="date"
                                        value={formik.values.appointment_date}
                                        onChange={formik.handleChange}
                                        className="h-9 text-xs"
                                    />
                                    {formik.touched.appointment_date && formik.errors.appointment_date && (
                                        <p className="text-xs text-red-500">{formik.errors.appointment_date}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="appointment_time" className="text-xs font-semibold">
                                        {t('bookings.appointment_time', 'Time')} *
                                    </Label>
                                    <Input
                                        id="appointment_time"
                                        name="appointment_time"
                                        type="time"
                                        value={formik.values.appointment_time}
                                        onChange={formik.handleChange}
                                        className="h-9 text-xs"
                                    />
                                    {formik.touched.appointment_time && formik.errors.appointment_time && (
                                        <p className="text-xs text-red-500">{formik.errors.appointment_time}</p>
                                    )}
                                </div>
                            </div>

                            {/* Type & Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        {t('bookings.type', 'Booking Type')} *
                                    </Label>
                                    <Select
                                        value={formik.values.type}
                                        onValueChange={(val) => formik.setFieldValue('type', val)}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">
                                                {t('bookings.type_new', 'New Examination')}
                                            </SelectItem>
                                            <SelectItem value="follow_up">
                                                {t('bookings.type_follow_up', 'Follow-up')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        {t('bookings.status', 'Status')} *
                                    </Label>
                                    <Select
                                        value={formik.values.status}
                                        onValueChange={(val) => formik.setFieldValue('status', val)}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                {t('bookings.status_pending', 'Pending')}
                                            </SelectItem>
                                            <SelectItem value="confirmed">
                                                {t('bookings.status_confirmed', 'Confirmed')}
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                {t('bookings.status_completed', 'Completed')}
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                {t('bookings.status_cancelled', 'Cancelled')}
                                            </SelectItem>
                                            <SelectItem value="no_show">
                                                {t('bookings.status_no_show', 'No Show')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Payment Method & Amount */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        {t('bookings.payment_method', 'Payment Method')}
                                    </Label>
                                    <Select
                                        value={formik.values.payment_method || 'cash'}
                                        onValueChange={(val) => formik.setFieldValue('payment_method', val)}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card / POS</SelectItem>
                                            <SelectItem value="insurance">Insurance</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="amount" className="text-xs font-semibold">
                                        {t('bookings.amount', 'Amount')}
                                    </Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formik.values.amount}
                                        onChange={formik.handleChange}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <Label htmlFor="notes" className="text-xs font-semibold">
                                    {t('bookings.notes', 'Notes / Remarks')}
                                </Label>
                                <Input
                                    id="notes"
                                    name="notes"
                                    placeholder={t('bookings.notes_placeholder', 'Optional clinical or reception notes')}
                                    value={formik.values.notes || ''}
                                    onChange={formik.handleChange}
                                    className="h-9 text-xs"
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                    disabled={formik.isSubmitting}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button type="submit" disabled={formik.isSubmitting}>
                                    {formik.isSubmitting ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={Boolean(deletingBooking)}
                    onOpenChange={(open) => !open && setDeletingBooking(null)}
                >
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {t('bookings.delete', 'Delete Booking')}
                            </DialogTitle>
                            <DialogDescription>
                                {t(
                                    'bookings.delete_confirm',
                                    'Are you sure you want to delete this booking? This action cannot be undone.'
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingBooking(null)}
                                disabled={isDeleting}
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ClinicLayout>
    );
}
