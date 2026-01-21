'use client';

import { use, useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TopNav } from '@/components/layout/TopNav';
import { PILLAR_CATEGORIES } from '@/lib/constants';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Plus, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    params: Promise<{ category: string }>;
};

interface GoalTemplate {
    id: string;
    title: string;
    horizon: string;
}

interface Goal {
    id: string;
    title: string;
    category: string;
    horizon: string;
    isCompleted: boolean;
}

export default function PillarPage({ params }: Props) {
    const { category } = use(params);
    const [templates, setTemplates] = useState<GoalTemplate[]>([]);
    const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    // Find original name from slug
    const currentPillar = PILLAR_CATEGORIES.find(p =>
        p.name.toLowerCase().replace(/ & /g, '-').replace(/ \/ /g, '-').replace(/ /g, '-') === category
    );

    const pillarName = currentPillar?.name || category;

    useEffect(() => {
        if (currentPillar) {
            fetchData();
        }
    }, [category]);

    const fetchData = async () => {
        try {
            const [tempRes, goalRes] = await Promise.all([
                api.get(`/goals/templates?category=${encodeURIComponent(pillarName)}`),
                api.get('/goals')
            ]);
            setTemplates(tempRes.data);
            setActiveGoals(goalRes.data.filter((g: any) => g.category === pillarName));
        } catch (error) {
            console.error("Failed to fetch pillar data", error);
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (template: GoalTemplate) => {
        try {
            const res = await api.post('/goals', {
                title: template.title,
                category: pillarName,
                horizon: template.horizon
            });
            setActiveGoals([res.data, ...activeGoals]);
        } catch (error) {
            console.error("Failed to add goal", error);
        }
    };

    const toggleGoal = async (goal: Goal) => {
        try {
            const res = await api.put(`/goals/${goal.id}`, {
                isCompleted: !goal.isCompleted
            });
            setActiveGoals(activeGoals.map(g => g.id === goal.id ? res.data : g));
            // Trigger a refresh of the contribution graph if needed (global state would be better)
        } catch (error) {
            console.error("Failed to toggle goal", error);
        }
    };

    if (!currentPillar) return <div>Pillar not found</div>;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <TopNav />

            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-8">
                    <div className="relative p-12 rounded-3xl overflow-hidden bg-card border shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" />
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter">{pillarName}</h1>
                                <p className="text-muted-foreground font-semibold tracking-widest text-xs uppercase">Forge your discipline in this domain.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 text-center min-w-[100px]">
                                    <p className="text-2xl font-black text-primary">{activeGoals.filter(g => g.isCompleted).length}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Done Today</p>
                                </div>
                                <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 text-center min-w-[100px]">
                                    <p className="text-2xl font-black text-secondary">{activeGoals.length}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Total Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Suggested / Templates Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500 fill-current" />
                                Suggested Routines
                            </h2>
                            <div className="grid gap-3">
                                {['Daily', 'Weekly', 'Occasional'].map(horizon => (
                                    <div key={horizon} className="space-y-3">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pt-2">{horizon}</h3>
                                        {templates.filter(t => t.horizon === horizon).length === 0 ? (
                                            <p className="text-xs italic text-muted-foreground/50 px-2">No templates for this cycle.</p>
                                        ) : (
                                            templates.filter(t => t.horizon === horizon).map(temp => (
                                                <button
                                                    key={temp.id}
                                                    onClick={() => addGoal(temp)}
                                                    className="w-full group flex items-center justify-between p-4 rounded-2xl bg-card border hover:border-primary transition-all text-left shadow-sm hover:shadow-md"
                                                >
                                                    <span className="font-bold text-sm">{temp.title}</span>
                                                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                                </button>
                                            ))
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Goals Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-primary fill-current" />
                                My Active Battle
                            </h2>
                            <div className="space-y-3">
                                {activeGoals.length === 0 ? (
                                    <div className="p-12 text-center border-2 border-dashed rounded-3xl bg-secondary/5">
                                        <p className="text-muted-foreground font-medium">The field is clear. Choose a routine from the left to begin.</p>
                                    </div>
                                ) : (
                                    activeGoals.map(goal => (
                                        <div
                                            key={goal.id}
                                            className={cn(
                                                "flex items-center gap-4 p-5 rounded-2xl border transition-all shadow-sm",
                                                goal.isCompleted ? "bg-primary/5 border-primary/20 opacity-70" : "bg-card hover:border-primary/40"
                                            )}
                                        >
                                            <button onClick={() => toggleGoal(goal)} className="transition-transform active:scale-95">
                                                {goal.isCompleted ? (
                                                    <CheckCircle className="h-6 w-6 text-primary fill-current" />
                                                ) : (
                                                    <Circle className="h-6 w-6 text-muted-foreground" />
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <p className={cn("font-bold", goal.isCompleted && "line-through text-muted-foreground")}>{goal.title}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{goal.horizon}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
