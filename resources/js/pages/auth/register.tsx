import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import useImport from '@/hooks/use-import';
import { User, Mail, Lock, ShieldCheck, UserPlus } from 'lucide-react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { t } = useImport();

    return (
        <>
            <Head title={t('auth.register_title', 'Create an Account')} />

            <div className="text-center space-y-1.5 pb-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t('auth.register_title', 'Create an Account')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('auth.register_subtitle', 'Fill in your details below to create your account')}
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-gray-400" />
                                    {t('auth.full_name', 'Full Name')}
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder={t('auth.full_name_placeholder', 'John Doe')}
                                    className="mt-1"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                    {t('auth.email', 'Email Address')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder={t('auth.email_placeholder', 'name@example.com')}
                                    className="mt-1"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                                    {t('auth.password', 'Password')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={t('auth.password_placeholder', '••••••••')}
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                                    {t('auth.confirm_password', 'Confirm Password')}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder={t('auth.confirm_password_placeholder', '••••••••')}
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 shadow-xs gap-2 mt-2"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="h-4 w-4" />
                                        <span>{t('auth.creating_account', 'Creating account...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>{t('auth.create_account_button', 'Create Account')}</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                            {t('auth.already_have_account', 'Already have an account?')}{' '}
                            <TextLink href={login()} tabIndex={6} className="font-semibold text-primary hover:underline">
                                {t('auth.login_link', 'Sign In')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
