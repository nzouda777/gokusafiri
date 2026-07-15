import { Link, usePage } from '@inertiajs/react';
import { Menu, X, Heart, Globe, PlaneIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ChatWidget from './ChatWidget';
import type { PageProps } from '../types';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth, locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const [mobileOpen, setMobileOpen] = useState(false);

    const p = `/${locale}`;
    const navLinks = [
        { label: t('nav.home'),     href: p,             exact: true },
        // { label: t('nav.tours'),    href: `${p}/tours` },
        { label: t('nav.packages'), href: `${p}/packages` },
        { label: t('nav.about'),    href: `${p}/about` },
        { label: t('nav.faq'),      href: `${p}/faq` },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e4ddd0]/60">
                <div className="relative max-w-[1440px] mx-auto px-[100px] max-lg:px-6 h-[71px] flex items-center justify-between">

                    {/* Logo */}
                    <Link href={p} className="flex items-center gap-2.5 shrink-0">
                        <img
                            src="/images/main-logo.png"
                            alt="Gokusafiri"
                            className=" md:h-14 h-12 w-auto"
                            // onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {/* <span className="font-display not-italic text-[20px] text-[#16241b] hidden sm:block">
                            Gokusafiri
                        </span> */}
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-[35px] absolute left-1/2 -translate-x-1/2">
                        {navLinks.map((link) => (
                            <NavItem key={link.label} {...link} />
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-[19px]">
                        {auth.user ? (
                            <>
                                <Link
                                    href="/account/saved"
                                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#eef3ec] transition-colors"
                                >
                                    <Heart size={18} className="text-[#16241b]" />
                                </Link>
                                <Link
                                    href="/account/trips"
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-[#6e8c79] text-white overflow-hidden"
                                >
                                    {auth.user.avatar
                                        ? <img src={auth.user.avatar} alt={auth.user.name} className="w-full h-full object-cover" />
                                        : <span className="text-xs font-bold">{auth.user.name?.[0]?.toUpperCase()}</span>
                                    }
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden sm:inline-flex items-center px-[10px] py-[5px] text-[14px] font-medium text-[#16241b] hover:text-[#6e8c79] transition-colors"
                            >
                                {t('nav.sign_in')}
                            </Link>
                        )}

                        <LanguageSwitcher />

                        <Link
                            href={`${p}/packages`}
                            className="hidden sm:inline-flex items-center px-[18px] py-[12px] rounded-full bg-[#6e8c79] text-white text-[14px] font-medium hover:bg-[#5a7865] transition-colors"
                        >
                            {/* {t('nav.plan_trip')} */}
                            <PlaneIcon size={20} className="text-white" />
                        </Link>

                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-[#eef3ec] transition-colors"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={20} className="text-[#16241b]" /> : <Menu size={20} className="text-[#16241b]" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-[#e4ddd0] bg-white px-6 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="block px-3 py-2.5 text-[14px] font-medium text-[#16241b] rounded-lg hover:bg-[#eef3ec] transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-[#e4ddd0] mt-2 space-y-2">
                            {auth.user ? (
                                <Link href="/account/trips" className="block px-3 py-2.5 text-[14px] font-medium text-[#6e8c79]" onClick={() => setMobileOpen(false)}>
                                    {t('nav.my_trips')}
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="block px-3 py-2.5 text-[14px] font-medium text-[#16241b]" onClick={() => setMobileOpen(false)}>{t('nav.sign_in')}</Link>
                                    <Link href="/register" className="block px-3 py-2.5 text-[14px] font-semibold text-[#6e8c79]" onClick={() => setMobileOpen(false)}>{t('nav.create_account')}</Link>
                                </>
                            )}
                            <Link href={`${p}/packages`} className="block w-full text-center py-3 rounded-full bg-[#6e8c79] text-white text-[14px] font-medium" onClick={() => setMobileOpen(false)}>
                                {t('nav.plan_trip')}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <Footer />

            <ChatWidget />
        </div>
    );
}

function NavItem({ label, href, exact = false }: { label: string; href: string; exact?: boolean }) {
    const { url } = usePage();
    // Exact match for home link to avoid matching all locale-prefixed routes
    const isActive = url === href || url === href + '/' || (!exact && url.startsWith(href + '/'));
    return (
        <Link
            href={href}
            className={`relative flex items-center justify-center p-[10px] text-[14px] transition-colors ${
                isActive ? 'font-bold text-[#16241b]' : 'font-medium text-[#16241b] hover:text-[#6e8c79]'
            }`}
        >
            {label}
            {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[22px] h-[6px] rounded-full bg-[#6e8c79]/30" />
            )}
        </Link>
    );
}

const LOCALES = [
    { code: 'en', label: 'English', flag: '' },
    { code: 'fr', label: 'Français', flag: '' },
    { code: 'es', label: 'Español', flag: '' },
] as const;

function LanguageSwitcher() {
    const { locale } = usePage<PageProps>().props;
    const pageUrl = usePage().url;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0];

    function switchLocale(code: string) {
        setOpen(false);
        // Strip any existing locale prefix then prepend the new one
        const cleanPath = pageUrl.replace(/^\/(en|fr|es)(\/|$)/, '/').replace(/\/$/, '') || '/';
        window.location.href = `/${code}${cleanPath}`;
    }

    return (
        <div ref={ref} className="relative hidden sm:block">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium text-[#16241b] hover:bg-[#eef3ec] transition-colors"
            >
                <Globe size={15} className="text-[#6e8c79]" />
                <span>{current.flag} {current.code.toUpperCase()}</span>
            </button>
            {open && (
                <div className="absolute right-0 top-[calc(100%+6px)] bg-white border border-[#e4ddd0] rounded-[14px] shadow-lg overflow-hidden z-50 min-w-[140px]">
                    {LOCALES.map(loc => (
                        <button
                            key={loc.code}
                            onClick={() => switchLocale(loc.code)}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors text-left ${
                                loc.code === locale
                                    ? 'bg-[#eef3ec] text-[#6e8c79]'
                                    : 'text-[#1a211c] hover:bg-[#f9f9f9]'
                            }`}
                        >
                            <span>{loc.flag}</span>
                            <span>{loc.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function SocialIcon({ path, viewBox = '0 0 24 24' }: { path: string; viewBox?: string }) {
    return (
        <svg width="16" height="16" viewBox={viewBox} fill="currentColor" aria-hidden="true" className="text-white/80">
            <path d={path} />
        </svg>
    );
}

const SOCIAL_LINKS = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/profile.php?id=61591261301434',
        icon: <SocialIcon path="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    },
    {
        name: 'TikTok',
        href: 'https://www.tiktok.com/@gokusafiri?',
        icon: <SocialIcon path="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />,
    },
    
    {
        name: 'YouTube',
        href: 'https://youtube.com/@gokusafiri?si=azmY18cqdYaKUcO0',
        icon: <SocialIcon path="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />,
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/gokusafiri?',
        icon: <SocialIcon path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />,
    },
];

function Footer() {
    const { locale, experiences } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;

    const styleLabels: Record<string, string> = {
        safari:       t('index.style_safari'),
        beach:        t('index.style_beach'),
        mountain:     t('index.style_mountain'),
        culture:      t('index.style_culture'),
        gorilla:      t('index.style_gorilla'),
        honeymoon:    t('index.style_honeymoon'),
        adventure:    t('index.style_adventure'),
        migration:    t('index.style_migration'),
        birdwatching: t('index.style_birdwatching'),
        wildlife:     t('index.style_wildlife'),
        luxury:       t('index.style_luxury'),
    };
    const exploreLinks = (experiences ?? []).map((style) => ({
        label: styleLabels[style] ?? style.charAt(0).toUpperCase() + style.slice(1),
        href: `${p}/packages?style=${style}`,
    }));

    return (
        <footer className="bg-[#16241b] text-white">
            <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                    <div className="md:col-span-2">
                        <Link href={p} className="inline-flex items-center gap-2.5 mb-5">
                            <img
                                src="/images/main-white.png"
                                alt="Gokusafiri"
                                className="md:h-20 h-10 w-auto"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                            />
                            {/* <span className="font-display not-italic text-[20px]">Gokusafiri</span> */}
                        </Link>
                        <p className="text-[14px] text-white/60 leading-relaxed mb-6">{t('footer.tagline')}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                            {SOCIAL_LINKS.map(({ name, href, icon }) => (
                                <a
                                    key={name}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={name}
                                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>
                    <FooterCol title={t('footer.explore')} links={
                        exploreLinks.length > 0 ? exploreLinks : [
                            { label: t('footer.safaris'), href: `${p}/packages` },
                        ]
                    } />
                    <FooterCol title={t('footer.company')} links={[
                        { label: t('footer.about'),          href: `${p}/about` },
                        { label: t('footer.guides'),         href: `${p}/guides` },
                        // { label: t('footer.sustainability'), href: `${p}/sustainability` },
                        // { label: t('footer.careers'),        href: `${p}/careers` },
                    ]} />
                    <FooterCol title={t('footer.support')} links={[
                        { label: t('footer.faq'),            href: `${p}/faq` },
                        { label: t('footer.help'),           href: `${p}/help` },
                        { label: t('footer.contact'),        href: `${p}/contact` },
                        { label: t('footer.cancel_policy'),  href: `${p}/cancellation-policy` },
                        // { label: t('footer.insurance'),      href: `${p}/travel-insurance` },
                    ]} />
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-white/40">
                    <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
                    <div className="flex gap-5">
                        <Link href={`${p}/privacy`} className="hover:text-white/70 transition-colors">{t('footer.privacy')}</Link>
                        <Link href={`${p}/terms`} className="hover:text-white/70 transition-colors">{t('footer.terms')}</Link>
                        <Link href={`${p}/cookies`} className="hover:text-white/70 transition-colors">{t('footer.cookies')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div className=''>
            <h4 className="text-[14px] font-semibold mb-5">{title}</h4>
            <ul className="space-y-3">
                {links.map((l) => (
                    <li key={l.label}>
                        <Link href={l.href} className="text-[14px] text-white/60 hover:text-white transition-colors">{l.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
