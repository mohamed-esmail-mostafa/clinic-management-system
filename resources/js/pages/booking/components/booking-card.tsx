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
        <div>

            <Card
                key={booking.id}
                className={`transition-all duration-200 border-l-4 hover:shadow-sm ${isCompleted
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
                                {/* #{((paginationFrom || 1) + index)} */}
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
                                        {t('bookings.walk_in_unregistered', 'Walk-in / Unregistered')}
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
                                            {booking.amount} {booking.payment_method ? `(${getPaymentMethodLabel(booking.payment_method)})` : ''}
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
                                {/* <DropdownMenuItem onClick={() => handleOpenEdit(booking)}>
                                <Pencil className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 text-amber-600" />
                                <span>{t('bookings.edit', 'Edit Booking')}</span>
                            </DropdownMenuItem> */}

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

    )
}
