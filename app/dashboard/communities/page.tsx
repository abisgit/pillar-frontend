'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { MapPin, Users } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

interface Community {
    id: string;
    name: string;
    description: string;
    city: string;
    _count: { members: number };
}

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/communities')
            .then(res => setCommunities(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <TopNav />

            <div className="flex max-w-7xl mx-auto">
                <Sidebar />
                <main className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Communities</h1>
                        <Button>Create Community</Button>
                    </div>

                    {loading ? (
                        <div>Loading tribes...</div>
                    ) : communities.length === 0 ? (
                        <div className="text-muted-foreground">No communities found. Be the first to start a tribe.</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {communities.map(community => (
                                <Card key={community.id}>
                                    <CardHeader>
                                        <CardTitle>{community.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {community.city || 'Global'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm line-clamp-2">{community.description}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between border-t pt-4">
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            {community._count.members} Members
                                        </div>
                                        <Button size="sm" variant="outline">Join</Button>
                                    </CardFooter>
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
