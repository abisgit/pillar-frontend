'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

const API_URL = 'http://localhost:4000';

export function TopNav() {
    const { user, logout } = useAuth();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Notifications placeholder
    const notifications = [
        { id: 1, text: "Someone liked your post", time: "5m ago" },
        { id: 2, text: "New event in your community", time: "1h ago" },
    ];

    const clickOutside = (e: MouseEvent) => {
        // Close on outside click logic would go here if we had refs
    };

    return (
        <nav className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href="/dashboard" className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Pillar
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <Button variant="ghost" size="icon" onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setProfileMenuOpen(false);
                    }}>
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                    </Button>

                    {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-xl py-2 z-50">
                            <h3 className="px-4 py-2 font-bold border-b text-sm">Notifications</h3>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map(n => (
                                    <div key={n.id} className="px-4 py-3 hover:bg-secondary/50 cursor-pointer border-b last:border-0">
                                        <p className="text-sm">{n.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ModeToggle />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setProfileMenuOpen(!profileMenuOpen);
                            setNotificationsOpen(false);
                        }}
                        className="h-9 w-9 rounded-full bg-secondary overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all"
                    >
                        {user?.image ? (
                            <img src={isMounted ? `${API_URL}${user.image}?t=${Date.now()}` : `${API_URL}${user.image}`} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0)}</div>
                        )}
                    </button>

                    {profileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-xl py-2 z-50">
                            <div className="px-4 py-2 border-b mb-1">
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <Link href="/dashboard/profile" onClick={() => setProfileMenuOpen(false)}>
                                <div className="px-4 py-2 hover:bg-secondary flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4" /> Profile
                                </div>
                            </Link>
                            <Link href="/dashboard/settings" onClick={() => setProfileMenuOpen(false)}>
                                <div className="px-4 py-2 hover:bg-secondary flex items-center gap-2 text-sm">
                                    <Settings className="h-4 w-4" /> Settings
                                </div>
                            </Link>
                            <div className="border-t my-1" />
                            <button
                                onClick={logout}
                                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 flex items-center gap-2 text-sm"
                            >
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
