import useAuthClinics from '@/hooks/use-auth-clinics';
import ClinicLayout from '@/layouts/clinic-layout';
import React, { useState, useMemo } from 'react';
import { Visit, VisitField, VisitFormValues, VisitMedication } from '@/types/visit';
import { Patient } from '@/types/patient';
import { Medication } from '@/types/medication';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { router, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import useImport from '@/hooks/use-import';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Icons
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Stethoscope,
    Calendar,
    Clock,
    Pill,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    FileText,
    AlertCircle,
    User,
    Activity,
    PlusCircle,
    X,
    Share2,
} from 'lucide-react';
import PageHeader from '@/components/shared/page-header';
import InputError from '@/components/input-error';
import VisitDialog from './components/visit-dialog';
import VisitsTable from './components/visits-table';
import VisitsStats from './components/visits-stats';
import VisitsFilterSearch from './components/visits-filter-search';

interface Props {
    clinic?: any;
    patient: Patient;
    visits?: Visit[];
    medications?: Medication[];
    visit_fields?: VisitField[];
    custom_fields?: VisitField[];
}

export default function PatientVisitsPage({
    clinic: serverClinic,
    patient,
    visits = [],
    medications = [],
    visit_fields = [],
    custom_fields = [],
}: Props) {
    const { t, isRtl } = useImport();
    const { clinics } = useAuthClinics() as { clinics?: any[] };
    const allVisitFields = visit_fields.length > 0 ? visit_fields : custom_fields;

    // Clinic slug
    const clinicSlug = serverClinic?.slug || (Array.isArray(clinics) && clinics.length > 0 ? clinics[0].slug : '');

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);


    // Dynamic Prescription state for form
    const [prescriptions, setPrescriptions] = useState<
        Array<{ medication_id?: number | null; medication_name: string }>
    >([]);

    // Filter visits
    const filteredVisits = useMemo(() => {
        return visits.filter((visit) => {
            const type = (visit.type || '').toLowerCase();
            const date = (visit.visited_at || '').toLowerCase();
            const medsNames = (visit.visit_medications || [])
                .map((m) => m.medication_name)
                .join(' ')
                .toLowerCase();
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch = !search || type.includes(search) || date.includes(search) || medsNames.includes(search);
            const matchesType = typeFilter === 'all' || visit.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [visits, searchTerm, typeFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = visits.length;
        const examinations = visits.filter((v) => v.type === 'examination').length;
        const followUps = visits.filter((v) => v.type === 'follow_up').length;
        const lastVisitDate = visits.length > 0 ? visits[0].visited_at : null;

        return { total, examinations, followUps, lastVisitDate };
    }, [visits]);




    const handleOpenAdd = () => {
        setEditingVisit(null);
        setPrescriptions([{ medication_id: null, medication_name: '' }]);
        setIsAddModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingVisit(null);
        setPrescriptions([]);
        // formik.resetForm();
    };



    const patientFullName = `${patient.first_name || ''} ${patient.last_name || ''}`.trim();

    return (
        <ClinicLayout title={`${t('visits.title', 'Visits')} - ${patientFullName}`}>
            <div className="space-y-6">


                <PageHeader icon={<Stethoscope className="h-7 w-7 text-primary" />} title={`${patientFullName} - ${patient.patient_number}`}
                    subtitle={t('visits.subtitle')}
                >
                    <div className='flex gap-4 items-center'>
                        <Link
                            href={`/clinic/${clinicSlug}/patients`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-primary hover:underline mb-2"
                        >
                            {isRtl ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                            {t('visits.back_to_patients', 'Back to Patients')}
                        </Link>

                        <Button
                            onClick={handleOpenAdd}

                        >
                            <Plus className="h-4 w-4" />
                            {t('visits.add_new', 'Add New Visit')}
                        </Button>
                    </div>
                </PageHeader>

                <VisitsStats stats={stats} />



                <VisitsFilterSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter} />


                <VisitsTable
                    filteredVisits={filteredVisits}
                    handleOpenAdd={handleOpenAdd}
                    setPrescriptions={setPrescriptions}
                    setIsAddModalOpen={setIsAddModalOpen}
                    setEditingVisit={setEditingVisit}
                    patient={patient}
                    visit_fields={allVisitFields}
                />
            </div>


            <VisitDialog
                isAddModalOpen={isAddModalOpen}
                handleCloseModal={handleCloseModal}
                editingVisit={editingVisit}
                patient={patient}
                medications={medications}
                visit_fields={allVisitFields}
            />


        </ClinicLayout>
    );
}
