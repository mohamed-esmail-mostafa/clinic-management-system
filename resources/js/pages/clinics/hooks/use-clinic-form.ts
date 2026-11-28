import { useMemo, useState } from 'react';
import { FormDataConvertible } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { useFormik } from 'formik';
import { toast } from 'sonner';
import * as Yup from 'yup';
import useImport from '@/hooks/use-import';
import { City } from '@/types/city';
import { Clinic, ClinicFormValues } from '@/types/clinic';
import { Governorate } from '@/types/governorate';

interface UseClinicFormOptions {
    mode: 'create' | 'update';
    clinic?: Clinic;
    governorates: Governorate[];
    cities: City[];
}

export function useClinicForm({
    mode,
    clinic,
    governorates,
    cities,
}: UseClinicFormOptions) {
    const { tc, tClinic } = useImport();

    const [selectedCountryId, setSelectedCountryId] = useState<string>(
        clinic?.country_id ? String(clinic.country_id) : '',
    );
    const [selectedGovId, setSelectedGovId] = useState<string>(
        clinic?.governorate_id ? String(clinic.governorate_id) : '',
    );

    const filteredGovernorates = useMemo(
        () =>
            selectedCountryId
                ? governorates.filter(
                    (g) => String(g.country_id) === selectedCountryId,
                )
                : governorates,
        [governorates, selectedCountryId],
    );

    const filteredCities = useMemo(
        () =>
            selectedGovId
                ? cities.filter(
                    (c) => String(c.governorate_id) === selectedGovId,
                )
                : cities,
        [cities, selectedGovId],
    );

    const validationSchema = useMemo(
        () =>
            Yup.object({
                name: Yup.string().trim().required(tc('required')),
                clinic_type_id: Yup.mixed().nullable(),
                image: Yup.mixed().nullable(),
                phone: Yup.string().nullable(),
                address: Yup.string().nullable(),
                description: Yup.string().nullable(),
                country_id: Yup.mixed().nullable(),
                governorate_id: Yup.mixed().nullable(),
                city_id: Yup.mixed().nullable(),
                specialty_ids: Yup.array().of(Yup.number()),
                is_active: Yup.boolean(),
            }),
        [tc],
    );

    const formik = useFormik<ClinicFormValues>({
        enableReinitialize: mode === 'update',
        initialValues: {
            name: clinic?.name ?? '',
            clinic_type_id: clinic?.clinic_type_id
                ? String(clinic.clinic_type_id)
                : '',
            image: clinic?.image ?? null,
            country_id: clinic?.country_id ? String(clinic.country_id) : '',
            governorate_id: clinic?.governorate_id
                ? String(clinic.governorate_id)
                : '',
            city_id: clinic?.city_id ? String(clinic.city_id) : '',
            phone: clinic?.phone ?? '',
            address: clinic?.address ?? '',
            description: clinic?.description ?? '',
            specialty_ids: clinic?.specialties?.map((s) => s.id) ?? [],
            is_active: clinic?.is_active ?? true,
        },
        validationSchema,
        onSubmit: (values, { setSubmitting }) => {
            const payload: Record<string, FormDataConvertible> = {
                name: values.name.trim(),
                clinic_type_id: values.clinic_type_id
                    ? Number(values.clinic_type_id)
                    : null,
                country_id: values.country_id ? Number(values.country_id) : null,
                governorate_id: values.governorate_id
                    ? Number(values.governorate_id)
                    : null,
                city_id: values.city_id ? Number(values.city_id) : null,
                phone: values.phone || null,
                address: values.address || null,
                description: values.description || null,
                specialty_ids: values.specialty_ids,
                is_active: values.is_active ? 1 : 0,
            };

            if (values.image instanceof File) {
                payload.image = values.image;
            }

            if (mode === 'update' && clinic) {
                router.post(
                    `/admin/clinics/${clinic.id}`,
                    { ...payload, _method: 'put' },
                    {
                        forceFormData: true,
                        onSuccess: () => {
                            toast.success(tClinic('updated_success'));
                        },
                        onError: (errors) => {
                            toast.error(
                                (Object.values(errors)[0] as string) ||
                                tc('error'),
                            );
                        },
                        onFinish: () => setSubmitting(false),
                    },
                );
                return;
            }

            router.post('/store/clinic', payload, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success(tClinic('created_success'));
                },
                onError: (errors) => {
                    toast.error(
                        (Object.values(errors)[0] as string) || tc('error'),
                    );
                },
                onFinish: () => setSubmitting(false),
            });
        },
    });

    const handleCountryChange = (val: string) => {
        formik.setFieldValue('country_id', val);
        setSelectedCountryId(val);
        formik.setFieldValue('governorate_id', '');
        formik.setFieldValue('city_id', '');
        setSelectedGovId('');
    };

    const handleGovernorateChange = (val: string) => {
        formik.setFieldValue('governorate_id', val);
        setSelectedGovId(val);
        formik.setFieldValue('city_id', '');
    };

    const handleCityChange = (val: string) => {
        formik.setFieldValue('city_id', val);
    };

    const toggleSpecialty = (specialtyId: number) => {
        const currentIds = [...formik.values.specialty_ids];
        const index = currentIds.indexOf(specialtyId);
        if (index > -1) {
            currentIds.splice(index, 1);
        } else {
            currentIds.push(specialtyId);
        }
        formik.setFieldValue('specialty_ids', currentIds);
    };

    return {
        formik,
        filteredGovernorates,
        filteredCities,
        handleCountryChange,
        handleGovernorateChange,
        handleCityChange,
        toggleSpecialty,
    };
}
