'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { ContributionGraph } from '@/components/ContributionGraph';
import { Camera, Edit2, Save, X, Heart, MessageSquare, Settings, Plus } from 'lucide-react';
import api from '@/lib/api';
import { TopNav } from '@/components/layout/TopNav';
import { cn } from '@/lib/utils';
import { CreateGoalModal } from '@/components/modals/CreateGoalModal';
import Link from 'next/link';

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

export default function ProfilePage() {
    const { user, login, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [userPosts, setUserPosts] = useState<Post[]>([]);

    useEffect(() => {
        setIsMounted(true);
        if (user?.id) {
            fetchUserPosts();
        }
    }, [user?.id]);

    useEffect(() => {
        if (user && !isEditing) {
            setName(user.name || '');
            setBio(user.bio || '');
        }
    }, [user, isEditing]);

    const fetchUserPosts = async () => {
        try {
            const res = await api.get(`/posts/user/${user?.id}`);
            setUserPosts(res.data);
        } catch (error) {
            console.error("Failed to fetch user posts", error);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('bio', bio);
        if (fileInputRef.current?.files?.[0]) {
            formData.append('avatar', fileInputRef.current.files[0]);
        }

        try {
            const res = await api.put('/users/profile', formData);
            updateUser(res.data);
            setIsEditing(false);
            setAvatarPreview(null);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const avatarUrl = avatarPreview || (user?.image ? (isMounted ? `${API_URL}${user.image}?t=${Date.now()}` : `${API_URL}${user.image}`) : null);

    return (
        <div className="min-h-screen bg-background">
            <TopNav />

            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-6 overflow-y-auto">

                    {/* Profile Header Card */}
                    <Card className="border-none shadow-sm overflow-hidden bg-card/50">
                        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 w-full" />
                        <CardContent className="pt-0 -mt-12 px-8 pb-8">
                            <div className="flex flex-col md:flex-row items-end gap-6 text-center md:text-left">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full bg-secondary overflow-hidden border-4 border-background shadow-lg flex items-center justify-center text-4xl font-bold text-muted-foreground mx-auto md:mx-0">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            user?.name?.charAt(0)
                                        )}
                                    </div>

                                    {isEditing && (
                                        <div
                                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="text-white h-8 w-8" />
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2 pb-2">
                                    {isEditing ? (
                                        <div className="space-y-3 max-w-sm">
                                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display Name" className="text-xl font-bold" />
                                            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio..." className="text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="text-3xl font-bold tracking-tight">{user?.name}</h1>
                                            <p className="text-muted-foreground italic">"{user?.bio || "On a journey to mastery."}"</p>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-2 pb-2">
                                    {isEditing ? (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" onClick={handleSave} className="rounded-full px-6">
                                                <Save className="h-4 w-4 mr-2" />
                                                Save
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-full px-6">
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-8 mt-6 pt-6 border-t border-border/50 justify-center md:justify-start">
                                <div className="text-center md:text-left">
                                    <p className="font-bold text-xl">{userPosts.length}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Posts</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="font-bold text-xl">0</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Followers</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="font-bold text-xl">0</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Following</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consistency Graph */}
                    <div className="bg-card/50 p-6 rounded-xl border border-border/50 shadow-sm backdrop-blur-sm">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Consistency</h2>
                        <ContributionGraph />
                    </div>

                    {/* Content Tabs */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Left/Main Column: Posts */}
                        <div className="md:col-span-2 space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Recent Activity
                            </h2>
                            {userPosts.length === 0 ? (
                                <Card className="border-dashed bg-transparent">
                                    <CardContent className="p-8 text-center text-muted-foreground">
                                        No reflections shared yet.
                                    </CardContent>
                                </Card>
                            ) : (
                                userPosts.map(post => (
                                    <Card key={post.id} className="border-none shadow-sm">
                                        <CardContent className="pt-6 space-y-4">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                            {post.images && post.images.length > 0 && (
                                                <div className={cn(
                                                    "grid gap-1 rounded-xl overflow-hidden border",
                                                    post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                                )}>
                                                    {post.images.map(img => (
                                                        <img
                                                            key={img.id}
                                                            src={`${API_URL}${img.url}`}
                                                            alt="Post content"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="border-t border-border/50 pt-3 pb-3 flex gap-6 text-muted-foreground text-xs font-semibold">
                                            <div className="flex items-center gap-2">
                                                <Heart className="h-3.5 w-3.5" />
                                                {post._count.likes}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                {post._count.comments}
                                            </div>
                                            <div className="ml-auto uppercase tracking-tighter opacity-60">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Right Column: Routines */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Settings className="h-4 w-4" /> Disciplines
                            </h2>
                            <Link href="/dashboard/routines">
                                <Card className="border-none shadow-sm bg-card/60 hover:bg-card/80 transition-all cursor-pointer rounded-[2rem] overflow-hidden group">
                                    <CardHeader className="p-8">
                                        <CardTitle className="text-xl font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">My Routines</CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Daily systems of unyielding growth</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-8">
                                        <Button onClick={(e) => { e.preventDefault(); setShowRoutineModal(true); }} variant="outline" className="w-full justify-start text-muted-foreground border-dashed bg-transparent hover:bg-primary/10 hover:text-primary rounded-xl">
                                            + Summon Ritual
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </main>
                <Rightbar />
            </div>

            <CreateGoalModal isOpen={showRoutineModal} onClose={() => setShowRoutineModal(false)} />
        </div>
    );
}
