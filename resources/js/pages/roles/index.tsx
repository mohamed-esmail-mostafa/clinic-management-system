import React, { useState } from 'react'
import AdminLayout from '@/layouts/admin-layout'
import { Role, RoleFormValues } from '@/types/role'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import useImport from '@/hooks/use-import'
import InputError from '@/components/input-error'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Shield,
    ShieldCheck,
} from 'lucide-react'

interface Props {
    roles?: Role[];
}

export default function RolesPage({ roles = [] }: Props) {
    const { t, isRtl } = useImport()
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [deletingRole, setDeletingRole] = useState<Role | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        name: Yup.string()
            .trim()
            .required(t('common.required', 'This field is required')),
        type: Yup.string()
            .oneOf(['system', 'clinic'])
            .required(t('common.required', 'This field is required')),
    })

    // Formik for Add/Edit Role
    const formik = useFormik<RoleFormValues>({
        initialValues: {
            name: editingRole?.name || '',
            type: editingRole?.type || 'system',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting, resetForm }) => {
            if (editingRole) {
                // Update operation
                router.put(`/admin/roles/${editingRole.slug}`, values, {
                    onSuccess: () => {
                        toast.success(t('roles.updated', 'Role updated successfully!'))
                        handleCloseModal()
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || t('roles.failed-to-add', 'Failed to update role'))
                    },
                    onFinish: () => setSubmitting(false),
                })
            } else {
                // Create operation
                router.post('/admin/roles/store', values, {
                    onSuccess: () => {
                        toast.success(t('roles.added', 'Role created successfully!'))
                        handleCloseModal()
                        resetForm()
                    },
                    onError: (errors) => {
                        toast.error((Object.values(errors)[0] as string) || t('roles.failed-to-add', 'Failed to add role'))
                    },
                    onFinish: () => setSubmitting(false),
                })
            }
        },
    })

    const handleOpenAdd = () => {
        setEditingRole(null)
        formik.resetForm({ values: { name: '', type: 'system' } })
        setIsAddModalOpen(true)
    }

    const handleOpenEdit = (role: Role) => {
        setEditingRole(role)
        formik.setValues({ name: role.name, type: role.type || 'system' })
        setIsAddModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsAddModalOpen(false)
        setEditingRole(null)
        formik.resetForm()
    }

    // Confirm Delete
    const handleDeleteConfirm = () => {
        if (!deletingRole) return
        setIsDeleting(true)

        router.delete(`/admin/roles/${deletingRole.slug}`, {
            onSuccess: () => {
                toast.success(t('roles.deleted', 'Role deleted successfully!'))
                setDeletingRole(null)
            },
            onError: () => {
                toast.error('Failed to delete role')
            },
            onFinish: () => setIsDeleting(false),
        })
    }

    // Filter roles
    const filteredRoles = roles.filter((role) => {
        const query = searchTerm.toLowerCase().trim()
        return (
            role.name.toLowerCase().includes(query) ||
            role.slug.toLowerCase().includes(query) ||
            (role.type && role.type.toLowerCase().includes(query))
        )
    })

    return (
        <AdminLayout title={t('roles.title', 'Roles & Permissions')}>
            <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                <ShieldCheck size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {t('roles.title', 'Roles & Permissions')}
                            </h1>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {t('roles.subtitle', 'Manage system user roles and permission groups.')}
                        </p>
                    </div>

                    <Button onClick={handleOpenAdd}>
                        <Plus size={18} />
                        <span>{t('roles.add-role', 'Add New Role')}</span>
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search
                            size={16}
                            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                                isRtl ? 'right-3' : 'left-3'
                            }`}
                        />
                        <Input
                            placeholder={t('roles.search_placeholder', 'Search roles...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Badge variant="outline" className="h-9 px-3 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium">
                        {t('roles.total', 'Total Roles')}: {roles.length}
                    </Badge>
                </div>

                {/* Roles Cards Grid */}
                {filteredRoles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRoles.map((role) => (
                            <Card key={role.id || role.slug} className="border-gray-100 dark:border-gray-800 shadow-xs hover:border-primary/40 transition-all duration-200 group">
                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                    <Shield size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                                            {role.name}
                                                        </h3>
                                                        <Badge
                                                            variant={role.type === 'system' ? 'default' : 'secondary'}
                                                            className="capitalize text-[10px] px-2 py-0.5"
                                                        >
                                                            {role.type || 'system'}
                                                        </Badge>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1 font-mono text-[11px] bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                                    >
                                                        {role.slug}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-5 border-t border-gray-100 dark:border-gray-800/80 mt-4">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleOpenEdit(role)}
                                        >
                                            <Pencil size={14} />
                                            <span>{t('roles.edit_role', 'Edit')}</span>
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeletingRole(role)}
                                        >
                                            <Trash2 size={14} />
                                            <span>{t('roles.delete_role', 'Delete')}</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <Shield size={36} className="text-gray-300 dark:text-gray-700" />
                            <span className="text-sm">{t('roles.no_roles', 'No roles found.')}</span>
                        </div>
                    </div>
                )}

                {/* Create / Edit Role Modal */}
                <Dialog open={isAddModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {editingRole
                                    ? t('roles.edit_role', 'Edit Role')
                                    : t('roles.add-role', 'Add New Role')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Fill in role details. Form validated with Formik & Yup.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('roles.label', 'Role Name')} <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Doctor, Admin, Accountant"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <InputError message={formik.errors.name} />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="type" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    {t('roles.type_label', 'Role Type')} <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={formik.values.type}
                                    onValueChange={(val) => formik.setFieldValue('type', val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('roles.select_type', 'Select role type')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900">
                                        <SelectItem value="system">{t('roles.type_system', 'System')}</SelectItem>
                                        <SelectItem value="clinic">{t('roles.type_clinic', 'Clinic')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.touched.type && formik.errors.type && (
                                    <InputError message={formik.errors.type as string} />
                                )}
                            </div>

                            <DialogFooter className="pt-4 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                >
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                >
                                    {formik.isSubmitting
                                        ? t('common.processing', 'Saving...')
                                        : t('common.save', 'Save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
                    <DialogContent className="sm:max-w-sm rounded-2xl bg-white dark:bg-gray-900">
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold text-rose-600 dark:text-rose-400">
                                {t('roles.delete_role', 'Delete Role')}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-600 dark:text-gray-400 pt-2">
                                {t('roles.delete_confirm', 'Are you sure you want to delete this role?')}
                                {deletingRole && (
                                    <span className="block font-bold text-gray-900 dark:text-gray-100 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                        {deletingRole.name} ({deletingRole.slug})
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingRole(null)}
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={isDeleting}
                                onClick={handleDeleteConfirm}
                            >
                                {isDeleting ? t('common.processing', 'Deleting...') : t('common.delete', 'Delete')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
