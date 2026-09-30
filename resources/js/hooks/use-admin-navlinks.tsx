import React from 'react'
import useImport from './use-import';
import { Building2, LayoutDashboard, Settings, Stethoscope,Map } from 'lucide-react';

export default function useAdminNavLinks() {
    const { t } = useImport()
    const NAV_ITEMS = [
        { key: t('admin.sidebar.overview'), href: '/admin/dashboard', icon: LayoutDashboard },
        { key: t('admin.sidebar.clinics'), href: '/admin/clinics', icon: LayoutDashboard },
        { key: t('admin.sidebar.clinic_types'), href: '/admin/clinic-types', icon: Building2 },
        { key: t('admin.sidebar.specialties'), href: '/admin/specialties/page', icon: Stethoscope },
        { key: t('admin.sidebar.roles'), href: '/admin/roles/page', icon: LayoutDashboard },
        { key: t('admin.sidebar.countries'), href: '/admin/countries/page', icon: Map },
        { key: t('admin.sidebar.governorates'), href: '/admin/governorates/page', icon: Map },
        { key: t('admin.sidebar.cities'), href: '/admin/cities/page', icon: Map },
        { key: t('admin.sidebar.settings'), href: '/admin/website-settings', icon: Settings },
    ];
    return {
        NAV_ITEMS
    }
}
