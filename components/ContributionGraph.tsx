'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function ContributionGraph() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Generate last 180 days (half year for better fit)
    const days = Array.from({ length: 180 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (179 - i));
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        if (!user) return;
        api.get(`/users/${user.id}/stats`)
            .then(res => {
                const statsMap: Record<string, number> = {};
                res.data.forEach((item: { date: string, count: number }) => {
                    statsMap[item.date] = item.count;
                });
                setStats(statsMap);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    const getColor = (count: number) => {
        if (!count) return 'bg-secondary/20'; // Gray/Empty
        if (count === 1) return 'bg-primary/40';
        if (count <= 3) return 'bg-primary/70';
        return 'bg-primary';
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">Journey Intensity</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-tighter">Your daily commitments etched in time.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="flex flex-wrap gap-1">
                    {days.map(date => (
                        <div
                            key={date}
                            title={`${date}: ${stats[date] || 0} routines`}
                            className={cn(
                                "h-3 w-3 rounded-[2px] transition-all duration-500",
                                getColor(stats[date] || 0)
                            )}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
