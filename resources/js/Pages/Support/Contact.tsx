import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { Mail, MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../../types';

export default function Contact() {
    const { locale } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();

    const CHANNELS = [
        {
            icon: Mail,
            labelKey: 'contact.ch1_label',
            value: 'support@gokusafiri.com',
            descKey: 'contact.ch1_desc',
            href: 'mailto:support@gokusafiri.com',
            ctaKey: 'contact.ch1_cta',
        },
        {
            icon: MessageCircle,
            labelKey: 'contact.ch2_label',
            value: '+254 700 000 000',
            descKey: 'contact.ch2_desc',
            href: 'https://wa.me/254700000000',
            ctaKey: 'contact.ch2_cta',
        },
        {
            icon: Phone,
            labelKey: 'contact.ch3_label',
            value: '+33 1 00 00 00 00',
            descKey: 'contact.ch3_desc',
            href: 'tel:+33100000000',
            ctaKey: 'contact.ch3_cta',
        },
    ];

    const OFFICES = [
        {
            cityKey: null,
            city: 'Nairobi',
            subtitleKey: 'contact.office1_subtitle',
            address: 'Karen Road, Karen, Nairobi 00502, Kenya',
            phone: '+254 700 000 000',
            flag: '🇰🇪',
        },
        {
            cityKey: 'contact.office2_city',
            city: 'Cape Town',
            subtitleKey: 'contact.office2_subtitle',
            address: 'V&A Waterfront, Cape Town 8001, South Africa',
            phone: '+27 21 000 0000',
            flag: '🇿🇦',
        },
        {
            cityKey: null,
            city: 'Paris',
            subtitleKey: 'contact.office3_subtitle',
            address: '12 Rue de Rivoli, 75001 Paris, France',
            phone: '+33 1 00 00 00 00',
            flag: '🇫🇷',
        },
    ];

    return (
        <AppLayout>
            <Head title="Contact Us  Gokusafiri" />

            {/* Hero */}
            <section className="bg-[#16241b] py-20 md:py-28">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                        {t('contact.eyebrow')}
                    </p>
                    <h1 className="font-display not-italic text-[42px] leading-[50px] md:text-[64px] md:leading-[70px] tracking-[-0.62px] text-white max-w-[600px] mb-6">
                        {t('contact.title')}
                    </h1>
                    <p className="text-[16px] leading-[26px] text-white/70 max-w-[480px]">
                        {t('contact.subtitle')}
                    </p>
                </div>
            </section>

            {/* Contact channels */}
            <section className="bg-[#fbf8f2] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {CHANNELS.map(({ icon: Icon, labelKey, value, descKey, href, ctaKey }) => (
                            <div key={labelKey} className="bg-white rounded-[22px] p-8 flex flex-col">
                                <div className="w-12 h-12 rounded-full bg-[#eef3ec] flex items-center justify-center mb-5">
                                    <Icon size={22} className="text-[#6e8c79]" />
                                </div>
                                <p className="text-[12px] font-bold text-[#8a968d] uppercase tracking-wider mb-1">{t(labelKey)}</p>
                                <p className="text-[17px] font-semibold text-[#16241b] mb-3">{value}</p>
                                <p className="text-[14px] leading-[22px] text-[#4f5c53] flex-1 mb-6">{t(descKey)}</p>
                                <a
                                    href={href}
                                    target={href.startsWith('http') ? '_blank' : undefined}
                                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="flex items-center justify-center w-full py-3 rounded-full border-2 border-[#e4ddd0] text-[14px] font-medium text-[#16241b] hover:border-[#6e8c79] hover:text-[#6e8c79] transition-colors"
                                >
                                    {t(ctaKey)}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Response promise */}
            <section className="bg-white py-12">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="flex items-center gap-4 p-6 rounded-[18px] bg-[#eef3ec] max-w-[600px]">
                        <Clock size={24} className="text-[#6e8c79] shrink-0" />
                        <p className="text-[14px] text-[#2e4a39]">
                            <span className="font-semibold">{t('contact.promise_bold')}</span>{' '}
                            {t('contact.promise_suffix')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Offices */}
            <section className="bg-[#fbf8f2] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="mb-10">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">{t('contact.offices_eyebrow')}</p>
                        <h2 className="font-display not-italic text-[32px] md:text-[40px] tracking-[-0.62px] text-[#16241b]">
                            {t('contact.offices_title')}
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {OFFICES.map(({ cityKey, city, subtitleKey, address, phone, flag }) => (
                            <div key={city} className="bg-white rounded-[22px] p-7">
                                <div className="text-[32px] mb-4">{flag}</div>
                                <h3 className="font-semibold text-[18px] text-[#16241b] mb-1">
                                    {cityKey ? t(cityKey) : city}
                                </h3>
                                <p className="text-[13px] text-[#6e8c79] font-medium mb-4">{t(subtitleKey)}</p>
                                <div className="space-y-2.5">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin size={14} className="text-[#8a968d] mt-0.5 shrink-0" />
                                        <p className="text-[13px] text-[#4f5c53] leading-[20px]">{address}</p>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Phone size={14} className="text-[#8a968d] shrink-0" />
                                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-[13px] text-[#4f5c53] hover:text-[#6e8c79] transition-colors">{phone}</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
