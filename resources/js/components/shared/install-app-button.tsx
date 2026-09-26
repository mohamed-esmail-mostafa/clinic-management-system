
import { Download, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

export default function InstallAppButton() {
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);

    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if the app is already installed
        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as Navigator & {
                standalone?: boolean;
            }).standalone === true;

        setIsInstalled(standalone);

        // Capture the browser install prompt
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();

            setInstallPrompt(event as BeforeInstallPromptEvent);
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );

        // Detect when the app is installed
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setInstallPrompt(null);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );

            window.removeEventListener(
                'appinstalled',
                handleAppInstalled,
            );
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) {
            return;
        }

        await installPrompt.prompt();

        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
        }

        setInstallPrompt(null);
    };

    // Don't show anything if the app is already installed
    if (isInstalled) {
        return null;
    }

    // Don't show anything if the browser doesn't support the install prompt
    if (!installPrompt) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleInstall}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="size-5" />
            </span>

            <span className="flex flex-1 flex-col items-start">
                <span>تثبيت عيادتي</span>

                <span className="text-xs font-normal text-muted-foreground">
                    استخدم عيادتي كتطبيق على جهازك
                </span>
            </span>

            <Download className="size-4 text-muted-foreground" />
        </button>
    );
}
