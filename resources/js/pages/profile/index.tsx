import React from 'react';
import { usePage } from '@inertiajs/react';
import ClinicLayout from '@/layouts/clinic-layout';
import PageHeader from '@/components/shared/page-header';
import UserForm from './components/user-form';
import { User } from '@/types/auth';
import useImport from '@/hooks/use-import';
import { User as UserIcon } from 'lucide-react';

interface Props {
    user?: User;
}

export default function ProfilePage({ user: propUser }: Props) {
    const { t } = useImport();
    const { auth } = usePage().props as { auth?: { user?: User } };

    const currentUser = propUser || auth?.user;

    return (
        <ClinicLayout title={t('profile.title', 'Profile Settings')}>
            <div className="space-y-6">
                <PageHeader
                    icon={<UserIcon className="h-7 w-7 text-primary" />}
                    title={t('profile.title', 'Profile Settings')}
                    subtitle={t(
                        'profile.subtitle',
                        'Manage your personal information, profile photo, and password.'
                    )}
                />

                <div className='flex justify-center items-center'>
                    <UserForm user={currentUser} />
                    
                </div>
            </div>
        </ClinicLayout>
    );
}
