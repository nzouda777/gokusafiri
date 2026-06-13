import { Link, usePage } from '@inertiajs/react';
import { MapPin, Heart, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import AppLayout from './AppLayout';
import type { PageProps } from '../types';

const NAV = [
    { label: 'My trips', href: '/account/trips', icon: MapPin },
    { label: 'Saved safaris', href: '/account/saved', icon: Heart },
    { label: 'Profile', href: '/account/profile', icon: User },
    { label: 'Settings', href: '/account/settings', icon: Settings },
    { label: 'Help & Support', href: '#', icon: HelpCircle },
];

export default function AccountLayout({ children, title }: { children: React.ReactNode; title: string }) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <AppLayout>
            {/* Hero banner */}
            <div className="relative bg-[#F7F5F0] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute right-0 top-0 w-80 h-40 opacity-30">
                        {/* decorative gorilla silhouette placeholder */}
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#E07A3F] text-white text-xs font-semibold mb-3">
                        My account
                    </span>
                    <h1 className="font-serif text-3xl font-bold text-[#1F2937]">Welcome back, {user.first_name ?? user.name.split(' ')[0]}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Member since {user.member_since ?? '2023'} · {user.tier ?? 'Explorer'} tier
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-[16px] p-5 shadow-sm">
                            <div className="flex flex-col items-center text-center mb-5 pb-5 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#2C4A3B] flex items-center justify-center text-white text-xl font-bold mb-3">
                                    {user.avatar
                                        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        : <span>{user.name?.[0]?.toUpperCase()}</span>
                                    }
                                </div>
                                <p className="font-semibold text-[#1F2937]">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <nav className="space-y-1">
                                {NAV.map((item) => {
                                    const Icon = item.icon;
                                    const active = currentPath === item.href;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                                active
                                                    ? 'bg-[#2C4A3B]/10 text-[#2C4A3B]'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#2C4A3B]'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 w-full transition-colors"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </Link>
                            </nav>
                        </div>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
