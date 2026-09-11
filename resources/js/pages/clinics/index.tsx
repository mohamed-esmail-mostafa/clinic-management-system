import InputError from '@/components/input-error'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem,SelectTrigger } from '@/components/ui/select'
import useImport from '@/hooks/use-import'
import AdminLayout from '@/layouts/admin-layout'
import { Clinic } from '@/types/clinic'
import { Country } from '@/types/country'
import { Link, router } from '@inertiajs/react'

import { useFormik } from 'formik'
import { toast } from 'sonner'


export default function clinicsPage({ clinics, countries }: { clinics: Clinic[],countries:Country[]  }) {
  const { t } = useImport()
  console.log(countries)
  const formik = useFormik({
    initialValues: {
      name: '',
      type: '',
      phone: '',
      address: '',
      description: ''
    },
    onSubmit: async(values) => { 
      router.post('/store/clinic',values,{
        onSuccess:()=>{
          toast.success(t('common.success'))
        },
        onError:()=>{
          toast.error(t('common.error'))
        },
      })
    }
  })
  return (
    <AdminLayout>
      <PageHeader title='clic'>
        <Dialog>
          <DialogTrigger >
            <Button>
              {t('clinics.add-new')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('clinics.add-new')}</DialogTitle>
            </DialogHeader>
            <div>
              <div>
                <Label>{t('clinics.name')}</Label>
                <Input name='name' value={formik.values.name} onChange={formik.handleChange} />
                <InputError message={formik.errors.name} />
              </div>
              <div>
                <Label>{t('clinics.phone')}</Label>
                <Input name='phone' value={formik.values.phone} onChange={formik.handleChange} />
                <InputError message={formik.errors.phone} />
              </div>
              <div>
                <Label>{t('clinics.address')}</Label>
                <Input name='address' value={formik.values.address} onChange={formik.handleChange} />
                <InputError message={formik.errors.address} />
              </div>

              <div>
                <Label>{t('clinics.description')}</Label>
                <Input name='description' value={formik.values.description} onChange={formik.handleChange} />
                <InputError message={formik.errors.description} />
              </div>
              <div>
                <Label>{t('clinics.type')}</Label>
                <Select value={formik.values.type} onValueChange={(value)=> formik.setFieldValue('type',value)}>
                  <SelectTrigger>sdf</SelectTrigger>
                  <SelectContent>
                    <SelectItem value='personal'>persona</SelectItem>
                   <SelectItem value='medical_center'>medical_center</SelectItem>
                  </SelectContent>
                </Select>
                <InputError message={formik.errors.description} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="default" onClick={() => formik.handleSubmit()}>{t('common.save')}</Button>
              <Button variant="destructive" onClick={() => { }}>{t('common.cancel')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>
    </AdminLayout>
  )
}
