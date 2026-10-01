import React, { useState } from 'react';
import {
    Download,
    Smartphone,
    Sparkles,
    Zap,
    WifiOff,
    ShieldCheck,
    Maximize2,
    Share2,
    PlusSquare,
    CheckCircle2,
    MonitorDown,
    Loader2,
} from 'lucide-react';
import useImport from '@/hooks/use-import';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface InstallAppButtonProps {
    variant?: 'banner' | 'card' | 'menu' | 'button';
    className?: string;
    onInstalled?: () => void;
}

export default function InstallAppButton({
    variant = 'banner',
    className = '',
    onInstalled,
}: InstallAppButtonProps) {
    const { t, isRtl } = useImport();
    const {
        canPromptNatively,
        isInstalled,
        isInstalling,
        isIos,
        isDesktop,
        triggerInstall,
    } = usePwaInstall();

    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [guideType, setGuideType] = useState<'ios' | 'desktop'>('ios');

    const handleInstallClick = async () => {
        const result = await triggerInstall();

        if (result === 'accepted') {
            onInstalled?.();
        } else if (result === 'ios-guide') {
            setGuideType('ios');
            setIsGuideOpen(true);
        } else if (result === 'desktop-guide') {
            setGuideType('desktop');
            setIsGuideOpen(true);
        }
    };

    // If app is already installed and in standalone mode:
    if (isInstalled) {
        if (variant === 'menu' || variant === 'button') {
            return null;
        }

        return (
            <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
                <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-linear-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 sm:p-6 text-center sm:text-start flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 justify-center sm:justify-start">
                                {t('pwa.installed', 'التطبيق مثبت على هذا الجهاز')}
                                <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border-emerald-200">
                                    PWA
                                </Badge>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('pwa.installed_desc', 'أنت تستخدم عيادتي بالفعل من خلال التطبيق المثبت.')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Menu / Compact List-item variant (e.g. for navbar mobile sheet / sidebar)
    if (variant === 'menu' || variant === 'button') {
        return (
            <>
                <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-start transition-all hover:bg-primary/10 dark:hover:bg-primary/20 group border border-transparent hover:border-primary/20 ${className}`}
                >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs group-hover:scale-105 transition-transform">
                        {isInstalling ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <Smartphone className="size-5" />
                        )}
                    </span>

                    <span className="flex flex-1 flex-col items-start min-w-0">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                            {t('pwa.install_app', 'تثبيت عيادتي')}
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                                PWA
                            </span>
                        </span>

                        <span className="text-xs text-muted-foreground truncate">
                            {t('pwa.subtitle', 'استخدم عيادتي كتطبيق مستقل وسريع')}
                        </span>
                    </span>

                    <Download className="size-4 text-primary shrink-0 group-hover:translate-y-0.5 transition-transform" />
                </button>

                {renderGuideDialog()}
            </>
        );
    }

    // Default: Premium Full Banner variant (for Home page & Landing sections)
    return (
        <>
            <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 ${className}`}>
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/5 via-blue-50/40 to-indigo-50/30 dark:from-primary/10 dark:via-gray-900/60 dark:to-blue-950/20 p-6 sm:p-8 md:p-10 shadow-lg backdrop-blur-md transition-all hover:shadow-xl">
                    {/* Decorative Ambient Glow */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        {/* App Information & Value Proposition */}
                        <div className="flex-1 text-center lg:text-start space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                                <Sparkles className="size-3.5" />
                                <span>{t('pwa.badge', 'تطبيق الويب المتقدم (PWA)')}</span>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
                                    {t('pwa.title', 'تثبيت تطبيق عيادتي')}
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                                    {t('pwa.description', 'تجربة سريعة وسهولة وصول فورية لعيادتك مع دعم العمل دون اتصال، وتنبيهات فورية وواجهة ملء الشاشة.')}
                                </p>
                            </div>

                            {/* Features list */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/60 rounded-xl p-2.5 border border-gray-100 dark:border-gray-800 shadow-2xs">
                                    <Zap className="size-4 text-amber-500 shrink-0" />
                                    <span>{t('pwa.feature_fast', 'تحميل فوري')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/60 rounded-xl p-2.5 border border-gray-100 dark:border-gray-800 shadow-2xs">
                                    <WifiOff className="size-4 text-blue-500 shrink-0" />
                                    <span>{t('pwa.feature_offline', 'يعمل دون إنترنت')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/60 rounded-xl p-2.5 border border-gray-100 dark:border-gray-800 shadow-2xs">
                                    <Maximize2 className="size-4 text-purple-500 shrink-0" />
                                    <span>{t('pwa.feature_fullscreen', 'ملء الشاشة')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/60 rounded-xl p-2.5 border border-gray-100 dark:border-gray-800 shadow-2xs">
                                    <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                                    <span>{t('pwa.feature_secure', 'آمن ومحمي')}</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Install Action Card */}
                        <div className="shrink-0 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-center gap-3">
                            <Button
                                size="lg"
                                onClick={handleInstallClick}
                                disabled={isInstalling}
                                className="w-full sm:w-auto min-w-[220px] h-13 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all gap-2.5 rounded-xl cursor-pointer"
                            >
                                {isInstalling ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        <span>{t('pwa.installing', 'جاري التثبيت...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="size-5" />
                                        <span>{t('pwa.install_now', 'تثبيت التطبيق الآن')}</span>
                                    </>
                                )}
                            </Button>

                            <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-1.5">
                                <Smartphone className="size-3.5" />
                                <span>{isIos ? 'iPhone / iPad Safari' : isDesktop ? 'Chrome / Edge Desktop' : 'Android & All Devices'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {renderGuideDialog()}
        </>
    );

    function renderGuideDialog() {
        return (
            <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogContent className="max-w-md p-6">
                    <DialogHeader className="text-start">
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            {guideType === 'ios' ? (
                                <>
                                    <Smartphone className="size-5 text-primary" />
                                    <span>{t('pwa.ios_guide_title', 'تثبيت التطبيق على iPhone و iPad')}</span>
                                </>
                            ) : (
                                <>
                                    <MonitorDown className="size-5 text-primary" />
                                    <span>{t('pwa.desktop_guide_title', 'تثبيت عيادتي على الحاسوب')}</span>
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {guideType === 'ios'
                                ? t('pwa.ios_guide_desc', 'يدعم متصفح Safari على أجهزة Apple التثبيت بسهولة عبر الخطوات التالية:')
                                : t('pwa.desktop_guide_desc', 'يمكنك تثبيت عيادتي كتطبيق لسطح المكتب في متصفح Chrome أو Edge:')}
                        </DialogDescription>
                    </DialogHeader>

                    {guideType === 'ios' ? (
                        <div className="space-y-3.5 py-3">
                            {/* Step 1 */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm">
                                    <Share2 className="size-4" />
                                </div>
                                <div className="space-y-0.5 text-xs">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        1. {t('pwa.ios_step_1_title', 'اضغط على زر المشاركة (Share)')}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {t('pwa.ios_step_1_desc', 'في شريط أدوات Safari أسفل الشاشة.')}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                                    <PlusSquare className="size-4" />
                                </div>
                                <div className="space-y-0.5 text-xs">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        2. {t('pwa.ios_step_2_title', "اختر 'إضافة إلى الشاشة الرئيسية'")}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {t('pwa.ios_step_2_desc', "مرر لأسفل القائمة واضغط على خيار 'Add to Home Screen'.")}
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                                    <CheckCircle2 className="size-4" />
                                </div>
                                <div className="space-y-0.5 text-xs">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        3. {t('pwa.ios_step_3_title', "اضغط على 'إضافة' (Add)")}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {t('pwa.ios_step_3_desc', 'في الزاوية العلوية لتثبيت التطبيق والوصول إليه بضغطة واحدة.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 py-3">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                                    1
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {t('pwa.desktop_step_1', 'اضغط على أيقونة التثبيت في شريط العنوان أعلى المتصفح.')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm">
                                    2
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {t('pwa.desktop_step_2', "أو من قائمة المتصفح (⋮) اختر 'تثبيت عيادتي' (Install Eyadati).")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-2">
                        <Button
                            type="button"
                            className="w-full font-semibold"
                            onClick={() => setIsGuideOpen(false)}
                        >
                            {t('pwa.got_it', 'فهمت، حسناً')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
}
