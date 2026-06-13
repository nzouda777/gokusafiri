import { Head, useForm } from '@inertiajs/react';
import AccountLayout from '../../Components/AccountLayout';
import { Camera } from 'lucide-react';
import type { User } from '../../types';

interface Props {
    user: User & {
        phone?: string;
        country?: string;
        passport_number?: string;
        passport_expiry?: string;
        nationality?: string;
    };
}

export default function AccountProfile({ user }: Props) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        first_name: user.first_name ?? user.name.split(' ')[0] ?? '',
        last_name: user.last_name ?? user.name.split(' ').slice(1).join(' ') ?? '',
        email: user.email,
        phone: user.phone ?? '',
        country: user.country ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put('/account/profile');
    }

    return (
        <AccountLayout title="Profile">
            <Head title="Profile" />

            <h2 className="font-serif text-xl font-bold text-[#1F2937] mb-5">Profile</h2>

            {/* Personal info */}
            <div className="bg-white rounded-[16px] p-5 shadow-sm mb-4">
                <h3 className="font-semibold text-[#1F2937] mb-5">Personal Information</h3>

                {/* Photo */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#2C4A3B] overflow-hidden flex items-center justify-center text-white text-xl font-bold">
                            {user.avatar
                                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                : <span>{user.name?.[0]?.toUpperCase()}</span>
                            }
                        </div>
                        <button type="button" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#2C4A3B] text-white flex items-center justify-center shadow">
                            <Camera size={10} />
                        </button>
                    </div>
                    <div>
                        <button type="button" className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-medium text-[#1F2937] hover:border-[#2C4A3B] transition-colors">
                            Change photo
                        </button>
                        <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <Field label="First name" value={data.first_name} onChange={v => setData('first_name', v)} error={errors.first_name} />
                        <Field label="Last name" value={data.last_name} onChange={v => setData('last_name', v)} error={errors.last_name} />
                        <Field label="Email" type="email" value={data.email} onChange={v => setData('email', v)} error={errors.email} />
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone number</label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#2C4A3B]"
                                placeholder="+1 555 000 0000"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Country of residence</label>
                            <select
                                value={data.country}
                                onChange={e => setData('country', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#2C4A3B] appearance-none"
                            >
                                <option value="">Select country</option>
                                <option value="US">United States</option>
                                <option value="GB">United Kingdom</option>
                                <option value="FR">France</option>
                                <option value="DE">Germany</option>
                                <option value="CA">Canada</option>
                                <option value="AU">Australia</option>
                                <option value="ZA">South Africa</option>
                                <option value="KE">Kenya</option>
                                <option value="TZ">Tanzania</option>
                            </select>
                        </div>
                    </div>

                    {recentlySuccessful && (
                        <p className="text-sm text-green-600 mb-3">Profile updated successfully.</p>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 rounded-full bg-[#2C4A3B] text-white text-sm font-semibold hover:bg-[#3a5c4a] transition-colors disabled:opacity-60"
                    >
                        {processing ? 'Saving…' : 'Save changes'}
                    </button>
                </form>
            </div>

            {/* Bottom cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-[16px] p-5 shadow-sm">
                    <h3 className="font-semibold text-[#1F2937] mb-4">Travel documents</h3>
                    <InfoField label="Passport" value={user.passport_number ? `••••• ${user.passport_number.slice(-4)}` : 'Not set'} />
                    <InfoField label="Expiry" value={user.passport_expiry ?? 'Not set'} />
                    <InfoField label="Nationality" value={user.nationality ?? 'Not set'} />
                </div>
                <div className="bg-white rounded-[16px] p-5 shadow-sm">
                    <h3 className="font-semibold text-[#1F2937] mb-4">Security</h3>
                    <InfoField label="Password" value="••••••••" />
                    <div className="mt-3">
                        <button type="button" className="text-xs text-[#2C4A3B] underline">Change password</button>
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
}

function Field({ label, value, onChange, error, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; error?: string; type?: string }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] border border-gray-200 text-sm bg-[#F7F5F0] focus:outline-none focus:border-[#2C4A3B]"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function InfoField({ label, value }: { label: string; value: string }) {
    return (
        <div className="mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm text-[#1F2937] font-medium">{value}</p>
        </div>
    );
}
