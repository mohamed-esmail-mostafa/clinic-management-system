import React from 'react'
import useAuthClinics from './use-auth-clinics';
import useImport from './use-import';
import { Calendar, LayoutDashboard, Phone, Pill, Timer, User, Users } from 'lucide-react';

export default function useClinicNavlinks() {
    const { t } = useImport()
    const { authClinic } = useAuthClinics()
    const NAV_ITEMS = [
        { key: t('clinics.sidebar.overview'), href: '/clinic/overview', icon: LayoutDashboard },
        { key: t('clinics.sidebar.patients'), href: `/clinic/${authClinic?.slug}/patients`, icon: Users },
        { key: t('clinics.sidebar.patients-settings'), href: `/clinic/settings/${authClinic?.slug}/patients`, icon: Users },
        { key: t('clinics.sidebar.bookings'), href: `/clinic/${authClinic?.slug}/booking`, icon: Calendar },
        { key: t('clinics.sidebar.today_bookings'), href: `/clinic/${authClinic?.slug}/today/booking`, icon: Calendar },
        { key: t('clinics.sidebar.medicines'), href: `/clinic/${authClinic?.slug}/medications`, icon: Pill },
        { key: t('clinics.sidebar.phones'), href: `/clinic/${authClinic?.slug}/phones/page`, icon: Phone },
        { key: t('clinics.sidebar.working-hours'), href: `/clinic/${authClinic?.slug}/working/hours`, icon: Timer },
        { key: t('clinics.sidebar.profile'), href: '/auth/profile', icon: User },
    ];
    return {
        NAV_ITEMS
    }
}
