'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PILLAR_CATEGORIES } from '@/lib/constants';
import { Home, Users, Calendar, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home },
        { name: 'Communities', href: '/dashboard/communities', icon: Users },
        { name: 'Events', href: '/dashboard/events', icon: Calendar },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16 p-4 overflow-hidden group">
            <div className="flex flex-col h-full gap-2 overflow-y-auto scrollbar-hide">
                <div className="py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Discover</h2>
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                                        className={cn(
                                            "w-full justify-start",
                                            pathname === item.href ? "bg-secondary font-semibold" : ""
                                        )}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Pillars</h2>
                    <div className="space-y-1">
                        {PILLAR_CATEGORIES.map((pillar) => (
                            <Link key={pillar.name} href={`/dashboard/pillars/${pillar.name.toLowerCase().replace(/ & /g, '-').replace(/ \/ /g, '-').replace(/ /g, '-')}`}>
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                    <span className="truncate">{pillar.name}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-auto pt-6 border-t">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
