'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    community: { name: string };
    _count: { attendees: number };
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/events')
            .then(res => setEvents(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <TopNav />

            <div className="flex max-w-7xl mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 space-y-6">
                    <h1 className="text-2xl font-bold">Upcoming Events</h1>

                    {loading ? (
                        <div>Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-muted-foreground">No upcoming events. Check back later.</div>
                    ) : (
                        <div className="space-y-4">
                            {events.map(event => (
                                <Card key={event.id}>
                                    <CardHeader>
                                        <CardTitle>{event.title}</CardTitle>
                                        <CardDescription>{event.community?.name}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            {new Date(event.date).toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {event.location || 'Online'}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
