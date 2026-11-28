import React from 'react'
import useAuthClinics from './use-auth-clinics';
import useImport from './use-import';
import { Calendar, Edit, LayoutDashboard, Phone, Pill, Plus, Settings2Icon, Timer, User, Users } from 'lucide-react';

export default function useClinicNavlinks() {
    const { tClinic } = useImport()
    const { authClinic } = useAuthClinics()
    const NAV_ITEMS = [
        { key: tClinic('sidebar.overview'), href: '/clinic/overview', icon: LayoutDashboard },
        { key: tClinic('sidebar.patients'), href: `/clinic/${authClinic?.slug}/patients`, icon: Users },
        { key: tClinic('sidebar.patients-settings'), href: `/clinic/settings/${authClinic?.slug}/patients`, icon: Users },
        { key: tClinic('sidebar.visit-settings'), href: `/clinic/settings/${authClinic?.slug}/visits`, icon: Settings2Icon },
        { key: tClinic('sidebar.bookings'), href: `/clinic/${authClinic?.slug}/booking`, icon: Calendar },
        { key: tClinic('sidebar.today_bookings'), href: `/clinic/${authClinic?.slug}/today/booking`, icon: Calendar },
        { key: tClinic('sidebar.medicines'), href: `/clinic/${authClinic?.slug}/medications`, icon: Pill },
        { key: tClinic('sidebar.phones'), href: `/clinic/${authClinic?.slug}/phones/page`, icon: Phone },
        { key: tClinic('sidebar.working-hours'), href: `/clinic/${authClinic?.slug}/working/hours`, icon: Timer },
        { key: tClinic('sidebar.employees'), href: `/clinic/${authClinic?.slug}/employees`, icon: Users },
        { key: tClinic('sidebar.profile'), href: '/auth/profile', icon: User },
        { key: tClinic('sidebar.clinic-edit'), href: `/clinic/${authClinic?.slug}/update`, icon: Edit },
    ];
    return {
        NAV_ITEMS
    }
}
