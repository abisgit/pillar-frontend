'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ContributionGraph() {
    const [stats, setStats] = useState<Record<string, number>>({});

    // Generate last 365 days
    const days = Array.from({ length: 365 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (364 - i));
        return d.toISOString().split('T')[0];
    });

    useEffect(() => {
        api.get('/users/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    const getColor = (count: number) => {
        if (!count) return 'bg-muted/40'; // Gray/Empty
        if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900';
        if (count <= 3) return 'bg-emerald-400 dark:bg-emerald-700';
        return 'bg-emerald-600 dark:bg-emerald-500';
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Consistency Graph</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-1">
                    {days.map(date => (
                        <div
                            key={date}
                            title={`${date}: ${stats[date] || 0} goals`}
                            className={`h-3 w-3 rounded-sm ${getColor(stats[date] || 0)}`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
