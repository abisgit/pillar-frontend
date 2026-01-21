'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { MapPin, Users, Plus, Shield, Compass } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Community {
    id: string;
    name: string;
    description: string;
    city: string;
    _count: { members: number };
}

export default function CommunitiesPage() {
    const [myCommunities, setMyCommunities] = useState<Community[]>([]);
    const [suggestedCommunities, setSuggestedCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'my' | 'suggested'>('suggested');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Modal State
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCity, setNewCity] = useState('');

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const [myRes, sugRes] = await Promise.all([
                api.get('/communities?type=my'),
                api.get('/communities?type=suggested')
            ]);
            setMyCommunities(myRes.data);
            setSuggestedCommunities(sugRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName) return;
        try {
            await api.post('/communities', {
                name: newName,
                description: newDesc,
                city: newCity
            });
            setShowCreateModal(false);
            setNewName('');
            setNewDesc('');
            setNewCity('');
            fetchCommunities();
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoin = async (id: string) => {
        try {
            await api.post(`/communities/${id}/join`);
            fetchCommunities();
        } catch (err) {
            console.error(err);
        }
    };

    const currentList = activeTab === 'my' ? myCommunities : suggestedCommunities;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <TopNav />

            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Tribes</h1>
                            <p className="text-muted-foreground font-semibold text-xs uppercase tracking-widest">Find your squad. Forge your legacy.</p>
                        </div>
                        <Button onClick={() => setShowCreateModal(true)} className="rounded-full px-8 font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" /> Create Tribe
                        </Button>
                    </div>

                    <div className="flex gap-2 p-1 bg-secondary/20 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('suggested')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === 'suggested' ? "bg-card shadow-sm" : "hover:bg-card/50 opacity-60"
                            )}
                        >
                            <Compass className="inline-block mr-2 h-3 w-3" /> Discover
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={cn(
                                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === 'my' ? "bg-card shadow-sm" : "hover:bg-card/50 opacity-60"
                            )}
                        >
                            <Shield className="inline-block mr-2 h-3 w-3" /> My Tribes
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20 animate-pulse font-black uppercase tracking-[0.5em] text-muted-foreground">Gathering the Tribes...</div>
                    ) : currentList.length === 0 ? (
                        <div className="text-center py-32 border-2 border-dashed rounded-3xl opacity-40">
                            <p className="font-bold">No tribes found in this realm.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {currentList.map(community => (
                                <Link key={community.id} href={`/dashboard/communities/${community.id}`}>
                                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-md rounded-3xl overflow-hidden group hover:scale-[1.01] transition-transform cursor-pointer">
                                        <div className="h-24 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 transition-colors" />
                                        <CardHeader className="-mt-8">
                                            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">{community.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                                                <MapPin className="h-3 w-3 text-primary" />
                                                {community.city || 'Global Nexus'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-medium leading-relaxed line-clamp-2 opacity-80">{community.description}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-between items-center bg-secondary/5 pt-4 pb-4 px-6">
                                            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest opacity-60">
                                                <Users className="h-4 w-4" />
                                                {community._count.members} Members
                                            </div>
                                            {activeTab === 'suggested' && (
                                                <Button onClick={(e) => { e.preventDefault(); handleJoin(community.id); }} size="sm" className="rounded-full px-6 font-black uppercase text-[10px]">Join Tribe</Button>
                                            )}
                                            {activeTab === 'my' && (
                                                <Button variant="ghost" size="sm" className="rounded-full px-6 font-black uppercase text-[10px]">Enter Hall</Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
                <Rightbar />
            </div>

            {/* Create Community Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-lg border-none shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-primary text-primary-foreground p-8">
                            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Forge a New Tribe</CardTitle>
                            <CardDescription className="text-primary-foreground/80 font-bold text-xs uppercase tracking-widest">Establish a domain for shared growth.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Tribe Name</label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Iron Will Collective" className="rounded-xl h-12" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Mission / Description</label>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="What is your tribe's oath?"
                                    className="w-full bg-background border rounded-xl p-4 min-h-[100px] text-sm focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Base of Operations (City)</label>
                                <Input value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="e.g. Neo Tokyo" className="rounded-xl h-12" />
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 flex gap-4">
                            <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-xs">Retreat</Button>
                            <Button onClick={handleCreate} className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-xs">Found Tribe</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
