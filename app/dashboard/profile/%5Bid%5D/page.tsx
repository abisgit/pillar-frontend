'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { Heart, MessageSquare, UserPlus, UserMinus } from 'lucide-react';
import api from '@/lib/api';
import { TopNav } from '@/components/layout/TopNav';
import { cn } from '@/lib/utils';

const API_URL = 'http://localhost:4000';

interface PostImage {
    id: string;
    url: string;
}

interface Post {
    id: string;
    content: string;
    images: PostImage[];
    createdAt: string;
    _count: {
        likes: number;
        comments: number;
    }
}

interface UserProfile {
    id: string;
    name: string;
    image?: string;
    bio?: string;
    isFollowing: boolean;
    _count: {
        followers: number;
        following: number;
        posts: number;
    }
}

type Props = {
    params: Promise<{ id: string }>;
};

export default function UserProfilePage({ params }: Props) {
    const { id } = use(params);
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchPosts();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/users/${id}`);
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    }

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/posts/user/${id}`);
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    }

    const handleFollow = async () => {
        if (!profile) return;
        try {
            if (profile.isFollowing) {
                await api.delete(`/users/${id}/follow`);
            } else {
                await api.post(`/users/${id}/follow`);
            }
            fetchProfile(); // Refresh follower count and status
        } catch (error) {
            console.error("Failed to follow/unfollow", error);
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center font-bold">Summoning Profile...</div>;
    if (!profile) return <div className="flex h-screen items-center justify-center font-bold text-red-500">User not found.</div>;

    const isOwnProfile = currentUser?.id === id;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <TopNav />
            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-6">
                    <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-md">
                        <div className="h-40 bg-gradient-to-r from-primary to-secondary opacity-80" />
                        <CardContent className="pt-0 -mt-16 px-8 pb-8">
                            <div className="flex flex-col md:flex-row items-end gap-6">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full bg-secondary overflow-hidden border-4 border-background shadow-2xl flex items-center justify-center text-4xl font-bold">
                                        {profile.image ? (
                                            <img src={`${API_URL}${profile.image}`} alt={profile.name} className="h-full w-full object-cover" />
                                        ) : (
                                            profile.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 pb-2">
                                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">{profile.name}</h1>
                                    <p className="text-muted-foreground font-medium">"{profile.bio || "This warrior hasn't shared their oath yet."}"</p>
                                </div>
                                {!isOwnProfile && (
                                    <Button
                                        onClick={handleFollow}
                                        variant={profile.isFollowing ? "outline" : "default"}
                                        className="rounded-full px-8 font-bold uppercase tracking-widest text-xs h-12 mb-2"
                                    >
                                        {profile.isFollowing ? <><UserMinus className="mr-2 h-4 w-4" /> Unfollow</> : <><UserPlus className="mr-2 h-4 w-4" /> Follow</>}
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-12 mt-8 py-4 border-y border-border/20">
                                <div className="text-center md:text-left">
                                    <p className="font-black text-2xl">{profile._count.posts}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Reflections</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="font-black text-2xl">{profile._count.followers}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Followers</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="font-black text-2xl">{profile._count.following}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Following</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2 space-y-4">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                                <span className="h-1 w-8 bg-primary rounded-full" />
                                Journey Log
                            </h2>
                            {posts.length === 0 ? (
                                <div className="p-12 text-center border-2 border-dashed rounded-3xl opacity-40">
                                    No reflections mirrored yet.
                                </div>
                            ) : (
                                posts.map(post => (
                                    <Card key={post.id} className="border-none shadow-lg bg-card/40 backdrop-blur-sm overflow-hidden rounded-3xl">
                                        <CardContent className="pt-8 space-y-6">
                                            <p className="text-lg font-medium leading-relaxed">{post.content}</p>
                                            {post.images && post.images.length > 0 && (
                                                <div className={cn(
                                                    "grid gap-2 rounded-2xl overflow-hidden",
                                                    post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                                )}>
                                                    {post.images.map(img => (
                                                        <img
                                                            key={img.id}
                                                            src={`${API_URL}${img.url}`}
                                                            alt="Journey Media"
                                                            className="w-full h-full object-cover aspect-video hover:scale-[1.02] transition-transform duration-500"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="bg-secondary/20 pt-4 pb-4 px-8 flex gap-8 text-muted-foreground">
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <Heart className="h-5 w-5" />
                                                {post._count.likes}
                                            </div>
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <MessageSquare className="h-5 w-5" />
                                                {post._count.comments}
                                            </div>
                                            <div className="ml-auto font-black text-[10px] uppercase opacity-40 tracking-widest">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                                <span className="h-1 w-8 bg-secondary rounded-full" />
                                Mastery
                            </h2>
                            <Card className="border-none shadow-lg bg-card/40 rounded-3xl p-6">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Daily Disciplines</p>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[45%]" />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>Consistency</span>
                                        <span className="text-primary">45%</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
