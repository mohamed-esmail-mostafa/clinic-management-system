import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookDashedIcon, DatabaseIcon, LogOut, Store as StoreIcon, User } from 'lucide-react';
import { Button } from '../ui/button';
import useImport from '@/hooks/use-import';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import useAuth from '@/hooks/use-auth';

export default function AuthMenu() {
    const { auth } = useAuth()
    const { t } = useImport();
    const cleanup = useMobileNavigation();
    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };
const role = auth?.user?.role?.slug
    return (
        <div>
            {auth?.user ? (<DropdownMenu>
                <DropdownMenuTrigger asChild>

                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={auth?.user?.avatar} alt={auth.user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {auth.user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium">{auth.user.name}</p>
                            <p className="w-50 truncate text-sm text-muted-foreground">
                                {auth.user.email}
                            </p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />






                    {auth?.user?.role?.slug === "admin" ? (
                        <DropdownMenuItem >

                            <Link href={"/admin/website-settings"} className='flex items-center'>
                                <DatabaseIcon className="mr-2 h-4 w-4" />
                                <span>{t('common.admin-dashboard')}</span>
                            </Link>
                        </DropdownMenuItem>
                    ) : null}


                    {auth?.user?.role?.slug === "doctor" || auth?.user?.role?.slug === "nurse" || auth?.user?.role?.slug === "receptionist" ? (
                        <DropdownMenuItem >

                            <Link href={"/clinic/overview"} className='flex items-center'>
                                <DatabaseIcon className="mr-2 h-4 w-4" />
                                <span>{t('common.clinic-dashboard')}</span>
                            </Link>
                        </DropdownMenuItem>
                    ) : null}



                    <DropdownMenuItem asChild>

                        <Link href={""}>
                            <User className="mr-2 h-4 w-4" />
                            <span>{t('auth.profile')}</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        {/* <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('auth.logout')}</span> */}
                        <Link
                            className=" w-full cursor-pointer  flex items-center"
                            href={logout()}
                            as="button"
                            onClick={handleLogout}
                            data-test="logout-button"
                        >
                            <LogOut className="mr-2" />
                            <span>{t('auth.logout')}</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>) : (<>
                <Button onClick={() => router.get('/login')}>{t('auth.login')}</Button>
            </>)}
        </div>
    )
}
