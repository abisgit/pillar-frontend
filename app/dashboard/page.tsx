'use client';

import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { Feed } from '@/components/feed/Feed';
import { TopNav } from '@/components/layout/TopNav';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <TopNav />

            <div className="flex max-w-7xl mx-auto">
                <Sidebar />
                <main className="flex-1 p-6">
                    <Feed />
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
