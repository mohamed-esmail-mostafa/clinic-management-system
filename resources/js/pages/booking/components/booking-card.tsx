import { Card, CardContent } from '@/components/ui/card';
import useImport from '@/hooks/use-import';
import { AlertCircle, CheckCircle2, Clock, DollarSign, MoreVertical, Pencil, Phone, Stethoscope, Trash2, UserCheck, UserX, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Booking, BookingStatus } from '@/types';
import { Button } from '@/components/ui/button';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function BookingCard({ booking, index }: any) {
    const { t } = useImport()
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { authClinic } = useAuthClinics()
    const isRegistered = Boolean(booking.patient);
    const patientName = isRegistered
        ? `${booking.patient?.first_name} ${booking.patient?.last_name}`
        : booking.name || t('bookings.unregistered_patient', 'Unregistered Patient');
    const phone = booking.patient?.phone || booking.phone;
    const isCompleted = booking.status === 'completed';
    const isPending = booking.status === 'pending';
    const isConfirmed = booking.status === 'confirmed';




    const getInitials = (name?: string) => {
        if (!name) return 'P';
        const parts = name.trim().split(' ');
        const f = parts[0]?.charAt(0).toUpperCase() || '';
        const l = parts[1]?.charAt(0).toUpperCase() || '';
        return `${f}${l}` || 'P';
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



    const getPaymentMethodLabel = (method?: string | null) => {
        switch (method) {
            case 'cash':
                return t('bookings.payment_cash', 'Cash');
            case 'card':
                return t('bookings.payment_card', 'Card / POS');
            case 'insurance':
                return t('bookings.payment_insurance', 'Insurance');
            case 'other':
                return t('bookings.payment_other', 'Other');
            default:
                return method || '';
        }
    };



    const handleUpdateStatus = (booking: Booking, newStatus: string) => {
        if (!authClinic?.slug) return;
        router.patch(
            `/clinic/${authClinic?.slug}/booking/${booking.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('bookings.status_updated', 'Booking status updated!'));
                },
                onError: () => {
                    toast.error(t('bookings.status_update_failed', 'Failed to update status'));
                },
            }
        );
    };



     const handleDelete = () => {
            if (!deletingBooking || !authClinic.slug) return;
    
            setIsDeleting(true);
            router.delete(`/clinic/${authClinic.slug}/booking/${deletingBooking.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(t('bookings.deleted_success', 'Booking deleted successfully!'));
                    setDeletingBooking(null);
                },
                onError: () => {
                    toast.error(t('bookings.delete_failed', 'Failed to delete booking'));
                },
                onFinish: () => setIsDeleting(false),
            });
        };

    return (
        <>
        <Card
            className={`h-full min-w-0 overflow-hidden border-t-4 transition-all duration-200 hover:shadow-md ${
                isCompleted
                    ? 'border-t-blue-500 bg-blue-50/20 dark:bg-blue-950/10'
                    : isConfirmed
                      ? 'border-t-emerald-500'
                      : isPending
                        ? 'border-t-amber-500'
                        : 'border-t-gray-300 dark:border-t-gray-700'
            }`}
        >
            <CardContent className="flex h-full flex-col gap-4 p-4">
                {/* Header: appointment time and actions */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-14 min-w-[76px] flex-col items-center justify-center rounded-xl bg-muted px-3">
                            <Clock className="mb-1 h-4 w-4 text-primary" />
                            <span className="text-sm font-bold tabular-nums">
                                {booking.appointment_time}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="break-words font-semibold text-foreground">
                                    {patientName}
                                </h4>
                                {getStatusBadge(booking.status)}
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {isRegistered
                                    ? booking.patient?.patient_number
                                        ? `${t('bookings.patient_number', 'Patient No.')}: ${booking.patient.patient_number}`
                                        : t('bookings.registered_patient', 'Registered Patient')
                                    : t('bookings.walk_in_unregistered', 'Walk-in / Unregistered')}
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                aria-label={t('bookings.actions', 'Booking actions')}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-48">
                            {booking.status !== 'pending' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(booking, 'pending')}
                                >
                                    <Clock className="me-2 h-4 w-4 text-amber-500" />
                                    {t('bookings.set_pending', 'Set as Pending')}
                                </DropdownMenuItem>
                            )}

                            {booking.status !== 'confirmed' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(booking, 'confirmed')}
                                >
                                    <UserCheck className="me-2 h-4 w-4 text-emerald-500" />
                                    {t('bookings.set_confirmed', 'Set as Confirmed')}
                                </DropdownMenuItem>
                            )}

                            {booking.status !== 'completed' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(booking, 'completed')}
                                >
                                    <CheckCircle2 className="me-2 h-4 w-4 text-blue-500" />
                                    {t('bookings.set_completed', 'Set as Completed')}
                                </DropdownMenuItem>
                            )}

                            {booking.status !== 'no_show' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(booking, 'no_show')}
                                >
                                    <UserX className="me-2 h-4 w-4" />
                                    {t('bookings.set_no_show', 'Mark as No Show')}
                                </DropdownMenuItem>
                            )}

                            {booking.status !== 'cancelled' && (
                                <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(booking, 'cancelled')}
                                >
                                    <XCircle className="me-2 h-4 w-4 text-red-500" />
                                    {t('bookings.cancel', 'Cancel Appointment')}
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => setDeletingBooking(booking)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="me-2 h-4 w-4" />
                                {t('bookings.delete', 'Delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Patient details */}
                <div className="space-y-3 rounded-lg border bg-card p-3">
                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Phone className="h-4 w-4 shrink-0" />
                            <span className="break-all">{phone}</span>
                        </a>
                    )}

                    {booking.doctor && (
                        <div className="flex min-w-0 items-center gap-2 text-sm">
                            <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">
                                {booking.doctor.name}
                            </span>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {booking.type === 'new'
                                ? t('bookings.type_new', 'New Examination')
                                : t('bookings.type_follow_up', 'Follow-up')}
                        </Badge>

                        {booking.amount != null && (
                            <Badge variant="secondary" className="gap-1">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                {booking.amount}
                                {booking.payment_method && (
                                    <span>
                                        · {getPaymentMethodLabel(booking.payment_method)}
                                    </span>
                                )}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                    <p className="line-clamp-3 rounded-md bg-muted/60 p-3 text-sm italic text-muted-foreground">
                        “{booking.notes}”
                    </p>
                )}

                {/* Actions: anchored at the bottom */}
                <div className="mt-auto border-t pt-3">
                    {isPending && (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="min-w-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                                onClick={() => handleUpdateStatus(booking, 'confirmed')}
                            >
                                <UserCheck className="me-1 h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    {t('bookings.confirm_arrival', 'Confirm')}
                                </span>
                            </Button>

                            <Button
                                size="sm"
                                className="min-w-0 bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => handleUpdateStatus(booking, 'completed')}
                            >
                                <CheckCircle2 className="me-1 h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    {t('bookings.mark_completed', 'Complete')}
                                </span>
                            </Button>
                        </div>
                    )}

                    {isConfirmed && (
                        <Button
                            size="sm"
                            className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => handleUpdateStatus(booking, 'completed')}
                        >
                            <CheckCircle2 className="me-2 h-4 w-4" />
                            {t('bookings.mark_completed', 'Mark Completed')}
                        </Button>
                    )}

                    {isCompleted && (
                        <div className="flex items-center justify-center gap-2 rounded-md bg-blue-50 py-2 text-sm font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            <CheckCircle2 className="h-4 w-4" />
                            {t('bookings.status_completed', 'Completed')}
                        </div>
                    )}

                    {!isPending && !isConfirmed && !isCompleted && (
                        <p className="py-2 text-center text-sm text-muted-foreground">
                            {getStatusBadge(booking.status)}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Delete confirmation */}
        <Dialog
            open={Boolean(deletingBooking)}
            onOpenChange={(open) => {
                if (!open && !isDeleting) {
                    setDeletingBooking(null);
                }
            }}
        >
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
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
                        {isDeleting
                            ? t('common.deleting', 'Deleting...')
                            : t('common.delete', 'Delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>

    )
}
