import PageHeader from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/layouts/admin-layout'
import { Link } from '@inertiajs/react'
import React from 'react'

export default function clinicsPage() {
  return (
   <AdminLayout>
    <PageHeader title='clic'>
      <Button>
        <Link>Add New Clinck</Link>
      </Button>
    </PageHeader>
   </AdminLayout>
  )
}
