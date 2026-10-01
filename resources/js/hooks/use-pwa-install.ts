import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

// Module-level persistent cache to capture beforeinstallprompt regardless of React render timing
let cachedInstallPrompt: BeforeInstallPromptEvent | null = null;
let cachedIsInstalled = false;
const subscribers = new Set<() => void>();

function notifySubscribers() {
    subscribers.forEach((cb) => {
        try {
            cb();
        } catch (e) {
            console.error('PWA subscriber notification error:', e);
        }
    });
}

function checkIsStandalone(): boolean {
    if (typeof window === 'undefined') return false;

    const isMatchMediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isMatchMediaFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMatchMediaMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
    const isNavigatorStandalone = (window.navigator as any).standalone === true;
    const isAndroidApp = typeof document !== 'undefined' && document.referrer.startsWith('android-app://');
    let hasLocalFlag = false;
    try {
        hasLocalFlag = localStorage.getItem('pwa_installed') === 'true';
    } catch {
        // ignore
    }

    return (
        isMatchMediaStandalone ||
        isMatchMediaFullscreen ||
        isMatchMediaMinimalUi ||
        isNavigatorStandalone ||
        isAndroidApp ||
        hasLocalFlag
    );
}

// Initialize listeners globally immediately upon script load
if (typeof window !== 'undefined') {
    cachedIsInstalled = checkIsStandalone();

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        cachedInstallPrompt = e as BeforeInstallPromptEvent;
        (window as any).__pwaInstallPrompt = cachedInstallPrompt;
        notifySubscribers();
    });

    window.addEventListener('appinstalled', () => {
        cachedIsInstalled = true;
        cachedInstallPrompt = null;
        (window as any).__pwaInstallPrompt = null;
        try {
            localStorage.setItem('pwa_installed', 'true');
        } catch {
            // ignore
        }
        notifySubscribers();
    });
}

export function usePwaInstall() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
        cachedInstallPrompt || ((typeof window !== 'undefined' && (window as any).__pwaInstallPrompt) || null)
    );
    const [isInstalled, setIsInstalled] = useState<boolean>(cachedIsInstalled);
    const [isInstalling, setIsInstalling] = useState<boolean>(false);

    // Platform detection
    const [platform, setPlatform] = useState({
        isIos: false,
        isAndroid: false,
        isDesktop: false,
        isSafari: false,
    });

    useEffect(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
        const isAndroid = /android/.test(ua);
        const isSafari = /safari/.test(ua) && !/chrome|chromium|edg|opr|crios|fxios/.test(ua);
        const isDesktop = !isIos && !isAndroid;

        setPlatform({ isIos, isAndroid, isDesktop, isSafari });

        // Update installed state
        const standaloneNow = checkIsStandalone();
        setIsInstalled(standaloneNow);
        cachedIsInstalled = standaloneNow;

        // Callback for module-level updates
        const updateState = () => {
            setInstallPrompt(cachedInstallPrompt);
            setIsInstalled(cachedIsInstalled || checkIsStandalone());
        };

        subscribers.add(updateState);

        return () => {
            subscribers.delete(updateState);
        };
    }, []);

    const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'ios-guide' | 'desktop-guide' | 'already-installed'> => {
        if (isInstalled) {
            return 'already-installed';
        }

        if (installPrompt) {
            try {
                setIsInstalling(true);
                await installPrompt.prompt();
                const choice = await installPrompt.userChoice;

                if (choice.outcome === 'accepted') {
                    setIsInstalled(true);
                    cachedIsInstalled = true;
                    try {
                        localStorage.setItem('pwa_installed', 'true');
                    } catch {
                        // ignore
                    }
                }

                cachedInstallPrompt = null;
                setInstallPrompt(null);
                (window as any).__pwaInstallPrompt = null;
                return choice.outcome;
            } catch (err) {
                console.error('Failed to trigger PWA prompt:', err);
                return 'desktop-guide';
            } finally {
                setIsInstalling(false);
            }
        }

        if (platform.isIos) {
            return 'ios-guide';
        }

        return 'desktop-guide';
    }, [installPrompt, isInstalled, platform.isIos]);

    return {
        installPrompt,
        canPromptNatively: !!installPrompt,
        isInstalled,
        isInstalling,
        isIos: platform.isIos,
        isAndroid: platform.isAndroid,
        isDesktop: platform.isDesktop,
        isSafari: platform.isSafari,
        triggerInstall,
    };
}
