import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo } from 'react';
import { Booking, BookingFormValues, BookingStatus, BookingType } from '@/types/booking';
import { Patient } from '@/types/patient';
import { User } from '@/types/auth';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';

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

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Calendar,
    Clock,
    UserCheck,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User as UserIcon,
    Stethoscope,
    Phone,
    Globe,
    Building2,
    CalendarCheck,
    CalendarDays,
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
    doctors = [],
}: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    // Clinic slug
    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Today's date YYYY-MM-DD
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

    // Filter bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const patientName = booking.patient
                ? `${booking.patient.first_name || ''} ${booking.patient.last_name || ''}`.toLowerCase()
                : '';
            const phone = (booking.patient?.phone || '').toLowerCase();
            const doctorName = (booking.doctor?.name || '').toLowerCase();
            const notes = (booking.notes || '').toLowerCase();
            const bookedBy = (booking.booked_by || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                patientName.includes(search) ||
                phone.includes(search) ||
                doctorName.includes(search) ||
                notes.includes(search) ||
                bookedBy.includes(search);

            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            const matchesType = typeFilter === 'all' || booking.type === typeFilter;
            const matchesDoctor = doctorFilter === 'all' || String(booking.doctor_id) === doctorFilter;
            const matchesDate = !dateFilter || booking.appointment_date === dateFilter;

            return matchesSearch && matchesStatus && matchesType && matchesDoctor && matchesDate;
        });
    }, [bookings, searchTerm, statusFilter, typeFilter, doctorFilter, dateFilter]);

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
    });

    const initialValues: BookingFormValues = {
        patient_id: editingBooking?.patient_id ? String(editingBooking.patient_id) : '',
        doctor_id: editingBooking?.doctor_id ? String(editingBooking.doctor_id) : '',
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

            const payload = {
                ...values,
                patient_id: values.patient_id ? Number(values.patient_id) : null,
                doctor_id: values.doctor_id ? Number(values.doctor_id) : null,
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
        formik.resetForm();
    };

    const handleOpenEdit = (booking: Booking) => {
        setEditingBooking(booking);
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

    return (
        <ClinicLayout title={t('bookings.title', 'Bookings & Appointments')}>
            <div className="space-y-6">
                {/* Header & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <CalendarDays className="h-7 w-7 text-orange-500" />
                            {t('bookings.title', 'Bookings & Appointments')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('bookings.subtitle', 'Manage clinic appointments, patient schedules, doctor assignments, and booking statuses.')}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingBooking(null);
                            setIsAddModalOpen(true);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        {t('bookings.add_new', 'Add New Booking')}
                    </Button>
                </div>

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
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 md:w-auto">
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full"
                            />

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full">
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
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('bookings.type', 'Type')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('bookings.all_types', 'All Types')}</SelectItem>
                                    <SelectItem value="new">{t('bookings.type_new', 'New Examination')}</SelectItem>
                                    <SelectItem value="follow_up">{t('bookings.type_follow_up', 'Follow-up')}</SelectItem>
                                </SelectContent>
                            </Select>

                            {doctors.length > 0 && (
                                <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('bookings.doctor', 'Doctor')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('bookings.all_doctors', 'All Doctors')}</SelectItem>
                                        {doctors.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                            <TableRow>
                                <TableHead>{t('bookings.patient', 'Patient')}</TableHead>
                                <TableHead>{t('bookings.doctor', 'Doctor')}</TableHead>
                                <TableHead>{t('bookings.appointment_date', 'Date & Time')}</TableHead>
                                <TableHead>{t('bookings.type', 'Type')}</TableHead>
                                <TableHead>{t('bookings.status', 'Status')}</TableHead>
                                <TableHead>{t('bookings.booking_source', 'Source')}</TableHead>
                                <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        <CalendarDays className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                        {t('bookings.no_bookings', 'No bookings found.')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => {
                                    const patientName = booking.patient
                                        ? `${booking.patient.first_name} ${booking.patient.last_name}`
                                        : 'Unregistered Patient';

                                    return (
                                        <TableRow key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-semibold">
                                                        <AvatarFallback>{getInitials(patientName)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                            {patientName}
                                                        </p>
                                                        {booking.patient?.phone && (
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Phone className="h-3 w-3 text-gray-400" />
                                                                {booking.patient.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {booking.doctor ? (
                                                    <div className="text-xs space-y-0.5">
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                                                            <Stethoscope className="h-3 w-3 text-orange-500" />
                                                            {booking.doctor.name}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-0.5">
                                                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        {booking.appointment_date}
                                                    </p>
                                                    <p className="text-gray-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-gray-400" />
                                                        {booking.appointment_time}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize text-xs font-normal">
                                                    {booking.type === 'new'
                                                        ? t('bookings.type_new', 'New Examination')
                                                        : t('bookings.type_follow_up', 'Follow-up')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={booking.status}
                                                        onValueChange={(val) => handleUpdateStatus(booking, val)}
                                                    >
                                                        <SelectTrigger className="h-7 text-xs border-none p-0 bg-transparent shadow-none w-auto">
                                                            {getStatusBadge(booking.status)}
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
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-0.5">
                                                    <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                                                        {booking.booking_source === 'patient' ? 'Online' : 'Reception'}
                                                    </Badge>
                                                    {booking.booked_by && (
                                                        <p className="text-[11px] text-gray-400">By: {booking.booked_by}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-end">
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
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-orange-500" />
                            {editingBooking ? t('bookings.edit', 'Edit Booking') : t('bookings.add_new', 'Add New Booking')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingBooking
                                ? t('bookings.edit_desc', 'Update appointment date, time, status, and patient assignment.')
                                : t('bookings.add_desc', 'Schedule a new appointment for a patient in your clinic.')}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="patient_id">{t('bookings.patient', 'Patient')}</Label>
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
                        </div>

                        <div>
                            <Label htmlFor="doctor_id">{t('bookings.doctor', 'Doctor')}</Label>
                            <Select
                                value={formik.values.doctor_id ? String(formik.values.doctor_id) : ''}
                                onValueChange={(val) => formik.setFieldValue('doctor_id', val)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={t('bookings.select_doctor', 'Select Doctor')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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

                        <div>
                            <Label htmlFor="notes">{t('bookings.notes', 'Notes')}</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={2}
                                value={formik.values.notes || ''}
                                onChange={formik.handleChange}
                                className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Additional appointment notes..."
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="bg-orange-500 hover:bg-orange-600 text-white min-w-[100px]"
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
