'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PILLAR_CATEGORIES } from '@/lib/constants';
import api from '@/lib/api';
import { X } from 'lucide-react';

interface CreateGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoalCreated?: () => void;
}

export function CreateGoalModal({ isOpen, onClose, onGoalCreated }: CreateGoalModalProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(PILLAR_CATEGORIES[0].name);
    const [horizon, setHorizon] = useState('Daily');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title) return;
        setLoading(true);
        try {
            await api.post('/goals', {
                title,
                category,
                horizon,
                description
            });
            onClose();
            if (onGoalCreated) onGoalCreated();
        } catch (error) {
            console.error("Failed to create goal", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-lg border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/90">
                <CardHeader className="bg-primary text-primary-foreground p-10 relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                    <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Forge a New Routine</CardTitle>
                    <CardDescription className="text-primary-foreground/80 font-bold text-xs uppercase tracking-widest">Establish a new discipline for your journey.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Routine Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 5 AM Morning Ritual" className="rounded-2xl h-12" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Pillar</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full h-12 rounded-2xl bg-background border px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                                {PILLAR_CATEGORIES.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Cycle</label>
                            <select
                                value={horizon}
                                onChange={e => setHorizon(e.target.value)}
                                className="w-full h-12 rounded-2xl bg-background border px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Details (Optional)</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What does mastery look like here?"
                            className="w-full bg-background border rounded-2xl p-4 min-h-[100px] text-sm focus:outline-primary"
                        />
                    </div>
                </CardContent>
                <CardFooter className="p-10 pt-0">
                    <Button onClick={handleSubmit} disabled={loading} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs">
                        {loading ? "Engraving..." : "Commit Routine"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
