'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { TopNav } from '@/components/layout/TopNav';
import api from '@/lib/api';
import { Users, MapPin, Calendar, MessageSquare, History, Shield, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'http://localhost:4000';

interface Community {
    id: string;
    name: string;
    description: string;
    city: string;
    creatorId: string;
    members: any[];
    _count: {
        members: number;
        posts: number;
        events: number;
    }
}

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        fetchCommunity();
    }, [id]);

    const fetchCommunity = async () => {
        try {
            const res = await api.get(`/communities`);
            // Since I don't have a single /communities/:id yet, I'll filter or I should add it.
            // Wait, I should add a backend endpoint for single community.
            const item = res.data.find((c: any) => c.id === id);
            setCommunity(item);

            // Check membership
            const myRes = await api.get('/communities?type=my');
            setIsMember(myRes.data.some((c: any) => c.id === id));
        } catch (error) {
            console.error("Failed to fetch community", error);
        } finally {
            setLoading(false);
        }
    }

    const handleJoin = async () => {
        try {
            await api.post(`/communities/${id}/join`);
            setIsMember(true);
            fetchCommunity();
        } catch (error) {
            console.error("Failed to join", error);
        }
    }

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest">Entering Tribe Sanctum...</div>;
    if (!community) return <div className="p-20 text-center font-black">Tribe Lost to Time.</div>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <TopNav />
            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-8">
                    {/* Hero Section */}
                    <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/40 backdrop-blur-md">
                        <div className="h-64 bg-gradient-to-br from-primary/30 via-secondary/20 to-background w-full relative">
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute bottom-8 left-10 flex items-end gap-6">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-card border-4 border-background shadow-2xl flex items-center justify-center">
                                    <Users className="h-16 w-16 text-primary" />
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">{community.name}</h1>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-white/80 text-[10px] font-black uppercase tracking-widest">
                                            <MapPin className="h-3 w-3" /> {community.city || 'Undisclosed Location'}
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-white/40" />
                                        <div className="text-white/80 text-[10px] font-black uppercase tracking-widest">
                                            {community._count.members} Warriors Strong
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-8 right-10">
                                {isMember ? (
                                    <Button variant="secondary" className="rounded-full px-8 font-black uppercase tracking-widest text-xs h-12 shadow-xl border border-white/10">
                                        <Shield className="h-4 w-4 mr-2" /> Vanguard Member
                                    </Button>
                                ) : (
                                    <Button onClick={handleJoin} className="rounded-full px-10 font-black uppercase tracking-widest text-xs h-12 shadow-2xl">
                                        Join The Oath
                                    </Button>
                                )}
                            </div>
                        </div>
                        <CardContent className="p-10 pt-16 grid md:grid-cols-3 gap-10">
                            <div className="md:col-span-2 space-y-8">
                                <section className="space-y-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Tribe Covenant</h2>
                                    <p className="text-xl leading-relaxed font-medium">{community.description || "A collective of warriors dedicated to mutual growth and unyielding discipline."}</p>
                                </section>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-secondary/20 p-6 rounded-[2rem] text-center border border-white/5">
                                        <p className="text-3xl font-black italic tracking-tighter text-primary">{community._count.posts}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Reflections</p>
                                    </div>
                                    <div className="bg-secondary/20 p-6 rounded-[2rem] text-center border border-white/5">
                                        <p className="text-3xl font-black italic tracking-tighter text-primary">{community._count.events}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Convocations</p>
                                    </div>
                                    <div className="bg-secondary/20 p-6 rounded-[2rem] text-center border border-white/5">
                                        <p className="text-3xl font-black italic tracking-tighter text-primary">0</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Glory Points</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 italic">Tribe Pillars</h2>
                                <Card className="bg-background/40 border-none rounded-[2rem] overflow-hidden">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <Trophy className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">Active Quests</p>
                                                <p className="text-[10px] font-bold opacity-40">3 Disciplines in progress</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="h-10 w-10 rounded-2xl bg-secondary/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                                                <History className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">History Log</p>
                                                <p className="text-[10px] font-bold opacity-40">Recent tribe activity</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
