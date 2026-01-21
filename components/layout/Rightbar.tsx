'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';
import api from '@/lib/api';

interface Event {
    id: string;
    title: string;
    date: string;
}

interface Community {
    id: string;
    name: string;
    _count?: {
        members: number;
    }
}

export function Rightbar() {
    const [events, setEvents] = useState<Event[]>([]);
    const [suggestedCommunities, setSuggestedCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes, communitiesRes] = await Promise.all([
                api.get('/events'),
                api.get('/communities?type=suggested')
            ]);
            setEvents(eventsRes.data.slice(0, 3));
            setSuggestedCommunities(communitiesRes.data.slice(0, 3));
        } catch (error) {
            console.error("Failed to fetch rightbar data", error);
        } finally {
            setLoading(false);
        }
    }

    const handleJoin = async (id: string) => {
        try {
            await api.post(`/communities/${id}/join`);
            setSuggestedCommunities(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to join community", error);
        }
    }

    return (
        <div className="hidden lg:block w-80 pl-8 space-y-6 sticky top-16 h-[calc(100vh-4rem)]">
            <Card className="border-none shadow-sm bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60">
                        <Calendar className="h-4 w-4" />
                        Upcoming Convocations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <div className="text-xs font-bold animate-pulse">Syncing Arena...</div>
                    ) : events.length === 0 ? (
                        <div className="text-sm text-muted-foreground pb-2 italic">
                            No upcoming oaths.
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="p-3 bg-secondary/20 border-l-2 border-primary rounded-r-xl transition-all hover:bg-secondary/40">
                                <p className="font-bold text-sm tracking-tight">{event.title}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60">
                        <Users className="h-4 w-4" />
                        Explore Tribes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="text-xs font-bold animate-pulse">Mapping Nexus...</div>
                    ) : suggestedCommunities.length === 0 ? (
                        <div className="text-xs text-muted-foreground italic">All tribes joined.</div>
                    ) : (
                        suggestedCommunities.map(community => (
                            <div key={community.id} className="flex items-center justify-between group">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">{community.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{community._count?.members || 0} Followers</p>
                                </div>
                                <button
                                    onClick={() => handleJoin(community.id)}
                                    className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-all"
                                >
                                    Join
                                </button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
