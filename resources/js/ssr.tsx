import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';

const appName = 'GokuSafiri';

export default function render(page: Parameters<typeof createInertiaApp>[0]['page']) {
    return createInertiaApp({
        page,
        title: (title) => (title ? `${title} — ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.tsx`,
                import.meta.glob('./Pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => ReactDOMServer.renderToString(<App {...props} />),
    });
}
