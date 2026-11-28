import { Link } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useImport from '@/hooks/use-import';
import { City } from '@/types/city';
import { Clinic } from '@/types/clinic';
import { ClinicType } from '@/types/clinic-type';
import { Country } from '@/types/country';
import { Governorate } from '@/types/governorate';
import { Specialty } from '@/types/specialty';
import { useClinicForm } from '../hooks/use-clinic-form';
import ClinicBasicInfoCard from './clinic-basic-info-card';
import ClinicLocationCard from './clinic-location-card';
import ClinicSpecialtiesCard from './clinic-specialties-card';

interface ClinicFormProps {
    mode: 'create' | 'update';
    clinic?: Clinic;
    countries?: Country[];
    governorates?: Governorate[];
    cities?: City[];
    specialties?: Specialty[];
    clinicTypes?: ClinicType[];
    cancelHref: string;
}

export default function ClinicForm({
    mode,
    clinic,
    countries = [],
    governorates = [],
    cities = [],
    specialties = [],
    clinicTypes = [],
    cancelHref,
}: ClinicFormProps) {
    const { tc } = useImport();

    const {
        formik,
        filteredGovernorates,
        filteredCities,
        handleCountryChange,
        handleGovernorateChange,
        handleCityChange,
        toggleSpecialty,
    } = useClinicForm({
        mode,
        clinic,
        governorates,
        cities,
    });

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
            <ClinicBasicInfoCard
                formik={formik}
                clinicTypes={clinicTypes}
                initialImage={clinic?.image ?? null}
                showStatusToggle={mode === 'update'}
            />

            <ClinicLocationCard
                formik={formik}
                countries={countries}
                governorates={filteredGovernorates}
                cities={filteredCities}
                onCountryChange={handleCountryChange}
                onGovernorateChange={handleGovernorateChange}
                onCityChange={handleCityChange}
            />

            <ClinicSpecialtiesCard
                specialties={specialties}
                selectedIds={formik.values.specialty_ids}
                onToggle={toggleSpecialty}
            />

            <div className="flex items-center justify-end gap-3 pt-2 pb-6">
                <Link href={cancelHref}>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-gray-200 dark:border-gray-800"
                    >
                        {tc('cancel')}
                    </Button>
                </Link>

                <Button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="rounded-xl min-w-[130px] gap-2"
                >
                    {formik.isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>{tc('processing')}</span>
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            <span>
                                {mode === 'update'
                                    ? tc('save_changes')
                                    : tc('save')}
                            </span>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
