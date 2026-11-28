import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import useImport from '@/hooks/use-import';
import ClinicLayout from '@/layouts/clinic-layout';
import { City } from '@/types/city';
import { Clinic } from '@/types/clinic';
import { ClinicType } from '@/types/clinic-type';
import { Country } from '@/types/country';
import { Governorate } from '@/types/governorate';
import { Specialty } from '@/types/specialty';
import ClinicForm from './components/clinic-form';

interface UpdateClinicPageProps {
    clinic: Clinic;
    countries?: Country[];
    governorates?: Governorate[];
    cities?: City[];
    specialties?: Specialty[];
    clinic_types?: ClinicType[];
}

export default function UpdateClinicPage({
    clinic,
    countries = [],
    governorates = [],
    cities = [],
    specialties = [],
    clinic_types = [],
}: UpdateClinicPageProps) {
    const { isRtl, tClinic, tc } = useImport();

    return (
        <ClinicLayout title={tClinic('edit')}>
            <Head title={`${tClinic('edit')} - ${clinic.name}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/clinic/overview"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    >
                        {isRtl ? (
                            <ArrowRight size={16} />
                        ) : (
                            <ArrowLeft size={16} />
                        )}
                        <span>{tc('clinic-dashboard')}</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            {clinic.image ? (
                                <img
                                    src={clinic.image}
                                    alt={clinic.name}
                                    className="h-12 w-12 rounded-xl object-cover border border-gray-100 dark:border-gray-800 shrink-0"
                                />
                            ) : (
                                <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                                    <Building2 size={24} />
                                </div>
                            )}

                            <div className="min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {clinic.name}
                                    </h1>
                                    <span
                                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                            clinic.is_active
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {clinic.is_active
                                            ? tClinic('active')
                                            : tClinic('inactive')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {tClinic('edit_subtitle')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <ClinicForm
                    mode="update"
                    clinic={clinic}
                    countries={countries}
                    governorates={governorates}
                    cities={cities}
                    specialties={specialties}
                    clinicTypes={clinic_types}
                    cancelHref="/clinic/overview"
                />
            </div>
        </ClinicLayout>
    );
}
