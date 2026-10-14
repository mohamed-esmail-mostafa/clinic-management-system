import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/use-auth';
import useImport from '@/hooks/use-import';
import { Store, DatabaseIcon } from 'lucide-react';

export default function MobileHomeAction() {
    const { auth } = useAuth();
    const { t } = useImport();

    const user = auth?.user;
    const role = user?.role?.slug;

    const dashboardUrl =
        role === 'admin'
            ? '/admin/website-settings'
            : ['doctor', 'nurse', 'receptionist'].includes(role ?? '')
                ? '/clinic/overview'
                : null;


    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-lg md:hidden">
            {user ? (
                dashboardUrl ? (
                    <Button
                        className="w-full"
                        onClick={() => router.visit(dashboardUrl)}
                    >
                        <DatabaseIcon className="mr-2 h-4 w-4" />
                       {t('common.continue-to-dashboard')}
                    </Button>
                ) : (
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => router.visit('/')}
                    >
                        <Store className="mr-2 h-4 w-4" />
                        {t('common.welcome')}، {user.name}
                    </Button>
                )
            ) : (
                <Button
                    className="w-full"
                    onClick={() => router.get('/login')}
                >
                    {t('auth.login')}
                </Button>
            )}
        </div>
    );
}