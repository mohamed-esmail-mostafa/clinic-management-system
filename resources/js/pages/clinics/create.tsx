import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Country } from '@/types/country';


export default function create({countries}:{countries:Country[]}) {

    console.log(countries)
    const { t } = useTranslation()
    const validationSchema = Yup.object({
        name: Yup.string().required(t('common.required', 'Required')),
        description: Yup.string().nullable(),
        address: Yup.string().nullable(),
        phone: Yup.string().nullable(),
    });

    // Formik Form
    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            phone: '',
            address: ''
        },
        validationSchema,

        onSubmit: async (values) => {
            router.post('/store/clinic',values,{
                onSuccess:()=>{
                    toast.success("succee")
                },
                onError:()=>{
                    toast.error("error")
                }
            })
        },
    });

    return (
        <div className='container mx-auto'>
            <div>
                <Label>name</Label>
                <Input name='name' value={formik.values.name} onChange={formik.handleChange} />
                <InputError message={formik.errors.name} />
            </div>


             <div>
                <Label>adress</Label>
                <Input name='address' value={formik.values.address} onChange={formik.handleChange} />
                <InputError message={formik.errors.address} />
            </div>
             <div>
                <Label>phone</Label>
                <Input name='phone' value={formik.values.phone} onChange={formik.handleChange} />
                <InputError message={formik.errors.phone} />
            </div>

            <Button type='submit' onClick={()=>formik.handleSubmit()}>
                submit
            </Button>

        </div>
    )
}
