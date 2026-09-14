import React from 'react';
import ClinicLayout from '@/layouts/clinic-layout';
import useAuthClinics from '@/hooks/use-auth-clinics';
import useImport from '@/hooks/use-import';
import { Patient, PatientField } from '@/types/patient';
import { UserCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import PatientForm from './components/patient-form';
import BackBtn from '@/components/shared/back-btn';

interface UpdateProps {
    clinic?: any;
    patient: Patient;
    custom_fields?: PatientField[];
}

export default function Update({ clinic: serverClinic, patient, custom_fields = [] }: UpdateProps) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };

    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');
    const fullName = `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim();

    return (
        <ClinicLayout title={`${t('patients.edit', 'Edit Patient')} - ${fullName}`}>
            <div className="space-y-6">
                <PageHeader
                    icon={<UserCheck className="h-7 w-7 text-primary" />}
                    title={`${t('patients.edit', 'Edit Patient')}: ${fullName}`}
                    
                >
                    <BackBtn />
                </PageHeader>

                <PatientForm clinic={serverClinic} patient={patient} custom_fields={custom_fields} />
            </div>
        </ClinicLayout>
    );
}
