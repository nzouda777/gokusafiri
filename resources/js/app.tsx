import '../css/app.css';
import React, { useEffect, useRef } from 'react';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { LaravelReactI18nProvider, useLaravelReactI18n } from 'laravel-react-i18n';

const appName = 'GokuSafiri';

const i18nFiles = import.meta.glob('/lang/*.json', { eager: true });

const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });

// Must live INSIDE LaravelReactI18nProvider so it can call the provider's own
// setLocale() via context. The provider's locale is stored in useState (initialized
// once); changing the locale prop from outside is silently ignored by the library.
function I18nLocaleSync() {
    const { setLocale } = useLaravelReactI18n();
    const setLocaleRef = useRef(setLocale);
    setLocaleRef.current = setLocale;

    useEffect(() => {
        return router.on('navigate', (event) => {
            const incoming = (event.detail.page.props as Record<string, unknown>).locale as string | undefined;
            if (incoming) setLocaleRef.current(incoming);
        });
    }, []);

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) => {
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) throw new Error(`Inertia page not found: ${name}`);
        return page as { default: React.ComponentType };
    },
    setup({ el, App, props }) {
        const initialLocale = (props.initialPage.props as Record<string, unknown>).locale as string ?? 'en';
        createRoot(el!).render(
            <LaravelReactI18nProvider locale={initialLocale} fallbackLocale="en" files={i18nFiles}>
                <I18nLocaleSync />
                <App {...props} />
            </LaravelReactI18nProvider>
        );
    },
    progress: { color: '#2C4A3B' },
});
