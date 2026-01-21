'use client';

import { use, useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { TopNav } from '@/components/layout/TopNav';
import { PILLAR_CATEGORIES } from '@/lib/constants';
import { LifeBalanceRadar } from '@/components/charts/LifeBalanceRadar';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Sparkles, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = {
    params: Promise<{ category: string }>;
};

interface Goal {
    id: string;
    title: string;
    category: string;
    horizon: string;
    isCompleted: boolean;
}

interface Template {
    id: string;
    title: string;
    category: string;
    description: string;
}

export default function PillarPage({ params }: Props) {
    const { category: slug } = use(params);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    // Find the original name from the slug
    const currentPillar = PILLAR_CATEGORIES.find(p =>
        p.name.toLowerCase().replace(/ & /g, '-').replace(/ \/ /g, '-').replace(/ /g, '-') === slug
    );
    const pillarName = currentPillar?.name || slug;

    useEffect(() => {
        fetchData();
    }, [pillarName]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [goalsRes, templatesRes] = await Promise.all([
                api.get('/goals'),
                api.get(`/goals/templates?category=${encodeURIComponent(pillarName)}`)
            ]);
            setGoals(goalsRes.data.filter((g: any) => g.category === pillarName));
            setTemplates(templatesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFromTemplate = async (template: Template) => {
        try {
            await api.post('/goals', {
                title: template.title,
                category: template.category,
                horizon: 'Daily',
                description: template.description
            });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleGoal = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/goals/${id}`, { isCompleted: !currentStatus });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // Dummy data for Radar - in a real app this would come from an analytics endpoint
    const radarData = [
        { label: 'Intensity', value: Math.min(100, (goals.length * 20) + 10) },
        { label: 'Consistency', value: goals.length > 0 ? (goals.filter(g => g.isCompleted).length / goals.length) * 100 : 0 },
        { label: 'Volume', value: 35.1 },
        { label: 'Velocity', value: 45.0 },
        { label: 'Spirit', value: 60.1 },
        { label: 'Focus', value: 35.1 },
        { label: 'Unity', value: 15.0 },
        { label: 'Legacy', value: 10.0 },
    ];

    return (
        <div className="min-h-screen bg-background">
            <TopNav />

            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-10">
                    <header className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter">{pillarName}</h1>
                            <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">Nexus Pillar</Badge>
                        </div>
                        <p className="text-muted-foreground font-bold text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" /> Master your domain.
                        </p>
                    </header>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Progress Chart */}
                        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-md rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 pb-0">
                                <CardTitle className="text-xs font-black uppercase tracking-widest opacity-40">Progress & Consistency</CardTitle>
                                <CardDescription className="text-[10px] font-bold">Vector analysis of your current trajectory.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 flex flex-col items-center">
                                <LifeBalanceRadar data={radarData} size={320} />
                            </CardContent>
                        </Card>

                        {/* Active Goals as Badges */}
                        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-md rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 pb-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest opacity-40">Active Disciplines</CardTitle>
                                <CardDescription className="text-[10px] font-bold">Your current encoded routines.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-10 pb-10">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-secondary/20 rounded-xl animate-pulse" />)}
                                    </div>
                                ) : goals.length === 0 ? (
                                    <div className="py-10 text-center space-y-4">
                                        <Target className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                                        <p className="text-sm font-bold opacity-30 italic">No disciplines active. Forge one below.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {goals.map(goal => (
                                            <Badge
                                                key={goal.id}
                                                variant="outline"
                                                onClick={() => toggleGoal(goal.id, goal.isCompleted)}
                                                className={cn(
                                                    "px-4 py-2 rounded-2xl cursor-pointer transition-all border-none text-xs font-bold uppercase tracking-tight flex items-center gap-2",
                                                    goal.isCompleted ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-secondary text-foreground hover:bg-secondary/80"
                                                )}
                                            >
                                                {goal.isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3 opacity-40" />}
                                                {goal.title}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="px-10 pb-10 pt-0">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 w-full flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-4 w-4 text-primary fill-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Current Power Level</span>
                                    </div>
                                    <span className="text-lg font-black italic tracking-tighter text-primary">{Math.max(0, goals.filter(g => g.isCompleted).length * 10)}%</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Suggestions Section */}
                    <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 ml-4">Suggested Disciplines</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {templates.map(template => (
                                <Card key={template.id} className="border-none shadow-xl bg-card/60 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <CardHeader className="p-6">
                                        <CardTitle className="text-lg font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">{template.title}</CardTitle>
                                        <CardDescription className="text-[10px] font-bold leading-relaxed line-clamp-2">{template.description}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="p-6 pt-0">
                                        <Button onClick={() => handleAddFromTemplate(template)} variant="ghost" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white border border-primary/10">Adopt Ritual</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </section>
                </main>
                <Rightbar />
            </div>
        </div>
    );
}
