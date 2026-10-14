import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import useImport from '@/hooks/use-import';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Booking, BookingFormValues, BookingStatus, PaginatedBookings } from '@/types/booking';
import useAuthClinics from '@/hooks/use-auth-clinics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';


export default function BookingDialog({ isAddModalOpen, setIsAddModalOpen, patientType, editingBooking ,setPatientType , doctors , handleCloseModal , patientList,todayStr}: any) {
    const { t } = useImport()
    const { authClinic } = useAuthClinics()



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
            if (!authClinic.slug) {
                toast.error(t('bookings.missing_clinic_slug', 'Clinic slug is missing.'));
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
                router.put(`/clinic/${authClinic.slug}/booking/${editingBooking.id}`, payload as any, {
                    onSuccess: () => {
                        toast.success(t('bookings.updated_success', 'Booking updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || t('bookings.updated_error', 'Error updating booking'));
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                router.post(`/clinic/${authClinic.slug}/booking`, payload as any, {
                    onSuccess: () => {
                        toast.success(t('bookings.created_success', 'Booking created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || t('bookings.created_error', 'Error creating booking'));
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });
    return (
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
                                    {patientList.map((p:any) => (
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
                                    {doctors.map((doc:any) => (
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
                                    <SelectItem value="cash">{t('bookings.payment_cash', 'Cash')}</SelectItem>
                                    <SelectItem value="card">{t('bookings.payment_card', 'Card / POS')}</SelectItem>
                                    <SelectItem value="insurance">{t('bookings.payment_insurance', 'Insurance')}</SelectItem>
                                    <SelectItem value="other">{t('bookings.payment_other', 'Other')}</SelectItem>
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
    )
}
