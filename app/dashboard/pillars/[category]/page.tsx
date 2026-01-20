'use client';

import { use } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TopNav } from '@/components/layout/TopNav';

// Proper type for Page props in Next.js 15+ (async params)
type Props = {
    params: Promise<{ category: string }>;
};

export default function PillarPage({ params }: Props) {
    const { category } = use(params);

    // Simple helper to find the original name from slug (approximate)
    const pillarName = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-background">
            <TopNav />

            <div className="flex max-w-7xl mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">{pillarName}</h1>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress & Consistency</CardTitle>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center bg-slate-50/50 rounded-md border-dashed border-2">
                                <p className="text-muted-foreground">Analytics Graph Placeholder</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Goals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">No active goals in this pillar.</p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
