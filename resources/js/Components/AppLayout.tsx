import { Link, usePage } from '@inertiajs/react';
import { Menu, X, Heart, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../types';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth, locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const [mobileOpen, setMobileOpen] = useState(false);

    const p = `/${locale}`;
    const navLinks = [
        { label: t('nav.home'),     href: p,             exact: true },
        { label: t('nav.tours'),    href: `${p}/tours` },
        { label: t('nav.packages'), href: `${p}/packages` },
        { label: t('nav.about'),    href: '#about' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e4ddd0]/60">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 h-[71px] flex items-center justify-between">

                    {/* Logo */}
                    <Link href={p} className="flex items-center gap-2.5 shrink-0">
                        <img
                            src="/images/logo.png"
                            alt="Gokusafiri"
                            className="h-10 w-auto"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span className="font-display not-italic text-[20px] text-[#16241b] hidden sm:block">
                            Gokusafiri
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-[35px]">
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
                            href={`${p}/tours`}
                            className="hidden sm:inline-flex items-center px-[18px] py-[12px] rounded-full bg-[#6e8c79] text-white text-[14px] font-medium hover:bg-[#5a7865] transition-colors"
                        >
                            {t('nav.plan_trip')}
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
                            <Link href={`${p}/tours`} className="block w-full text-center py-3 rounded-full bg-[#6e8c79] text-white text-[14px] font-medium" onClick={() => setMobileOpen(false)}>
                                {t('nav.plan_trip')}
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <Footer />
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
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
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

function Footer() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();
    const p = `/${locale}`;
    return (
        <footer className="bg-[#16241b] text-white">
            <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-5">
                            <img
                                src="/images/logo.png"
                                alt="Gokusafiri"
                                className="h-10 w-auto brightness-0 invert"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <span className="font-display not-italic text-[20px]">Gokusafiri</span>
                        </div>
                        <p className="text-[14px] text-white/60 leading-relaxed">{t('footer.tagline')}</p>
                    </div>
                    <FooterCol title={t('footer.explore')} links={[
                        { label: t('footer.safaris'),   href: `${p}/tours` },
                        { label: t('footer.beaches'),   href: `${p}/tours?style=beach` },
                        { label: t('footer.mountains'), href: `${p}/tours?style=mountain` },
                        { label: t('footer.custom'),    href: `${p}/tours?style=custom` },
                    ]} />
                    <FooterCol title={t('footer.company')} links={[
                        { label: t('footer.about'),          href: '#' },
                        { label: t('footer.guides'),         href: '#' },
                        { label: t('footer.sustainability'), href: '#' },
                        { label: t('footer.careers'),        href: '#' },
                    ]} />
                    <FooterCol title={t('footer.support')} links={[
                        { label: t('footer.help'),           href: '#' },
                        { label: t('footer.contact'),        href: '#' },
                        { label: t('footer.cancel_policy'),  href: '#' },
                        { label: t('footer.insurance'),      href: '#' },
                    ]} />
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-white/40">
                    <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
                    <div className="flex gap-5">
                        <a href="#" className="hover:text-white/70 transition-colors">{t('footer.privacy')}</a>
                        <a href="#" className="hover:text-white/70 transition-colors">{t('footer.terms')}</a>
                        <a href="#" className="hover:text-white/70 transition-colors">{t('footer.cookies')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div>
            <h4 className="text-[14px] font-semibold mb-5">{title}</h4>
            <ul className="space-y-3">
                {links.map((l) => (
                    <li key={l.label}>
                        <a href={l.href} className="text-[14px] text-white/60 hover:text-white transition-colors">{l.label}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
