'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageSquare, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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
    author: {
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
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
            const newPreviews: string[] = [];
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

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        // Note: Real implementation would need to sync with FileList which is read-only
        // For now, if they remove, we just clear and they can re-add if needed, 
        // or we use a more complex file state.
    };

    return (
        <div className="max-w-2xl mx-auto w-full space-y-6 pb-20">
            {/* Create Post */}
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex-shrink-0 overflow-hidden border">
                            {user?.image ? (
                                <img src={`${API_URL}${user.image}`} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-bold">{user?.name?.charAt(0)}</div>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <textarea
                                placeholder="Share your progress..."
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                className="w-full border-none bg-transparent shadow-none px-0 focus:ring-0 text-lg placeholder:text-muted-foreground/30 resize-none min-h-[80px]"
                            />

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-black/70 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <ImageIcon className="h-5 w-5" />
                                        <span>Media</span>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <Button
                                    onClick={handlePost}
                                    disabled={(!newPost.trim() && imagePreviews.length === 0)}
                                    className="rounded-full px-6"
                                >
                                    Post
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feed */}
            {loading ? (
                <div className="text-center py-10 space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground animate-pulse">Summoning the feed...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border border-dashed">
                    <p className="text-muted-foreground">The arena is empty. Start the first thread.</p>
                </div>
            ) : (
                posts.map(post => {
                    const isLiked = post.likes?.some(l => l.userId === user?.id);
                    return (
                        <Card key={post.id} className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-3 pb-3">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground overflow-hidden border">
                                    {post.author.image ? (
                                        <img src={`${API_URL}${post.author.image}`} alt={post.author.name} className="h-full w-full object-cover" />
                                    ) : (
                                        post.author.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-none mb-1">{post.author.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="border-t pt-3 pb-3 flex gap-4 text-muted-foreground">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={cn(
                                        "flex items-center gap-2 transition-all p-2 rounded-lg hover:bg-secondary text-sm font-medium",
                                        isLiked ? "text-red-500" : ""
                                    )}
                                >
                                    <Heart className={cn("h-4 w-4", isLiked ? "fill-current" : "")} />
                                    <span>{post._count?.likes || 0}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:bg-secondary p-2 rounded-lg transition-all text-sm font-medium">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{post._count?.comments || 0}</span>
                                </button>
                            </CardFooter>
                        </Card>
                    );
                })
            )}
        </div>
    )
}
