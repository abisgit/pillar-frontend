'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { TopNav } from '@/components/layout/TopNav';
import { PILLAR_CATEGORIES } from '@/lib/constants';
import api from '@/lib/api';
import { CheckCircle2, Circle, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Goal {
    id: string;
    title: string;
    category: string;
    horizon: string;
    isCompleted: boolean;
    completedAt: string | null;
}

export default function RoutinesPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            setGoals(res.data);
        } catch (error) {
            console.error("Failed to fetch goals", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGoal = async (id: string, currentStatus: boolean) => {
        try {
            const res = await api.put(`/goals/${id}`, { isCompleted: !currentStatus });
            setGoals(goals.map(g => g.id === id ? res.data : g));
        } catch (error) {
            console.error("Failed to update goal", error);
        }
    };

    const groupedGoals = PILLAR_CATEGORIES.reduce((acc, pillar) => {
        const pillarGoals = goals.filter(g => g.category === pillar.name);
        if (pillarGoals.length > 0) {
            acc[pillar.name] = pillarGoals;
        }
        return acc;
    }, {} as Record<string, Goal[]>);

    return (
        <div className="min-h-screen bg-background">
            <TopNav />
            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-8">
                    <header className="space-y-2">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">My Disciplines</h1>
                        <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                            <Flame className="h-4 w-4 text-primary fill-primary" />
                            Daily Rhythms of Excellence
                        </p>
                    </header>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-40 bg-card/50 rounded-[2.5rem]" />
                            ))}
                        </div>
                    ) : Object.keys(groupedGoals).length === 0 ? (
                        <Card className="border-dashed bg-transparent rounded-[3rem] p-20 text-center">
                            <p className="font-bold text-muted-foreground italic">No disciplines forged yet. Go to Pillars to summon some.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Object.entries(groupedGoals).map(([category, catGoals]) => (
                                <section key={category} className="space-y-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-4">{category}</h2>
                                    <div className="space-y-3">
                                        {catGoals.map(goal => (
                                            <Card
                                                key={goal.id}
                                                className={cn(
                                                    "border-none shadow-lg rounded-[2rem] transition-all duration-500 overflow-hidden group hover:scale-[1.02]",
                                                    goal.isCompleted ? "bg-primary/5 opacity-60" : "bg-card/80"
                                                )}
                                            >
                                                <CardContent className="p-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => toggleGoal(goal.id, goal.isCompleted)}
                                                            className={cn(
                                                                "h-8 w-8 rounded-full flex items-center justify-center transition-all",
                                                                goal.isCompleted ? "bg-primary text-white" : "border-2 border-primary/20 hover:border-primary"
                                                            )}
                                                        >
                                                            {goal.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5 opacity-20" />}
                                                        </button>
                                                        <div>
                                                            <p className={cn("font-bold text-lg tracking-tight", goal.isCompleted && "line-through")}>{goal.title}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{goal.horizon}</span>
                                                                {goal.isCompleted && goal.completedAt && (
                                                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">
                                                                        Last done: {new Date(goal.completedAt).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {goal.isCompleted && <Trophy className="h-5 w-5 text-yellow-500 animate-bounce" />}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
