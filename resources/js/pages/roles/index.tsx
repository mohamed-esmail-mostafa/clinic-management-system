import InputError from '@/components/input-error'
import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useImport from '@/hooks/use-import'
import AdminLayout from '@/layouts/admin-layout'
import { Role } from '@/types/role'
import { router } from '@inertiajs/react'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useFormik } from 'formik'
import { Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'


export default function rolesPage({ roles }: { roles: Role[] }) {
    const { t } = useImport()
    const [openDialog, setOpenDialog] = useState(false)
    const formik = useFormik({
        initialValues:{
            name:''
        },
        onSubmit: async (values)=>{
           router.post("/admin/roles/store",values,{
            onSuccess:()=>{
                toast.success(t("roles.added"))
                formik.resetForm()
                setOpenDialog(false)
            },
            onError:()=>{
                toast.error(t("roles.failed-to-add"))
            }
           })
        }
    })

    return (
        <AdminLayout>
            <PageHeader>
                <Button onClick={()=>setOpenDialog(true)}>{t('roles.add-role')}</Button>
            </PageHeader>
            {roles.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {roles.map((role: Role) => (
                        <div className='bg-white border p-2'>
                            <h2>{role.name}</h2>
                            <h2>{role.slug}</h2>
                            <div>
                                <Button variant="ghost"><Edit2 /></Button>
                                <Button variant="destructive"><Trash2 /></Button>
                            </div>
                        </div>
                    ))}

                </div>

            ) : (<div></div>)}


            <Dialog open={openDialog }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle></DialogTitle>
                    </DialogHeader>
                    <div>
                        <div>
                            <Label>{t('roles.label')}</Label>
                            <Input name='name' value={formik.values.name} onChange={formik.handleChange} />
                            <InputError message={formik.errors.name} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="destructive" onClick={()=>setOpenDialog(false)}>{t('common.close')}</Button>
                        <Button type='submit' onClick={()=>formik.handleSubmit()}>{t('common.save')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
