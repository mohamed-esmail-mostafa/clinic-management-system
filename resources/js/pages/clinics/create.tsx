import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import useImport from '@/hooks/use-import';
import { City } from '@/types/city';
import { ClinicType } from '@/types/clinic-type';
import { Country } from '@/types/country';
import { Governorate } from '@/types/governorate';
import { Specialty } from '@/types/specialty';
import ClinicForm from './components/clinic-form';

interface CreateClinicPageProps {
    countries?: Country[];
    governorates?: Governorate[];
    cities?: City[];
    specialties?: Specialty[];
    clinic_types?: ClinicType[];
}

export default function CreateClinicPage({
    countries = [],
    governorates = [],
    cities = [],
    specialties = [],
    clinic_types = [],
}: CreateClinicPageProps) {
    const { isRtl, tClinic } = useImport();

    return (
        <div className="py-6 px-4 sm:px-6">
            <Head title={tClinic('create_title')} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/admin/clinics"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                    >
                        {isRtl ? (
                            <ArrowRight size={16} />
                        ) : (
                            <ArrowLeft size={16} />
                        )}
                        <span>{tClinic('title')}</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                            <Building2 size={24} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {tClinic('create_title')}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {tClinic('create_subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                <ClinicForm
                    mode="create"
                    countries={countries}
                    governorates={governorates}
                    cities={cities}
                    specialties={specialties}
                    clinicTypes={clinic_types}
                    cancelHref="/admin/clinics"
                />
            </div>
        </div>
    );
}
