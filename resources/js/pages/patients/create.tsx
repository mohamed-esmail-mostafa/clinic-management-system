import React from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import useAuthClinics from '@/hooks/use-auth-clinics';
import useImport from '@/hooks/use-import';
import { PatientField } from '@/types/patient';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import PatientForm from './components/patient-form';
import BackBtn from '@/components/shared/back-btn';

interface CreateProps {
    clinic?: any;
    custom_fields?: PatientField[];
}

export default function Create({ clinic: serverClinic, custom_fields = [] }: CreateProps) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    return (
        <ClinicLayout title={t('patients.add_new', 'Add New Patient')}>
            <div className="space-y-6">
                <PageHeader
                    icon={<UserPlus className="h-7 w-7 text-primary" />}
                    title={t('patients.add_new')}
                    // subtitle={t('patients.add_desc', 'Fill in patient personal details, contact info, and clinic specific fields.')}
                >
                   
                    <BackBtn />
                </PageHeader>

                <PatientForm clinic={serverClinic} custom_fields={custom_fields} />
            </div>
        </ClinicLayout>
    );
}
