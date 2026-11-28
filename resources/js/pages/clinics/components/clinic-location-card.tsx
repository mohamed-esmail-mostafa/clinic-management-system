import { FormikProps } from 'formik';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useImport from '@/hooks/use-import';
import { City } from '@/types/city';
import { ClinicFormValues } from '@/types/clinic';
import { Country } from '@/types/country';
import { Governorate } from '@/types/governorate';

interface ClinicLocationCardProps {
    formik: FormikProps<ClinicFormValues>;
    countries: Country[];
    governorates: Governorate[];
    cities: City[];
    onCountryChange: (val: string) => void;
    onGovernorateChange: (val: string) => void;
    onCityChange: (val: string) => void;
}

export default function ClinicLocationCard({
    formik,
    countries,
    governorates,
    cities,
    onCountryChange,
    onGovernorateChange,
    onCityChange,
}: ClinicLocationCardProps) {
    const { isRtl, tClinic } = useImport();

    return (
        <Card className="border-gray-100 dark:border-gray-800 shadow-xs">
            <CardContent className="p-6 space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        <MapPin size={16} />
                    </span>
                    <span>{tClinic('location_details')}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Country */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {tClinic('country')}
                        </Label>
                        <Select
                            value={String(formik.values.country_id || '')}
                            onValueChange={onCountryChange}
                        >
                            <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-800">
                                <SelectValue
                                    placeholder={tClinic('select_country')}
                                />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                {countries.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {isRtl ? c.name_ar : c.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Governorate */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {tClinic('governorate')}
                        </Label>
                        <Select
                            value={String(formik.values.governorate_id || '')}
                            onValueChange={onGovernorateChange}
                        >
                            <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-800">
                                <SelectValue
                                    placeholder={tClinic('select_governorate')}
                                />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                {governorates.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
                                        {isRtl ? g.name_ar : g.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {tClinic('city')}
                        </Label>
                        <Select
                            value={String(formik.values.city_id || '')}
                            onValueChange={onCityChange}
                        >
                            <SelectTrigger className="w-full rounded-xl border-gray-200 dark:border-gray-800">
                                <SelectValue
                                    placeholder={tClinic('select_city')}
                                />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                {cities.map((ct) => (
                                    <SelectItem
                                        key={ct.id}
                                        value={String(ct.id)}
                                    >
                                        {isRtl ? ct.name_ar : ct.name_en}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
