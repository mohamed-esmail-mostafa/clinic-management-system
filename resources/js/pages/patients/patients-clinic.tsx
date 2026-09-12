import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo } from 'react';
import { Patient, PatientFormValues } from '@/types/patient';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
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

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Users,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    Eye,
    Phone,
    Mail,
    MapPin,
    HeartPulse,
    UserCheck,
    Calendar,
    AlertCircle,
    FileText,
    Activity,
    User,
    Shield,
} from 'lucide-react';

interface Props {
    clinic?: any;
    patients?: Patient[];
}

export default function PatientsClinic({ clinic: serverClinic, patients = [] }: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    // Determine current clinic slug
    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('all');
    const [insuranceFilter, setInsuranceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
    const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'emergency' | 'medical'>('basic');
    const [viewTab, setViewTab] = useState<'info' | 'emergency' | 'medical'>('info');

    // Filter patients
    const filteredPatients = useMemo(() => {
        return patients.filter((patient) => {
            const fullName = `${patient.first_name || ''} ${patient.middle_name || ''} ${patient.last_name || ''}`.toLowerCase();
            const patientNum = (patient.patient_number || '').toLowerCase();
            const phone = (patient.phone || '').toLowerCase();
            const nationalId = (patient.national_id || '').toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                fullName.includes(search) ||
                patientNum.includes(search) ||
                phone.includes(search) ||
                nationalId.includes(search);

            const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
            const matchesInsurance =
                insuranceFilter === 'all' ||
                (insuranceFilter === 'insured' && patient.has_insurance) ||
                (insuranceFilter === 'uninsured' && !patient.has_insurance);
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && patient.is_active) ||
                (statusFilter === 'inactive' && !patient.is_active);

            return matchesSearch && matchesGender && matchesInsurance && matchesStatus;
        });
    }, [patients, searchTerm, genderFilter, insuranceFilter, statusFilter]);

    // Summary statistics
    const stats = useMemo(() => {
        return {
            total: patients.length,
            active: patients.filter((p) => p.is_active).length,
            inactive: patients.filter((p) => !p.is_active).length,
            insured: patients.filter((p) => p.has_insurance).length,
        };
    }, [patients]);

    // Formik Validation Schema
    const validationSchema = Yup.object({
        first_name: Yup.string().trim().required(t('common.required', 'This field is required')),
        last_name: Yup.string().trim().required(t('common.required', 'This field is required')),
        email: Yup.string().email('Invalid email format').nullable(),
        phone: Yup.string().nullable(),
        date_of_birth: Yup.string().nullable(),
        gender: Yup.string().nullable(),
        has_insurance: Yup.boolean(),
        is_active: Yup.boolean().default(true),
    });

    const initialValues: PatientFormValues = {
        patient_number: editingPatient?.patient_number || '',
        first_name: editingPatient?.first_name || '',
        middle_name: editingPatient?.middle_name || '',
        last_name: editingPatient?.last_name || '',
        gender: editingPatient?.gender || '',
        date_of_birth: editingPatient?.date_of_birth || '',
        phone: editingPatient?.phone || '',
        secondary_phone: editingPatient?.secondary_phone || '',
        email: editingPatient?.email || '',
        address: editingPatient?.address || '',
        city: editingPatient?.city || '',
        country: editingPatient?.country || '',
        national_id: editingPatient?.national_id || '',
        passport_number: editingPatient?.passport_number || '',
        emergency_contact_name: editingPatient?.emergency_contact_name || '',
        emergency_contact_phone: editingPatient?.emergency_contact_phone || '',
        emergency_contact_relation: editingPatient?.emergency_contact_relation || '',
        blood_type: editingPatient?.blood_type || '',
        allergies: editingPatient?.allergies || '',
        chronic_diseases: editingPatient?.chronic_diseases || '',
        medical_history: editingPatient?.medical_history || '',
        surgical_history: editingPatient?.surgical_history || '',
        family_medical_history: editingPatient?.family_medical_history || '',
        has_insurance: editingPatient ? Boolean(editingPatient.has_insurance) : false,
        insurance_company: editingPatient?.insurance_company || '',
        insurance_number: editingPatient?.insurance_number || '',
        insurance_expiry_date: editingPatient?.insurance_expiry_date || '',
        notes: editingPatient?.notes || '',
        occupation: editingPatient?.occupation || '',
        marital_status: editingPatient?.marital_status || '',
        is_active: editingPatient ? Boolean(editingPatient.is_active) : true,
    };

    const formik = useFormik<PatientFormValues>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!clinicSlug) {
                toast.error('Clinic slug is missing.');
                setSubmitting(false);
                return;
            }

            if (editingPatient) {
                // Update Patient
                router.put(`/clinic/${clinicSlug}/patients/${editingPatient.id}`, values as any, {
                    onSuccess: () => {
                        toast.success(t('patients.updated_success', 'Patient updated successfully!'));
                        handleCloseModal();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error updating patient');
                    },
                    onFinish: () => setSubmitting(false),
                });
            } else {
                // Create Patient
                router.post(`/clinic/${clinicSlug}/patients`, values as any, {
                    onSuccess: () => {
                        toast.success(t('patients.created_success', 'Patient created successfully!'));
                        handleCloseModal();
                        resetForm();
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || 'Error creating patient');
                    },
                    onFinish: () => setSubmitting(false),
                });
            }
        },
    });

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingPatient(null);
        setActiveTab('basic');
        formik.resetForm();
    };

    const handleOpenEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setIsAddModalOpen(true);
        setActiveTab('basic');
    };

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

    return (
        <ClinicLayout title={t('patients.title', 'Patients Management')}>
            <div className="space-y-6">
                {/* Header & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="h-7 w-7 text-orange-500" />
                            {t('patients.title', 'Patients Management')}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('patients.subtitle', 'View and manage clinic patients, medical records, contact info, and insurance.')}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingPatient(null);
                            setIsAddModalOpen(true);
                            setActiveTab('basic');
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        {t('patients.add_new', 'Add New Patient')}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('patients.total', 'Total Patients')}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {t('patients.active_count', 'Active Patients')}
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
                                    {t('patients.inactive_count', 'Inactive Patients')}
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
                                    {t('patients.insured_count', 'Insured Patients')}
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                    {stats.insured}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                                <ShieldCheck className="h-5 w-5" />
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
                                placeholder={t('patients.search_placeholder', 'Search by name, phone, ID...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={isRtl ? 'pr-9' : 'pl-9'}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:w-auto">
                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger className="w-full md:w-[150px]">
                                    <SelectValue placeholder={t('patients.gender', 'Gender')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('patients.all_genders', 'All Genders')}</SelectItem>
                                    <SelectItem value="male">{t('patients.male', 'Male')}</SelectItem>
                                    <SelectItem value="female">{t('patients.female', 'Female')}</SelectItem>
                                    <SelectItem value="other">{t('patients.other', 'Other')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={insuranceFilter} onValueChange={setInsuranceFilter}>
                                <SelectTrigger className="w-full md:w-[170px]">
                                    <SelectValue placeholder={t('patients.has_insurance', 'Insurance')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('patients.all_insurance', 'All Insurance Status')}</SelectItem>
                                    <SelectItem value="insured">{t('patients.with_insurance', 'With Insurance')}</SelectItem>
                                    <SelectItem value="uninsured">{t('patients.without_insurance', 'Without Insurance')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[150px]">
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

                {/* Table */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                            <TableRow>
                                <TableHead>{t('patients.patient_number', 'Patient')}</TableHead>
                                <TableHead>{t('patients.phone', 'Contact Info')}</TableHead>
                                <TableHead>{t('patients.gender', 'Gender / DOB')}</TableHead>
                                <TableHead>{t('patients.blood_type', 'Blood & Insurance')}</TableHead>
                                <TableHead>{t('patients.is_active', 'Status')}</TableHead>
                                <TableHead className="text-end">{t('common.actions', 'Actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPatients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        <Users className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                        {t('patients.no_patients', 'No patients found.')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPatients.map((patient) => {
                                    const fullName = `${patient.first_name} ${patient.middle_name ? patient.middle_name + ' ' : ''}${patient.last_name}`;
                                    return (
                                        <TableRow key={patient.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-semibold">
                                                        <AvatarFallback>{getInitials(patient.first_name, patient.last_name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                            {fullName}
                                                        </p>
                                                        <p className="text-xs text-orange-600 dark:text-orange-400 font-mono">
                                                            {patient.patient_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
                                                    {patient.phone && (
                                                        <p className="flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3 text-gray-400" />
                                                            {patient.phone}
                                                        </p>
                                                    )}
                                                    {patient.email && (
                                                        <p className="flex items-center gap-1.5 text-gray-500">
                                                            <Mail className="h-3 w-3 text-gray-400" />
                                                            {patient.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
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
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {patient.blood_type && (
                                                        <Badge className="bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 font-bold text-[11px]">
                                                            {patient.blood_type}
                                                        </Badge>
                                                    )}
                                                    {patient.has_insurance ? (
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 text-[11px] flex items-center gap-1">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            {patient.insurance_company || t('patients.has_insurance', 'Insured')}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
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
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setViewingPatient(patient)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                        title={t('patients.view', 'Patient Details')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEdit(patient)}
                                                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                        title={t('patients.edit', 'Edit Patient')}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeletingPatient(patient)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        title={t('patients.delete', 'Delete Patient')}
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-orange-500" />
                            {editingPatient ? t('patients.edit', 'Edit Patient') : t('patients.add_new', 'Add New Patient')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPatient
                                ? t('patients.edit_desc', 'Update patient profile, medical info, and insurance details.')
                                : t('patients.add_desc', 'Fill in patient personal details, contact info, and medical history.')}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Modal Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'basic'
                                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {t('patients.tab_basic', 'Basic & Contact Info')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('emergency')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'emergency'
                                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {t('patients.tab_emergency', 'Emergency & Insurance')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('medical')}
                            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'medical'
                                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {t('patients.tab_medical', 'Medical History & Notes')}
                        </button>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Tab 1: Basic & Contact */}
                        {activeTab === 'basic' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="first_name" className="required">
                                        {t('patients.first_name', 'First Name')} *
                                    </Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        value={formik.values.first_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="mt-1"
                                    />
                                    {formik.touched.first_name && formik.errors.first_name && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="middle_name">{t('patients.middle_name', 'Middle Name')}</Label>
                                    <Input
                                        id="middle_name"
                                        name="middle_name"
                                        value={formik.values.middle_name}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="last_name" className="required">
                                        {t('patients.last_name', 'Last Name')} *
                                    </Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        value={formik.values.last_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="mt-1"
                                    />
                                    {formik.touched.last_name && formik.errors.last_name && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.last_name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="gender">{t('patients.gender', 'Gender')}</Label>
                                    <Select
                                        value={formik.values.gender || ''}
                                        onValueChange={(val) => formik.setFieldValue('gender', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder={t('patients.gender', 'Select Gender')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">{t('patients.male', 'Male')}</SelectItem>
                                            <SelectItem value="female">{t('patients.female', 'Female')}</SelectItem>
                                            <SelectItem value="other">{t('patients.other', 'Other')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="date_of_birth">{t('patients.date_of_birth', 'Date of Birth')}</Label>
                                    <Input
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        type="date"
                                        value={formik.values.date_of_birth || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="patient_number">{t('patients.patient_number', 'Patient ID')}</Label>
                                    <Input
                                        id="patient_number"
                                        name="patient_number"
                                        placeholder="Auto-generated if empty"
                                        value={formik.values.patient_number || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1 font-mono"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">{t('patients.phone', 'Phone Number')}</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formik.values.phone || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="secondary_phone">{t('patients.secondary_phone', 'Secondary Phone')}</Label>
                                    <Input
                                        id="secondary_phone"
                                        name="secondary_phone"
                                        value={formik.values.secondary_phone || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">{t('patients.email', 'Email Address')}</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formik.values.email || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="national_id">{t('patients.national_id', 'National ID')}</Label>
                                    <Input
                                        id="national_id"
                                        name="national_id"
                                        value={formik.values.national_id || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="passport_number">{t('patients.passport_number', 'Passport Number')}</Label>
                                    <Input
                                        id="passport_number"
                                        name="passport_number"
                                        value={formik.values.passport_number || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="marital_status">{t('patients.marital_status', 'Marital Status')}</Label>
                                    <Select
                                        value={formik.values.marital_status || ''}
                                        onValueChange={(val) => formik.setFieldValue('marital_status', val)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">{t('patients.single', 'Single')}</SelectItem>
                                            <SelectItem value="married">{t('patients.married', 'Married')}</SelectItem>
                                            <SelectItem value="divorced">{t('patients.divorced', 'Divorced')}</SelectItem>
                                            <SelectItem value="widowed">{t('patients.widowed', 'Widowed')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="address">{t('patients.address', 'Address')}</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formik.values.address || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="occupation">{t('patients.occupation', 'Occupation')}</Label>
                                    <Input
                                        id="occupation"
                                        name="occupation"
                                        value={formik.values.occupation || ''}
                                        onChange={formik.handleChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Emergency & Insurance */}
                        {activeTab === 'emergency' && (
                            <div className="space-y-4">
                                <div className="bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/40 space-y-3">
                                    <h3 className="font-semibold text-sm text-orange-800 dark:text-orange-300 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        {t('patients.emergency_contact_name', 'Emergency Contact')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <Label htmlFor="emergency_contact_name">{t('patients.emergency_contact_name', 'Contact Name')}</Label>
                                            <Input
                                                id="emergency_contact_name"
                                                name="emergency_contact_name"
                                                value={formik.values.emergency_contact_name || ''}
                                                onChange={formik.handleChange}
                                                className="mt-1 bg-white dark:bg-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="emergency_contact_phone">{t('patients.emergency_contact_phone', 'Contact Phone')}</Label>
                                            <Input
                                                id="emergency_contact_phone"
                                                name="emergency_contact_phone"
                                                value={formik.values.emergency_contact_phone || ''}
                                                onChange={formik.handleChange}
                                                className="mt-1 bg-white dark:bg-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="emergency_contact_relation">{t('patients.emergency_contact_relation', 'Relation')}</Label>
                                            <Input
                                                id="emergency_contact_relation"
                                                name="emergency_contact_relation"
                                                placeholder="e.g. Spouse, Parent"
                                                value={formik.values.emergency_contact_relation || ''}
                                                onChange={formik.handleChange}
                                                className="mt-1 bg-white dark:bg-gray-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            {t('patients.has_insurance', 'Insurance Details')}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="has_insurance" className="cursor-pointer text-xs font-normal">
                                                {formik.values.has_insurance ? t('patients.with_insurance', 'Has Insurance') : t('patients.without_insurance', 'No Insurance')}
                                            </Label>
                                            <Switch
                                                id="has_insurance"
                                                checked={formik.values.has_insurance}
                                                onCheckedChange={(val) => formik.setFieldValue('has_insurance', val)}
                                            />
                                        </div>
                                    </div>

                                    {formik.values.has_insurance && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                            <div>
                                                <Label htmlFor="insurance_company">{t('patients.insurance_company', 'Insurance Company')}</Label>
                                                <Input
                                                    id="insurance_company"
                                                    name="insurance_company"
                                                    value={formik.values.insurance_company || ''}
                                                    onChange={formik.handleChange}
                                                    className="mt-1 bg-white dark:bg-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="insurance_number">{t('patients.insurance_number', 'Policy #')}</Label>
                                                <Input
                                                    id="insurance_number"
                                                    name="insurance_number"
                                                    value={formik.values.insurance_number || ''}
                                                    onChange={formik.handleChange}
                                                    className="mt-1 bg-white dark:bg-gray-900 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="insurance_expiry_date">{t('patients.insurance_expiry_date', 'Expiry Date')}</Label>
                                                <Input
                                                    id="insurance_expiry_date"
                                                    name="insurance_expiry_date"
                                                    type="date"
                                                    value={formik.values.insurance_expiry_date || ''}
                                                    onChange={formik.handleChange}
                                                    className="mt-1 bg-white dark:bg-gray-900"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Medical History & Notes */}
                        {activeTab === 'medical' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="blood_type">{t('patients.blood_type', 'Blood Type')}</Label>
                                        <Select
                                            value={formik.values.blood_type || ''}
                                            onValueChange={(val) => formik.setFieldValue('blood_type', val)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select Blood Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="allergies">{t('patients.allergies', 'Allergies')}</Label>
                                        <Input
                                            id="allergies"
                                            name="allergies"
                                            placeholder="e.g. Penicillin, Peanuts"
                                            value={formik.values.allergies || ''}
                                            onChange={formik.handleChange}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="chronic_diseases">{t('patients.chronic_diseases', 'Chronic Diseases')}</Label>
                                        <Input
                                            id="chronic_diseases"
                                            name="chronic_diseases"
                                            placeholder="e.g. Diabetes, Hypertension"
                                            value={formik.values.chronic_diseases || ''}
                                            onChange={formik.handleChange}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="surgical_history">{t('patients.surgical_history', 'Surgical History')}</Label>
                                        <Input
                                            id="surgical_history"
                                            name="surgical_history"
                                            placeholder="Previous surgeries..."
                                            value={formik.values.surgical_history || ''}
                                            onChange={formik.handleChange}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="medical_history">{t('patients.medical_history', 'Medical History')}</Label>
                                    <textarea
                                        id="medical_history"
                                        name="medical_history"
                                        rows={2}
                                        value={formik.values.medical_history || ''}
                                        onChange={formik.handleChange}
                                        className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Detailed medical conditions..."
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">{t('patients.notes', 'General Notes')}</Label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={2}
                                        value={formik.values.notes || ''}
                                        onChange={formik.handleChange}
                                        className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Additional patient notes..."
                                    />
                                </div>
                            </div>
                        )}

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
                                    : editingPatient
                                    ? t('common.save', 'Save Changes')
                                    : t('common.save', 'Create Patient')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Patient View Details Dialog */}
            {viewingPatient && (
                <Dialog open={Boolean(viewingPatient)} onOpenChange={() => setViewingPatient(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-bold text-lg">
                                    <AvatarFallback>
                                        {getInitials(viewingPatient.first_name, viewingPatient.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <DialogTitle className="text-xl font-bold">
                                        {viewingPatient.first_name} {viewingPatient.middle_name} {viewingPatient.last_name}
                                    </DialogTitle>
                                    <p className="text-xs text-orange-600 font-mono">
                                        {viewingPatient.patient_number}
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 my-3">
                            <button
                                type="button"
                                onClick={() => setViewTab('info')}
                                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                    viewTab === 'info'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                {t('patients.tab_basic', 'Personal Info')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewTab('emergency')}
                                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                    viewTab === 'emergency'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                {t('patients.tab_emergency', 'Emergency & Insurance')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewTab('medical')}
                                className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                                    viewTab === 'medical'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                {t('patients.tab_medical', 'Medical Records')}
                            </button>
                        </div>

                        {viewTab === 'info' && (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.gender', 'Gender')}</p>
                                    <p className="font-medium capitalize">{viewingPatient.gender || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.date_of_birth', 'Date of Birth')}</p>
                                    <p className="font-medium">{viewingPatient.date_of_birth || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.phone', 'Phone Number')}</p>
                                    <p className="font-medium">{viewingPatient.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.secondary_phone', 'Secondary Phone')}</p>
                                    <p className="font-medium">{viewingPatient.secondary_phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.email', 'Email')}</p>
                                    <p className="font-medium">{viewingPatient.email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.national_id', 'National ID')}</p>
                                    <p className="font-medium">{viewingPatient.national_id || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.passport_number', 'Passport')}</p>
                                    <p className="font-medium">{viewingPatient.passport_number || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.marital_status', 'Marital Status')}</p>
                                    <p className="font-medium capitalize">{viewingPatient.marital_status || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">{t('patients.address', 'Address')}</p>
                                    <p className="font-medium">{viewingPatient.address || '-'}</p>
                                </div>
                            </div>
                        )}

                        {viewTab === 'emergency' && (
                            <div className="space-y-4 text-sm">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-xs text-gray-500 mb-2">EMERGENCY CONTACT</h4>
                                    <p className="font-medium">{viewingPatient.emergency_contact_name || 'No contact provided'}</p>
                                    {viewingPatient.emergency_contact_phone && (
                                        <p className="text-xs text-gray-600">Phone: {viewingPatient.emergency_contact_phone}</p>
                                    )}
                                    {viewingPatient.emergency_contact_relation && (
                                        <p className="text-xs text-gray-600">Relation: {viewingPatient.emergency_contact_relation}</p>
                                    )}
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <h4 className="font-semibold text-xs text-gray-500 mb-2">INSURANCE INFORMATION</h4>
                                    <p className="font-medium">
                                        Status: {viewingPatient.has_insurance ? 'Insured' : 'No Insurance'}
                                    </p>
                                    {viewingPatient.has_insurance && (
                                        <>
                                            <p className="text-xs text-gray-600">Company: {viewingPatient.insurance_company || '-'}</p>
                                            <p className="text-xs text-gray-600">Policy #: {viewingPatient.insurance_number || '-'}</p>
                                            <p className="text-xs text-gray-600">Expiry: {viewingPatient.insurance_expiry_date || '-'}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {viewTab === 'medical' && (
                            <div className="space-y-3 text-sm">
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">{t('patients.blood_type', 'Blood Type')}</p>
                                        <Badge className="mt-1 bg-red-100 text-red-800 font-bold">{viewingPatient.blood_type || 'N/A'}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.allergies', 'Allergies')}</p>
                                    <p className="font-medium">{viewingPatient.allergies || 'None reported'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.chronic_diseases', 'Chronic Diseases')}</p>
                                    <p className="font-medium">{viewingPatient.chronic_diseases || 'None reported'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.medical_history', 'Medical History')}</p>
                                    <p className="font-medium">{viewingPatient.medical_history || 'No medical history recorded'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{t('patients.notes', 'Notes')}</p>
                                    <p className="font-medium">{viewingPatient.notes || 'No notes'}</p>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t">
                            <Button variant="outline" onClick={() => setViewingPatient(null)}>
                                {t('common.close', 'Close')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={Boolean(deletingPatient)} onOpenChange={() => setDeletingPatient(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            {t('patients.delete', 'Delete Patient')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('patients.delete_confirm', 'Are you sure you want to delete this patient record?')}
                            {deletingPatient && (
                                <span className="block mt-2 font-bold text-gray-900 dark:text-white">
                                    {deletingPatient.first_name} {deletingPatient.last_name} ({deletingPatient.patient_number})
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeletingPatient(null)}>
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
