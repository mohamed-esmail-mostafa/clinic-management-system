import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import useImport from '@/hooks/use-import';
import { Mail, Lock, LogIn } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { t } = useImport();

    return (
        <>
            <Head title={t('auth.login_title', 'Sign In to Your Account')} />

            {/* <PasskeyVerify /> */}

            {status && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-center text-sm font-medium">
                    {status}
                </div>
            )}

            <div className="text-center space-y-1.5 pb-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t('auth.welcome_back', 'Welcome Back')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('auth.login_subtitle', 'Enter your credentials below to access your account')}
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    {t('auth.email', 'Email Address')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t('auth.email_placeholder', 'name@example.com')}
                                    className="mt-1"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                                        {t('auth.password', 'Password')}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-primary hover:underline font-medium"
                                            tabIndex={5}
                                        >
                                            {t('auth.forgot_password', 'Forgot password?')}
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t('auth.password_placeholder', '••••••••')}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5 rtl:space-x-reverse pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer font-normal">
                                    {t('auth.remember_me', 'Remember me')}
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 shadow-xs gap-2"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="h-4 w-4" />
                                        <span>{t('auth.logging_in', 'Signing in...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4" />
                                        <span>{t('auth.login_button', 'Sign In')}</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                            {t('auth.no_account', "Don't have an account?")}{' '}
                            <TextLink href={register()} tabIndex={5} className="font-semibold text-primary hover:underline">
                                {t('auth.register_link', 'Sign up')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
