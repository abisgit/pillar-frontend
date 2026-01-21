'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageSquare, Image as ImageIcon, X, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const API_URL = 'http://localhost:4000';

interface PostImage {
    id: string;
    url: string;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        image?: string;
    }
}

interface Post {
    id: string;
    content: string;
    images: PostImage[];
    author: {
        id: string;
        name: string;
        image?: string;
    };
    createdAt: string;
    likes: any[];
    _count: {
        likes: number;
        comments: number;
    }
}

export function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [newComment, setNewComment] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to load feed", error);
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handlePost = async () => {
        if (!newPost.trim() && (!fileInputRef.current?.files || fileInputRef.current.files.length === 0)) return;

        const formData = new FormData();
        formData.append('content', newPost);

        if (fileInputRef.current?.files) {
            Array.from(fileInputRef.current.files).forEach(file => {
                formData.append('images', file);
            });
        }

        try {
            const res = await api.post('/posts', formData);
            setPosts([res.data, ...posts]);
            setNewPost('');
            setImagePreviews([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Failed to create post", error);
        }
    }

    const handleLike = async (postId: string) => {
        try {
            await api.put(`/posts/${postId}/like`);
            fetchPosts();
        } catch (error) {
            console.error("Failed to like post", error);
        }
    }

    const toggleComments = async (postId: string) => {
        if (expandedPostId === postId) {
            setExpandedPostId(null);
            return;
        }
        setExpandedPostId(postId);
        try {
            const res = await api.get(`/posts/${postId}/comments`);
            setComments(prev => ({ ...prev, [postId]: res.data }));
        } catch (error) {
            console.error("Failed to fetch comments", error);
        }
    }

    const handleSendComment = async (postId: string) => {
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/posts/${postId}/comment`, { content: newComment });
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), res.data]
            }));
            setNewComment('');
            // Update local post comment count
            setPosts(posts.map(p => p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p));
        } catch (error) {
            console.error("Failed to send comment", error);
        }
    }

    const handleFollow = async (userId: string) => {
        try {
            await api.post(`/users/${userId}/follow`);
            // Optionally show a toast or change button state
        } catch (error) {
            console.error("Failed to follow user", error);
        }
    }

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-2xl mx-auto w-full space-y-8 pb-20">
            {/* Create Post */}
            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                <CardContent className="pt-8 px-8 pb-6">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-secondary flex-shrink-0 overflow-hidden border-2 border-background shadow-lg">
                            {user?.image ? (
                                <img src={isMounted ? `${API_URL}${user.image}?t=${Date.now()}` : `${API_URL}${user.image}`} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm font-black">{user?.name?.charAt(0).toUpperCase()}</div>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <textarea
                                placeholder="Reflect on your mastery..."
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                className="w-full border-none bg-transparent shadow-none px-0 focus:ring-0 text-xl font-medium placeholder:text-muted-foreground/30 resize-none min-h-[100px]"
                            />

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border shadow-inner group">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-border/20">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-muted-foreground hover:text-primary transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                                >
                                    <ImageIcon className="h-5 w-5" />
                                    <span>Append Media</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <Button
                                    onClick={handlePost}
                                    disabled={(!newPost.trim() && imagePreviews.length === 0)}
                                    className="rounded-full px-10 h-10 font-black uppercase tracking-widest text-[10px]"
                                >
                                    Broadcast
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feed */}
            {loading ? (
                <div className="text-center py-20 space-y-4 font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
                    Gathering Reflections...
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-[3rem] opacity-30">
                    <p className="font-bold">The nexus is silent. Be the first to speak.</p>
                </div>
            ) : (
                posts.map(post => {
                    const isLiked = post.likes?.some(l => l.userId === user?.id);
                    return (
                        <Card key={post.id} className="border-none shadow-2xl bg-card/50 backdrop-blur-sm rounded-[3rem] overflow-hidden transition-all hover:translate-y-[-2px]">
                            <CardHeader className="flex flex-row items-center gap-4 p-8 pb-4">
                                <Link href={post.author.id === user?.id ? '/dashboard/profile' : `/dashboard/profile/${post.author.id}`}>
                                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-xl font-black overflow-hidden border-2 border-background shadow-md cursor-pointer hover:border-primary transition-colors">
                                        {post.author.image ? (
                                            <img src={isMounted ? `${API_URL}${post.author.image}?t=${Date.now()}` : `${API_URL}${post.author.image}`} alt={post.author.name} className="h-full w-full object-cover" />
                                        ) : (
                                            post.author.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </Link>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Link href={post.author.id === user?.id ? '/dashboard/profile' : `/dashboard/profile/${post.author.id}`}>
                                            <p className="font-black text-lg italic uppercase tracking-tighter cursor-pointer hover:text-primary transition-colors">{post.author.name}</p>
                                        </Link>
                                        {post.author.id !== user?.id && (
                                            <button
                                                onClick={() => handleFollow(post.author.id)}
                                                className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all"
                                            >
                                                + Follow
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 px-8 py-0">
                                <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                {post.images && post.images.length > 0 && (
                                    <div className={cn(
                                        "grid gap-2 rounded-[2.5rem] overflow-hidden shadow-inner",
                                        post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                    )}>
                                        {post.images.map(img => (
                                            <img
                                                key={img.id}
                                                src={`${API_URL}${img.url}`}
                                                alt="Post content"
                                                className="w-full h-full object-cover aspect-video hover:scale-[1.02] transition-transform duration-500"
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-6 pb-8 px-8 flex flex-col items-stretch gap-6">
                                <div className="flex gap-8 text-muted-foreground border-t border-border/20 pt-6">
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={cn(
                                            "flex items-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest hover:text-red-500",
                                            isLiked ? "text-red-500" : ""
                                        )}
                                    >
                                        <Heart className={cn("h-5 w-5", isLiked ? "fill-current" : "")} />
                                        <span>{post._count?.likes || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => toggleComments(post.id)}
                                        className="flex items-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest hover:text-primary"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        <span>{post._count?.comments || 0}</span>
                                    </button>
                                </div>

                                {expandedPostId === post.id && (
                                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                            {comments[post.id]?.map(comment => (
                                                <div key={comment.id} className="flex gap-3 items-start">
                                                    <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden shrink-0 border">
                                                        {comment.author.image ? (
                                                            <img src={`${API_URL}${comment.author.image}`} alt={comment.author.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-[10px] font-black">{comment.author.name.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                    <div className="bg-secondary/20 p-3 rounded-2xl flex-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{comment.author.name}</p>
                                                        <p className="text-xs font-medium">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendComment(post.id)}
                                                placeholder="Write a comment..."
                                                className="rounded-full bg-secondary/10 border-none shadow-inner text-sm px-6"
                                            />
                                            <Button onClick={() => handleSendComment(post.id)} className="rounded-full w-10 h-10 p-0"><Send className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })
            )}
        </div>
    )
}
