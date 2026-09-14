import React, { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImagePicker from '@/components/ui/image-picker';

// Icons
import {
    User as UserIcon,
    Mail,
    Phone,
    Lock,
    Save,
    Trash2,
    Shield,
    Camera,
    CheckCircle2,
} from 'lucide-react';

interface Props {
    user?: User | null;
}

export default function UserForm({ user }: Props) {
    const { t, isRtl } = useImport();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        const f = parts[0]?.charAt(0).toUpperCase() || '';
        const l = parts[1]?.charAt(0).toUpperCase() || '';
        return `${f}${l}` || 'U';
    };

    const validationSchema = Yup.object({
        name: Yup.string().trim().required(t('common.required', 'This field is required')),
        email: Yup.string()
            .email(t('validation.email', 'Please enter a valid email address'))
            .required(t('common.required', 'This field is required')),
        phone: Yup.string().nullable(),
        password: Yup.string()
            .nullable()
            .test('min-len', t('validation.min_8', 'Password must be at least 8 characters'), (val) => {
                if (!val) return true;
                return val.length >= 8;
            }),
        password_confirmation: Yup.string().when('password', {
            is: (val: string) => Boolean(val && val.length > 0),
            then: (schema) =>
                schema
                    .required(t('common.required', 'This field is required'))
                    .oneOf([Yup.ref('password')], t('validation.passwords_must_match', 'Passwords must match')),
            otherwise: (schema) => schema.nullable(),
        }),
    });

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            avatar: null as File | null,
            remove_avatar: false,
            password: '',
            password_confirmation: '',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const payload: Record<string, any> = {
                name: values.name.trim(),
                email: values.email.trim(),
                phone: values.phone ? values.phone.trim() : null,
            };

            if (values.avatar) {
                payload.avatar = values.avatar;
            }

            if (values.remove_avatar) {
                payload.remove_avatar = 1;
            }

            if (values.password) {
                payload.password = values.password;
                payload.password_confirmation = values.password_confirmation;
            }

            router.post('/auth/profile', payload, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success(t('profile.updated_success', 'Profile updated successfully!'));
                    formik.setFieldValue('password', '');
                    formik.setFieldValue('password_confirmation', '');
                    formik.setFieldValue('avatar', null);
                    formik.setFieldValue('remove_avatar', false);
                },
                onError: (errors) => {
                    const errorMsg = Object.values(errors)[0] as string;
                    toast.error(errorMsg || t('common.error', 'Failed to update profile'));
                },
                onFinish: () => setSubmitting(false),
            });
        },
    });

    const handleAvatarChange = (file: File | null) => {
        formik.setFieldValue('avatar', file);
        if (file) {
            formik.setFieldValue('remove_avatar', false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(user?.avatar || null);
        }
    };

    const handleRemoveCurrentAvatar = () => {
        formik.setFieldValue('avatar', null);
        formik.setFieldValue('remove_avatar', true);
        setAvatarPreview(null);
    };

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6 w-full">
            {/* Header User Summary Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent dark:from-primary/10" />
                <CardContent className="relative px-6 pb-6 pt-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
                        <div className="flex items-end gap-4">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-md bg-primary/10 text-primary text-xl font-bold">
                                {avatarPreview ? (
                                    <AvatarImage src={avatarPreview} alt={formik.values.name} className="object-cover" />
                                ) : null}
                                <AvatarFallback>{getInitials(formik.values.name)}</AvatarFallback>
                            </Avatar>
                            <div className="mb-2">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formik.values.name || t('profile.title', 'User Profile')}
                                    </h2>
                                    {user?.role && (
                                        <Badge variant="outline" className="text-xs">
                                            {typeof user.role === 'object' && 'name' in user.role ? (user.role as any).name : String(user.role)}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formik.values.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="gap-2 w-full sm:w-auto shrink-0"
                            >
                                <Save className="h-4 w-4" />
                                {formik.isSubmitting
                                    ? t('profile.saving', 'Saving...')
                                    : t('profile.save_changes', 'Save Changes')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Avatar Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-6 space-y-4">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Camera className="h-4 w-4 text-primary" />
                                {t('profile.avatar', 'Profile Photo')}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('profile.avatar_desc', 'Upload a high-resolution photo. Formats: JPG, PNG, WEBP up to 5MB.')}
                            </p>
                        </div>
                        {user?.avatar && !formik.values.remove_avatar && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveCurrentAvatar}
                                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                {t('profile.remove_avatar', 'Remove Photo')}
                            </Button>
                        )}
                    </div>

                    <div className="max-w-md">
                        <ImagePicker
                            id="avatar"
                            label={t('profile.avatar', 'Profile Photo')}
                            initialPreview={avatarPreview}
                            onChange={handleAvatarChange}
                            error={formik.touched.avatar && formik.errors.avatar ? (formik.errors.avatar as string) : undefined}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Basic Information Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-6 space-y-4">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-primary" />
                            {t('profile.basic_info', 'Basic Information')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('profile.basic_info_desc', 'Update your personal name, email address, and phone number.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5 md:col-span-2">
                            <Label htmlFor="name" className="text-xs font-semibold">
                                {t('profile.full_name', 'Full Name')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={t('profile.full_name_placeholder', 'Enter your full name')}
                            />
                            {formik.touched.name && formik.errors.name && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold">
                                {t('profile.email', 'Email Address')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="user@example.com"
                                    className={isRtl ? 'pr-9' : 'pl-9'}
                                />
                            </div>
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold">
                                {t('profile.phone', 'Phone Number')}
                            </Label>
                            <div className="relative">
                                <Phone className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="+20 100 000 0000"
                                    className={isRtl ? 'pr-9' : 'pl-9'}
                                />
                            </div>
                            {formik.touched.phone && formik.errors.phone && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.phone}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security & Password Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-xs">
                <CardContent className="p-6 space-y-4">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            {t('profile.security', 'Security & Password')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('profile.password_help', 'Leave blank if you do not want to change your password.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* New Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold">
                                {t('profile.new_password', 'New Password')}
                            </Label>
                            <div className="relative">
                                <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={t('profile.password_placeholder', 'Leave blank to keep current')}
                                    className={isRtl ? 'pr-9' : 'pl-9'}
                                />
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                {t('profile.confirm_password', 'Confirm New Password')}
                            </Label>
                            <div className="relative">
                                <Lock className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    value={formik.values.password_confirmation}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={t('profile.password_placeholder', 'Leave blank to keep current')}
                                    className={isRtl ? 'pr-9' : 'pl-9'}
                                />
                            </div>
                            {formik.touched.password_confirmation && formik.errors.password_confirmation && (
                                <p className="text-xs text-red-500 mt-1">{formik.errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="gap-2 min-w-[140px]"
                >
                    <Save className="h-4 w-4" />
                    {formik.isSubmitting
                        ? t('profile.saving', 'Saving...')
                        : t('profile.save_changes', 'Save Changes')}
                </Button>
            </div>
        </form>
    );
}
