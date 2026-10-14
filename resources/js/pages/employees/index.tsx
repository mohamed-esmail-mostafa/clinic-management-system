import React, { useState, useMemo } from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import useImport from '@/hooks/use-import';
import useAuthClinics from '@/hooks/use-auth-clinics';
import useAuth from '@/hooks/use-auth';
import { ClinicEmployee, StoreEmployeeFormValues, UpdateEmployeeFormValues } from '@/types/employee';
import { Role } from '@/types/role';
import { User } from '@/types/auth';
import { Clinic } from '@/types/clinic';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

// UI Components
import PageHeader from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

// Icons
import {
    Users,
    UserPlus,
    UserCheck,
    Stethoscope,
    HeartPulse,
    ShieldCheck,
    PhoneCall,
    Search,
    Pencil,
    Trash2,
    Mail,
    Phone,
    Calendar,
    LayoutGrid,
    List,
    Copy,
    Check,
    Lock,
    User as UserIcon,
    KeyRound,
} from 'lucide-react';

interface Props {
    clinic?: Clinic;
    employees?: ClinicEmployee[];
    roles?: Role[];
    all_users?: User[];
}

export default function EmployeesPage({
    clinic: serverClinic,
    employees = [],
    roles = [],
}: Props) {
    const { t, isRtl } = useImport();
    const { authClinic } = useAuthClinics();
    const { auth } = useAuth();

    const currentUserId = auth?.user?.id;
    const clinicSlug = serverClinic?.slug || authClinic?.slug || '';

    // Filter and display state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null);

    // Modal dialog states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<ClinicEmployee | null>(null);
    const [deletingEmployee, setDeletingEmployee] = useState<ClinicEmployee | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // KPI Summary Metrics
    const stats = useMemo(() => {
        const total = employees.length;
        const doctors = employees.filter((e) => {
            const slug = e.role?.slug?.toLowerCase() || '';
            const name = e.role?.name?.toLowerCase() || '';
            return slug.includes('doctor') || name.includes('doctor');
        }).length;

        const nurses = employees.filter((e) => {
            const slug = e.role?.slug?.toLowerCase() || '';
            const name = e.role?.name?.toLowerCase() || '';
            return slug.includes('nurse') || name.includes('nurse');
        }).length;

        const receptionists = employees.filter((e) => {
            const slug = e.role?.slug?.toLowerCase() || '';
            const name = e.role?.name?.toLowerCase() || '';
            return slug.includes('receptionist') || name.includes('receptionist');
        }).length;

        const admins = employees.filter((e) => {
            const slug = e.role?.slug?.toLowerCase() || '';
            const name = e.role?.name?.toLowerCase() || '';
            return slug.includes('admin') || slug.includes('owner') || name.includes('admin') || name.includes('owner');
        }).length;

        return { total, doctors, nurses, receptionists, admins };
    }, [employees]);

    // Filtered Employees List
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            const user = emp.user;
            const query = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !query ||
                user?.name?.toLowerCase().includes(query) ||
                user?.email?.toLowerCase().includes(query) ||
                (user?.phone && user.phone.toLowerCase().includes(query)) ||
                emp.role?.name?.toLowerCase().includes(query);

            const matchesRole =
                selectedRole === 'all' ||
                String(emp.role_id) === selectedRole ||
                emp.role?.slug === selectedRole;

            return matchesSearch && matchesRole;
        });
    }, [employees, searchTerm, selectedRole]);

    // Validation schema for Adding an Employee
    const addValidationSchema = Yup.object().shape({
        name: Yup.string().trim().required(t('common.required', 'Full name is required')),
        email: Yup.string().email(t('common.invalid_email', 'Invalid email address')).required(t('common.required', 'Email is required')),
        password: Yup.string().min(8, t('common.min_characters', 'Password must be at least 8 characters')).required(t('common.required', 'Password is required')),
        phone: Yup.string().nullable(),
        role_id: Yup.string().required(t('common.required', 'Please select a role')),
    });

    const addFormik = useFormik<StoreEmployeeFormValues>({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            role_id: roles.length > 0 ? String(roles[0].id) : '',
        },
        enableReinitialize: false,
        validationSchema: addValidationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (!clinicSlug) {
                toast.error(t('employees.errors.no_clinic', 'Clinic slug not found.'));
                setSubmitting(false);
                return;
            }

            const payload = {
                mode: 'new',
                name: values.name,
                email: values.email,
                phone: values.phone || null,
                password: values.password,
                role_id: values.role_id,
            };

            router.post(`/clinic/${clinicSlug}/employees`, payload, {
                onSuccess: () => {
                    toast.success(t('employees.created_success', 'Employee added successfully!'));
                    setIsAddModalOpen(false);
                    resetForm();
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || t('employees.errors.add_failed', 'Failed to add employee'));
                },
                onFinish: () => setSubmitting(false),
            });
        },
    });

    // Validation schema for Editing an Employee
    const editValidationSchema = Yup.object().shape({
        name: Yup.string().trim().required(t('common.required', 'Full name is required')),
        email: Yup.string().email(t('common.invalid_email', 'Invalid email address')).required(t('common.required', 'Email is required')),
        phone: Yup.string().nullable(),
        role_id: Yup.string().required(t('common.required', 'Role is required')),
        password: Yup.string().nullable().min(8, t('common.min_characters', 'Password must be at least 8 characters')),
    });

    const editFormik = useFormik<UpdateEmployeeFormValues>({
        initialValues: {
            name: editingEmployee?.user?.name || '',
            email: editingEmployee?.user?.email || '',
            phone: editingEmployee?.user?.phone || '',
            role_id: editingEmployee ? String(editingEmployee.role_id) : '',
            password: '',
        },
        enableReinitialize: true,
        validationSchema: editValidationSchema,
        onSubmit: (values, { setSubmitting }) => {
            if (!clinicSlug || !editingEmployee) {
                setSubmitting(false);
                return;
            }

            const payload: any = {
                name: values.name,
                email: values.email,
                phone: values.phone || null,
                role_id: values.role_id,
            };

            if (values.password && values.password.trim().length > 0) {
                payload.password = values.password;
            }

            router.put(`/clinic/${clinicSlug}/employees/${editingEmployee.user_id}`, payload, {
                onSuccess: () => {
                    toast.success(t('employees.updated_success', 'Employee details updated successfully!'));
                    setEditingEmployee(null);
                    editFormik.resetForm();
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || t('employees.errors.update_failed', 'Failed to update employee'));
                },
                onFinish: () => setSubmitting(false),
            });
        },
    });

    // Handle Delete / Remove Employee
    const handleDeleteEmployee = () => {
        if (!deletingEmployee || !clinicSlug) return;

        setIsDeleting(true);
        router.delete(`/clinic/${clinicSlug}/employees/${deletingEmployee.user_id}`, {
            onSuccess: () => {
                toast.success(t('employees.deleted_success', 'Employee removed from clinic.'));
                setDeletingEmployee(null);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as string;
                toast.error(firstError || t('employees.errors.delete_failed', 'Failed to remove employee'));
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    // Helper: Copy email to clipboard
    const handleCopyEmail = (email: string, id: number) => {
        navigator.clipboard.writeText(email);
        setCopiedEmailId(id);
        toast.success(t('common.copied', 'Email copied to clipboard'));
        setTimeout(() => setCopiedEmailId(null), 2000);
    };

    // Helper: Avatar initials
    const getInitials = (name?: string) => {
        if (!name) return 'EM';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Helper: Role Badge with stylized colors & icons
    const renderRoleBadge = (role?: Role) => {
        if (!role) {
            return (
                <Badge variant="outline" className="text-xs">
                    {t('employees.roles.member', 'Staff Member')}
                </Badge>
            );
        }

        const slug = role.slug?.toLowerCase() || '';
        const name = role.name || '';

        if (slug.includes('doctor') || name.toLowerCase().includes('doctor')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {name}
                </span>
            );
        }

        if (slug.includes('nurse') || name.toLowerCase().includes('nurse')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {name}
                </span>
            );
        }

        if (slug.includes('receptionist') || name.toLowerCase().includes('receptionist')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">
                    <PhoneCall className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    {name}
                </span>
            );
        }

        if (slug.includes('admin') || slug.includes('owner') || name.toLowerCase().includes('admin')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {name}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                {name}
            </span>
        );
    };

    // Helper: Format Joined Date
    const formatJoinedDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <ClinicLayout title={t('employees.title', 'Clinic Employees')}>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <PageHeader
                    icon={<Users className="h-7 w-7 text-primary" />}
                    title={t('employees.title', 'Clinic Employees')}
                    subtitle={t(
                        'employees.subtitle',
                        'Manage your clinic medical staff, receptionists, administrators, and assign roles.'
                    )}
                    count={employees.length}
                >
                    <Button
                        onClick={() => {
                            addFormik.resetForm();
                            setIsAddModalOpen(true);
                        }}
                        className="w-full sm:w-auto shadow-sm gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        {t('employees.add_employee', 'Add Employee')}
                    </Button>
                </PageHeader>

                {/* KPI Metrics Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <Card className="border-border/60 shadow-xs hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('employees.stats.total', 'Total Staff')}
                                </p>
                                <h3 className="text-2xl font-bold mt-1 text-foreground">
                                    {stats.total}
                                </h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('employees.stats.doctors', 'Doctors')}
                                </p>
                                <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                                    {stats.doctors}
                                </h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('employees.stats.nurses', 'Nurses')}
                                </p>
                                <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                                    {stats.nurses}
                                </h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <HeartPulse className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('employees.stats.receptionists', 'Receptionists')}
                                </p>
                                <h3 className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                                    {stats.receptionists}
                                </h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <PhoneCall className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-xs hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    {t('employees.stats.admins', 'Admins & Owners')}
                                </p>
                                <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                                    {stats.admins}
                                </h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card className="border-border/60 shadow-xs">
                    <CardContent className="p-3.5 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {/* Search Box */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                <Input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('employees.search_placeholder', 'Search by name, email, phone or role...')}
                                    className={isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className={`absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground ${isRtl ? 'left-3' : 'right-3'}`}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Role Dropdown Filter */}
                            <div className="w-full sm:w-56">
                                <Select
                                    value={selectedRole}
                                    onValueChange={(val) => setSelectedRole(val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('employees.filter_by_role', 'Filter by Role')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('employees.all_roles', 'All Roles')} ({employees.length})
                                        </SelectItem>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* View Switcher (Table / Grid) */}
                            <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/40 shrink-0 self-end sm:self-auto">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                    className="h-8 px-2.5"
                                    title={t('employees.view_table', 'Table View')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 px-2.5"
                                    title={t('employees.view_grid', 'Grid Cards View')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Active filter tags */}
                        {(searchTerm || selectedRole !== 'all') && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t text-xs text-muted-foreground">
                                <span>{t('common.active_filters', 'Active filters:')}</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="gap-1 font-normal">
                                        "{searchTerm}"
                                        <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-foreground">✕</button>
                                    </Badge>
                                )}
                                {selectedRole !== 'all' && (
                                    <Badge variant="secondary" className="gap-1 font-normal">
                                        {roles.find((r) => String(r.id) === selectedRole)?.name || selectedRole}
                                        <button onClick={() => setSelectedRole('all')} className="ml-1 hover:text-foreground">✕</button>
                                    </Badge>
                                )}
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedRole('all');
                                    }}
                                    className="h-auto p-0 text-xs text-primary underline"
                                >
                                    {t('common.clear_all', 'Clear all')}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Employees Content: Empty State vs Table/Grid */}
                {filteredEmployees.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="py-14 px-4 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-4">
                                <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">
                                {employees.length === 0
                                    ? t('employees.empty_title', 'No employees registered yet')
                                    : t('employees.no_search_results', 'No employees match your search')}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                {employees.length === 0
                                    ? t('employees.empty_subtitle', 'Start assembling your team by adding doctors, nurses, receptionists, or staff to this clinic.')
                                    : t('employees.no_search_subtitle', 'Try adjusting your search query or reset the role filter to view all staff members.')}
                            </p>
                            <div className="mt-6">
                                {employees.length === 0 ? (
                                    <Button
                                        onClick={() => {
                                            addFormik.resetForm();
                                            setIsAddModalOpen(true);
                                        }}
                                        className="gap-2"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        {t('employees.add_first_employee', 'Add First Employee')}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedRole('all');
                                        }}
                                    >
                                        {t('common.reset_filters', 'Reset Filters')}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : viewMode === 'table' ? (
                    /* Table View */
                    <div className="rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">{t('employees.table.employee', 'Employee')}</TableHead>
                                    <TableHead>{t('employees.table.role', 'Clinic Role')}</TableHead>
                                    <TableHead>{t('employees.table.contact', 'Contact Info')}</TableHead>
                                    <TableHead>{t('employees.table.joined', 'Joined Date')}</TableHead>
                                    <TableHead className={`w-[120px] ${isRtl ? 'text-left' : 'text-right'}`}>
                                        {t('common.actions', 'Actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map((emp) => {
                                    const user = emp.user;
                                    const isCurrentUser = user?.id === currentUserId;

                                    return (
                                        <TableRow key={emp.id} className="hover:bg-muted/30 transition-colors">
                                            {/* Employee Column (Avatar + Name) */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-border shadow-xs">
                                                        {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name} />}
                                                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold text-xs">
                                                            {getInitials(user?.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-foreground truncate">
                                                                {user?.name || t('employees.unknown_user', 'Unknown Staff')}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/20">
                                                                    {t('common.you', 'You')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate font-mono">
                                                            ID: #{user?.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Role Column */}
                                            <TableCell>
                                                {renderRoleBadge(emp.role)}
                                            </TableCell>

                                            {/* Contact Info Column */}
                                            <TableCell>
                                                <div className="space-y-1 text-xs">
                                                    {user?.email && (
                                                        <div className="flex items-center gap-1.5 text-muted-foreground group">
                                                            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                                            <a
                                                                href={`mailto:${user.email}`}
                                                                className="hover:underline hover:text-foreground truncate max-w-[200px]"
                                                                title={user.email}
                                                            >
                                                                {user.email}
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyEmail(user.email, emp.id)}
                                                                className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                                                                title={t('common.copy_email', 'Copy email')}
                                                            >
                                                                {copiedEmailId === emp.id ? (
                                                                    <Check className="h-3 w-3 text-emerald-500" />
                                                                ) : (
                                                                    <Copy className="h-3 w-3" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {user?.phone ? (
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                                                            <a
                                                                href={`tel:${user.phone}`}
                                                                className="hover:underline hover:text-foreground font-mono"
                                                            >
                                                                {user.phone}
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 text-[11px] italic">
                                                            {t('employees.no_phone', 'No phone provided')}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Joined Date */}
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                    {formatJoinedDate(emp.created_at)}
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className={isRtl ? 'text-left' : 'text-right'}>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingEmployee(emp)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                        title={t('common.edit', 'Edit Employee')}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isCurrentUser}
                                                        onClick={() => setDeletingEmployee(emp)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:pointer-events-none"
                                                        title={
                                                            isCurrentUser
                                                                ? t('employees.cannot_remove_self', 'You cannot remove yourself')
                                                                : t('common.delete', 'Remove from clinic')
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    /* Grid Cards View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEmployees.map((emp) => {
                            const user = emp.user;
                            const isCurrentUser = user?.id === currentUserId;

                            return (
                                <Card
                                    key={emp.id}
                                    className="border-border/60 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
                                >
                                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                                        {/* Card Top: Avatar, Name & Role */}
                                        <div className="flex items-start gap-3.5">
                                            <Avatar className="h-12 w-12 border border-border shadow-xs shrink-0">
                                                {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name} />}
                                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-bold text-sm">
                                                    {getInitials(user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h4 className="font-semibold text-base text-foreground truncate">
                                                        {user?.name || t('employees.unknown_user', 'Unknown Staff')}
                                                    </h4>
                                                    {isCurrentUser && (
                                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/20">
                                                            {t('common.you', 'You')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-1.5">
                                                    {renderRoleBadge(emp.role)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Middle: Contacts */}
                                        <div className="space-y-2 pt-2 border-t border-border/50 text-xs">
                                            <div className="flex items-center justify-between text-muted-foreground">
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                                    <a
                                                        href={`mailto:${user?.email}`}
                                                        className="hover:underline hover:text-foreground truncate"
                                                    >
                                                        {user?.email}
                                                    </a>
                                                </span>
                                                {user?.email && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyEmail(user.email, emp.id)}
                                                        className="p-1 hover:text-primary transition-colors text-muted-foreground/80"
                                                        title={t('common.copy_email', 'Copy email')}
                                                    >
                                                        {copiedEmailId === emp.id ? (
                                                            <Check className="h-3 w-3 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                                {user?.phone ? (
                                                    <a
                                                        href={`tel:${user.phone}`}
                                                        className="hover:underline hover:text-foreground font-mono"
                                                    >
                                                        {user.phone}
                                                    </a>
                                                ) : (
                                                    <span className="italic text-muted-foreground/50">
                                                        {t('employees.no_phone', 'No phone provided')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] pt-1">
                                                <Calendar className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                                                <span>
                                                    {t('employees.joined', 'Joined')}: {formatJoinedDate(emp.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Footer: Action Buttons */}
                                        <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingEmployee(emp)}
                                                className="gap-1.5 text-xs h-8"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                {t('common.edit', 'Edit')}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isCurrentUser}
                                                onClick={() => setDeletingEmployee(emp)}
                                                className="text-destructive hover:bg-destructive/10 text-xs h-8 px-2.5 disabled:opacity-30"
                                                title={
                                                    isCurrentUser
                                                        ? t('employees.cannot_remove_self', 'You cannot remove yourself')
                                                        : t('common.delete', 'Remove')
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* ADD EMPLOYEE DIALOG                                      */}
            {/* ========================================================= */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg">
                                    {t('employees.dialog.add_title', 'Add Clinic Employee')}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    {t(
                                        'employees.dialog.add_subtitle',
                                        'Register a new employee account and assign their clinic role.'
                                    )}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={addFormik.handleSubmit} className="space-y-4 pt-2">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="add_name" className="text-xs font-medium">
                                {t('employees.fields.name', 'Full Name')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <UserIcon className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                <Input
                                    id="add_name"
                                    name="name"
                                    placeholder="Dr. John Doe / Sarah Smith"
                                    value={addFormik.values.name}
                                    onChange={addFormik.handleChange}
                                    onBlur={addFormik.handleBlur}
                                    className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                />
                            </div>
                            {addFormik.touched.name && addFormik.errors.name && (
                                <p className="text-xs text-destructive">{addFormik.errors.name}</p>
                            )}
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <Label htmlFor="add_email" className="text-xs font-medium">
                                {t('employees.fields.email', 'Email Address')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                <Input
                                    id="add_email"
                                    name="email"
                                    type="email"
                                    placeholder="doctor@clinic.com"
                                    value={addFormik.values.email}
                                    onChange={addFormik.handleChange}
                                    onBlur={addFormik.handleBlur}
                                    className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                />
                            </div>
                            {addFormik.touched.email && addFormik.errors.email && (
                                <p className="text-xs text-destructive">{addFormik.errors.email}</p>
                            )}
                        </div>

                        {/* Phone & Role in 2 Columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Phone Number */}
                            <div className="space-y-1.5">
                                <Label htmlFor="add_phone" className="text-xs font-medium">
                                    {t('employees.fields.phone', 'Phone Number')}
                                </Label>
                                <div className="relative">
                                    <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                    <Input
                                        id="add_phone"
                                        name="phone"
                                        placeholder="+1 555-0199"
                                        value={addFormik.values.phone}
                                        onChange={addFormik.handleChange}
                                        onBlur={addFormik.handleBlur}
                                        className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                    />
                                </div>
                                {addFormik.touched.phone && addFormik.errors.phone && (
                                    <p className="text-xs text-destructive">{addFormik.errors.phone}</p>
                                )}
                            </div>

                            {/* Clinic Role */}
                            <div className="space-y-1.5">
                                <Label htmlFor="add_role_id" className="text-xs font-medium">
                                    {t('employees.fields.role', 'Clinic Role')} <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={String(addFormik.values.role_id)}
                                    onValueChange={(val) => addFormik.setFieldValue('role_id', val)}
                                >
                                    <SelectTrigger id="add_role_id">
                                        <SelectValue placeholder={t('employees.select_role', 'Select role')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {addFormik.touched.role_id && addFormik.errors.role_id && (
                                    <p className="text-xs text-destructive">{addFormik.errors.role_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="add_password" className="text-xs font-medium">
                                {t('employees.fields.password', 'Initial Password')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                <Input
                                    id="add_password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={addFormik.values.password}
                                    onChange={addFormik.handleChange}
                                    onBlur={addFormik.handleBlur}
                                    className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {t('employees.password_hint', 'Minimum 8 characters. The user can change this later.')}
                            </p>
                            {addFormik.touched.password && addFormik.errors.password && (
                                <p className="text-xs text-destructive">{addFormik.errors.password}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-3 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={addFormik.isSubmitting}
                                className="gap-2"
                            >
                                {addFormik.isSubmitting ? (
                                    <>
                                        <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                                        {t('common.saving', 'Adding...')}
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        {t('employees.add_employee_btn', 'Add to Clinic')}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ========================================================= */}
            {/* EDIT EMPLOYEE DIALOG                                     */}
            {/* ========================================================= */}
            <Dialog open={Boolean(editingEmployee)} onOpenChange={(open) => !open && setEditingEmployee(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Pencil className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg">
                                    {t('employees.dialog.edit_title', 'Edit Employee')}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    {t(
                                        'employees.dialog.edit_subtitle',
                                        'Update staff profile information and clinic role assignment.'
                                    )}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={editFormik.handleSubmit} className="space-y-4 pt-2">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_name" className="text-xs font-medium">
                                {t('employees.fields.name', 'Full Name')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <UserIcon className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                <Input
                                    id="edit_name"
                                    name="name"
                                    value={editFormik.values.name}
                                    onChange={editFormik.handleChange}
                                    onBlur={editFormik.handleBlur}
                                    className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                />
                            </div>
                            {editFormik.touched.name && editFormik.errors.name && (
                                <p className="text-xs text-destructive">{editFormik.errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit_email" className="text-xs font-medium">
                                {t('employees.fields.email', 'Email Address')} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                <Input
                                    id="edit_email"
                                    name="email"
                                    type="email"
                                    value={editFormik.values.email}
                                    onChange={editFormik.handleChange}
                                    onBlur={editFormik.handleBlur}
                                    className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                />
                            </div>
                            {editFormik.touched.email && editFormik.errors.email && (
                                <p className="text-xs text-destructive">{editFormik.errors.email}</p>
                            )}
                        </div>

                        {/* Phone & Role */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit_phone" className="text-xs font-medium">
                                    {t('employees.fields.phone', 'Phone Number')}
                                </Label>
                                <div className="relative">
                                    <Phone className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                    <Input
                                        id="edit_phone"
                                        name="phone"
                                        placeholder="+1 555-0199"
                                        value={editFormik.values.phone}
                                        onChange={editFormik.handleChange}
                                        onBlur={editFormik.handleBlur}
                                        className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                    />
                                </div>
                                {editFormik.touched.phone && editFormik.errors.phone && (
                                    <p className="text-xs text-destructive">{editFormik.errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit_role_id" className="text-xs font-medium">
                                    {t('employees.fields.role', 'Clinic Role')} <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={String(editFormik.values.role_id)}
                                    onValueChange={(val) => editFormik.setFieldValue('role_id', val)}
                                >
                                    <SelectTrigger id="edit_role_id">
                                        <SelectValue placeholder={t('employees.select_role', 'Select role')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editFormik.touched.role_id && editFormik.errors.role_id && (
                                    <p className="text-xs text-destructive">{editFormik.errors.role_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Optional Password reset */}
                        <div className="space-y-1.5 pt-1">
                            <Label htmlFor="edit_password" className="text-xs font-medium flex items-center justify-between">
                                <span>{t('employees.fields.new_password', 'New Password')}</span>
                                <span className="text-[10px] text-muted-foreground font-normal">
                                    ({t('common.optional', 'Optional')})
                                </span>
                            </Label>
                            <div className="relative">
                                <KeyRound className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? 'right-3' : 'left-3'}`} />
                                <Input
                                    id="edit_password"
                                    name="password"
                                    type="password"
                                    placeholder={t('employees.password_placeholder', 'Leave blank to keep existing password')}
                                    value={editFormik.values.password}
                                    onChange={editFormik.handleChange}
                                    onBlur={editFormik.handleBlur}
                                    className={isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}
                                />
                            </div>
                            {editFormik.touched.password && editFormik.errors.password && (
                                <p className="text-xs text-destructive">{editFormik.errors.password}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-3 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingEmployee(null)}
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={editFormik.isSubmitting} className="gap-2">
                                {editFormik.isSubmitting ? (
                                    <>
                                        <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                                        {t('common.saving', 'Saving...')}
                                    </>
                                ) : (
                                    t('common.save_changes', 'Save Changes')
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ========================================================= */}
            {/* DELETE / REMOVE CONFIRMATION DIALOG                      */}
            {/* ========================================================= */}
            <Dialog open={Boolean(deletingEmployee)} onOpenChange={(open) => !open && setDeletingEmployee(null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                                <Trash2 className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg">
                                    {t('employees.dialog.delete_title', 'Remove Employee')}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    {t('employees.dialog.delete_subtitle', 'Confirm employee removal from this clinic')}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-2 text-sm text-muted-foreground space-y-3">
                        <p>
                            {t(
                                'employees.delete_confirm_text',
                                'Are you sure you want to remove this employee from the clinic? They will lose access to this clinic\'s patient files, appointments, and dashboard.'
                            )}
                        </p>

                        {deletingEmployee && (
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border">
                                <Avatar className="h-10 w-10 border shadow-xs">
                                    {deletingEmployee.user?.avatar && (
                                        <AvatarImage src={deletingEmployee.user.avatar} alt={deletingEmployee.user?.name} />
                                    )}
                                    <AvatarFallback className="font-semibold text-xs">
                                        {getInitials(deletingEmployee.user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-semibold text-foreground truncate">
                                        {deletingEmployee.user?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {deletingEmployee.user?.email} • {deletingEmployee.role?.name}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingEmployee(null)}
                            disabled={isDeleting}
                        >
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteEmployee}
                            disabled={isDeleting}
                            className="gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                                    {t('common.removing', 'Removing...')}
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    {t('employees.confirm_remove', 'Remove from Clinic')}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ClinicLayout>
    );
}
