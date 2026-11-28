import { FormikProps } from 'formik';
import { Building2, Phone, MapPin as AddressPin, FileText } from 'lucide-react';
import InputError from '@/components/input-error';
import { Card, CardContent } from '@/components/ui/card';
import ImagePicker from '@/components/ui/image-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useImport from '@/hooks/use-import';
import { ClinicFormValues } from '@/types/clinic';
import { ClinicType } from '@/types/clinic-type';

interface ClinicBasicInfoCardProps {
    formik: FormikProps<ClinicFormValues>;
    clinicTypes: ClinicType[];
    initialImage?: string | null;
    showStatusToggle?: boolean;
}

export default function ClinicBasicInfoCard({
    formik,
    clinicTypes,
    initialImage = null,
    showStatusToggle = false,
}: ClinicBasicInfoCardProps) {
    const { isRtl, tClinic } = useImport();

    return (
        <Card className="border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
            <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Building2 size={16} />
                        </span>
                        <span>{tClinic('basic_info')}</span>
                    </h2>

                    {showStatusToggle && (
                        <div className="flex items-center gap-2.5">
                            <span
                                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                    formik.values.is_active
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                            >
                                {formik.values.is_active
                                    ? tClinic('active')
                                    : tClinic('inactive')}
                            </span>
                            <Switch
                                id="is_active"
                                checked={Boolean(formik.values.is_active)}
                                onCheckedChange={(checked) =>
                                    formik.setFieldValue('is_active', checked)
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Clinic Image */}
                    <div className="space-y-1.5 md:col-span-2">
                        <ImagePicker
                            id="image"
                            label={tClinic('image')}
                            initialPreview={initialImage}
                            onChange={(file) =>
                                formik.setFieldValue('image', file)
                            }
                            error={
                                formik.touched.image && formik.errors.image
                                    ? (formik.errors.image as string)
                                    : undefined
                            }
                        />
                    </div>

                    {/* Clinic Name */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="name"
                            className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                        >
                            {tClinic('name')}{' '}
                            <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder={tClinic('name_placeholder')}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="rounded-xl border-gray-200 dark:border-gray-800"
                        />
                        {formik.touched.name && formik.errors.name && (
                            <InputError message={formik.errors.name} />
                        )}
                    </div>

                    {/* Clinic Type */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {tClinic('type')}
                        </Label>
                        <Select
                            value={String(formik.values.clinic_type_id || '')}
                            onValueChange={(val) =>
                                formik.setFieldValue('clinic_type_id', val)
                            }
                        >
                            <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-800">
                                <SelectValue
                                    placeholder={tClinic('select_clinic_type')}
                                />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                {clinicTypes.map((ct) => (
                                    <SelectItem
                                        key={ct.id}
                                        value={String(ct.id)}
                                    >
                                        {isRtl ? ct.title_ar : ct.title_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="phone"
                            className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                        >
                            <Phone size={12} className="text-gray-400" />
                            <span>{tClinic('phone')}</span>
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder={tClinic('phone_placeholder')}
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="rounded-xl border-gray-200 dark:border-gray-800"
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="address"
                            className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                        >
                            <AddressPin size={12} className="text-gray-400" />
                            <span>{tClinic('address')}</span>
                        </Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder={tClinic('address_placeholder')}
                            value={formik.values.address}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="rounded-xl border-gray-200 dark:border-gray-800"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 md:col-span-2">
                        <Label
                            htmlFor="description"
                            className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
                        >
                            <FileText size={12} className="text-gray-400" />
                            <span>{tClinic('description')}</span>
                        </Label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder={tClinic('description_placeholder')}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
