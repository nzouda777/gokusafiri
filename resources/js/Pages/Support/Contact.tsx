import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { PageProps } from '../../types';

const TOPICS = ['general', 'booking', 'payment', 'partnership', 'other'] as const;

export default function Contact() {
    const { locale, flash } = usePage<PageProps>().props;
    const { t } = useLaravelReactI18n();

    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        topic: 'general',
        subject: '',
        message: '',
        booking_reference: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${locale}/contact`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const inputClass =
        'w-full rounded-[14px] border-2 border-[#e4ddd0] bg-white px-4 py-3 text-[14px] text-[#16241b] placeholder-[#8a968d] focus:border-[#6e8c79] focus:outline-none transition-colors';
    const labelClass = 'block text-[12px] font-bold text-[#8a968d] uppercase tracking-wider mb-1.5';

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
            value: '+1 706-581-1963',
            descKey: 'contact.ch2_desc',
            href: 'https://wa.me/17065811963',
            ctaKey: 'contact.ch2_cta',
        },
        {
            icon: Phone,
            labelKey: 'contact.ch3_label',
            value: '+1 706-540-0534',
            descKey: 'contact.ch3_desc',
            href: 'tel:+17065400534',
            ctaKey: 'contact.ch3_cta',
        },
    ];

    const OFFICES = [
        {
            cityKey: null,
            city: 'Nairobi',
            subtitleKey: 'contact.office1_subtitle',
            address: 'Karen Road, Karen, Nairobi 00502, Kenya',
            phone: '+1 706-581-1963',
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
            phone: '+1 17065400534',
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

            {/* Contact form */}
            <section className="bg-[#fbf8f2] pb-16 md:pb-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="bg-white rounded-[22px] p-8 md:p-12 max-w-[760px]">
                        <div className="mb-8">
                            <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-3">
                                {t('contact.form_eyebrow')}
                            </p>
                            <h2 className="font-display not-italic text-[28px] md:text-[36px] tracking-[-0.62px] text-[#16241b] mb-2">
                                {t('contact.form_title')}
                            </h2>
                            <p className="text-[14px] leading-[22px] text-[#4f5c53]">
                                {t('contact.form_subtitle')}
                            </p>
                        </div>

                        {wasSuccessful || flash?.success ? (
                            <div className="flex items-center gap-4 p-6 rounded-[18px] bg-[#eef3ec] mb-6">
                                <CheckCircle2 size={24} className="text-[#2e4a39] shrink-0" />
                                <p className="text-[14px] text-[#2e4a39] font-medium">
                                    {t('contact.form_success')}
                                </p>
                            </div>
                        ) : null}

                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="contact-name" className={labelClass}>{t('contact.form_name')}</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('contact.form_name_ph')}
                                        className={inputClass}
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-[12px] text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className={labelClass}>{t('contact.form_email')}</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t('contact.form_email_ph')}
                                        className={inputClass}
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-[12px] text-red-600">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="contact-phone" className={labelClass}>{t('contact.form_phone')}</label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="+1 …"
                                        className={inputClass}
                                    />
                                    {errors.phone && <p className="mt-1 text-[12px] text-red-600">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact-topic" className={labelClass}>{t('contact.form_topic')}</label>
                                    <select
                                        id="contact-topic"
                                        value={data.topic}
                                        onChange={(e) => setData('topic', e.target.value)}
                                        className={inputClass}
                                    >
                                        {TOPICS.map((topic) => (
                                            <option key={topic} value={topic}>{t(`contact.form_topic_${topic}`)}</option>
                                        ))}
                                    </select>
                                    {errors.topic && <p className="mt-1 text-[12px] text-red-600">{errors.topic}</p>}
                                </div>
                            </div>

                            {data.topic === 'booking' || data.topic === 'payment' ? (
                                <div>
                                    <label htmlFor="contact-reference" className={labelClass}>{t('contact.form_reference')}</label>
                                    <input
                                        id="contact-reference"
                                        type="text"
                                        value={data.booking_reference}
                                        onChange={(e) => setData('booking_reference', e.target.value)}
                                        placeholder="GKS-XXXXX"
                                        className={inputClass}
                                    />
                                    {errors.booking_reference && <p className="mt-1 text-[12px] text-red-600">{errors.booking_reference}</p>}
                                </div>
                            ) : null}

                            <div>
                                <label htmlFor="contact-subject" className={labelClass}>{t('contact.form_subject')}</label>
                                <input
                                    id="contact-subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder={t('contact.form_subject_ph')}
                                    className={inputClass}
                                />
                                {errors.subject && <p className="mt-1 text-[12px] text-red-600">{errors.subject}</p>}
                            </div>

                            <div>
                                <label htmlFor="contact-message" className={labelClass}>{t('contact.form_message')}</label>
                                <textarea
                                    id="contact-message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder={t('contact.form_message_ph')}
                                    rows={6}
                                    className={inputClass}
                                    required
                                />
                                {errors.message && <p className="mt-1 text-[12px] text-red-600">{errors.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2e4a39] text-white text-[14px] font-semibold hover:bg-[#16241b] transition-colors disabled:opacity-60"
                            >
                                <Send size={16} />
                                {processing ? t('contact.form_sending') : t('contact.form_send')}
                            </button>
                        </form>
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
            <section className="bg-[#fbf8f2] py-16 md:py-24 hidden">
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
