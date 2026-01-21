'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/layout/Sidebar';
import { Rightbar } from '@/components/layout/Rightbar';
import { Calendar as CalendarIcon, MapPin, Plus, MessageSquare, Send, Users } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    community?: { name: string };
    _count: { attendees: number };
}

interface Message {
    id: string;
    content: string;
    createdAt: string;
    author: { name: string; image?: string };
}

export default function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newLoc, setNewLoc] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchMessages(selectedEventId);
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
            if (res.data.length > 0 && !selectedEventId) {
                setSelectedEventId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (eventId: string) => {
        // We'll need a backend route for event messages, for now mock or add soon
        // Let's assume /api/events/:id/messages
        try {
            // const res = await api.get(`/events/${eventId}/messages`);
            // setMessages(res.data);
            setMessages([]); // Placeholder for now
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async () => {
        if (!newTitle || !newDate) return;
        try {
            await api.post('/events', {
                title: newTitle,
                description: newDesc,
                date: newDate,
                location: newLoc
            });
            setShowCreateModal(false);
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoin = async (id: string) => {
        try {
            await api.post(`/events/${id}/join`);
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage || !selectedEventId) return;
        // Mock sending message
        const mockMsg: Message = {
            id: Math.random().toString(),
            content: newMessage,
            createdAt: new Date().toISOString(),
            author: { name: user?.name || 'Warrior' }
        };
        setMessages([...messages, mockMsg]);
        setNewMessage('');
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <TopNav />

            <div className="flex max-w-7xl mx-auto items-start">
                <Sidebar />
                <main className="flex-1 p-6 space-y-8 h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center shrink-0">
                        <div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Convocations</h1>
                            <p className="text-muted-foreground font-semibold text-xs uppercase tracking-widest">Rituals of the collective.</p>
                        </div>
                        <Button onClick={() => setShowCreateModal(true)} className="rounded-full px-8 font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" /> Summon Event
                        </Button>
                    </div>

                    <div className="flex-1 flex gap-6 overflow-hidden">
                        {/* Event List */}
                        <div className="w-1/3 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-secondary/20 rounded-2xl" />)}
                                </div>
                            ) : events.length === 0 ? (
                                <p className="text-muted-foreground italic text-center py-20">No convocations pending.</p>
                            ) : (
                                events.map(event => (
                                    <Card
                                        key={event.id}
                                        onClick={() => setSelectedEventId(event.id)}
                                        className={cn(
                                            "cursor-pointer border-none transition-all rounded-3xl overflow-hidden",
                                            selectedEventId === event.id ? "bg-primary text-primary-foreground shadow-xl ring-2 ring-primary" : "bg-card/40 hover:bg-card/80 shadow-md"
                                        )}
                                    >
                                        <CardHeader className="p-5 pb-2">
                                            <CardTitle className="text-lg font-black uppercase italic leading-tight">{event.title}</CardTitle>
                                            <p className={cn("text-[10px] font-bold uppercase tracking-widest", selectedEventId === event.id ? "text-primary-foreground/70" : "text-primary")}>
                                                {event.community?.name || 'Global Event'}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="p-5 pt-2 space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80">
                                                <CalendarIcon className="h-3 w-3" />
                                                {new Date(event.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80">
                                                <MapPin className="h-3 w-3" />
                                                {event.location || 'Echo Realm'}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Event Detail & Chat */}
                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                            {selectedEvent ? (
                                <>
                                    <div className="bg-card/40 rounded-[2.5rem] p-8 border shadow-xl shrink-0">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-4">
                                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{selectedEvent.title}</h2>
                                                <p className="text-muted-foreground font-medium text-sm max-w-lg">{selectedEvent.description || "The purpose of this gathering is yet to be revealed."}</p>
                                                <div className="flex gap-6 pt-2">
                                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                                        <Users className="h-4 w-4 text-primary" />
                                                        {selectedEvent._count.attendees} Warriors
                                                    </div>
                                                </div>
                                            </div>
                                            <Button onClick={() => handleJoin(selectedEvent.id)} className="rounded-full px-10 h-14 font-black uppercase tracking-widest text-xs">Join Oath</Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-card/20 rounded-[2.5rem] border flex flex-col overflow-hidden backdrop-blur-sm">
                                        <div className="p-6 border-b bg-card/30 flex items-center justify-between shrink-0">
                                            <h3 className="font-black italic uppercase text-xs tracking-widest flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-primary" />
                                                War Council (Discussion)
                                            </h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                                            {messages.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                                                    <MessageSquare className="h-16 w-16 mb-4" />
                                                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Silence before the storm.</p>
                                                </div>
                                            ) : (
                                                messages.map(msg => (
                                                    <div key={msg.id} className="flex flex-col gap-1 max-w-[80%]">
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">{msg.author.name}</p>
                                                        <div className="bg-card p-4 rounded-3xl shadow-sm border border-primary/10">
                                                            <p className="text-sm font-medium">{msg.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-6 bg-card/40 border-t flex gap-4 shrink-0">
                                            <Input
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Speak your mind..."
                                                className="rounded-2xl h-12 border-none shadow-inner"
                                            />
                                            <Button onClick={handleSendMessage} className="rounded-2xl h-12 w-12 p-0"><Send className="h-5 w-5" /></Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-[3.5rem] opacity-20">
                                    <p className="font-black uppercase tracking-[0.5em]">Select an Event</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                <Rightbar />
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <Card className="w-full max-w-lg border-none shadow-2xl rounded-[3rem] overflow-hidden">
                        <CardHeader className="bg-secondary text-secondary-foreground p-10">
                            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">Summon a Convocation</CardTitle>
                            <CardDescription className="text-secondary-foreground/80 font-bold text-xs uppercase tracking-widest">Set the time and place for unity.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Event Title</label>
                                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Dawn of Discipline" className="rounded-2xl h-12" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Agenda / Description</label>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="What will transpire?"
                                    className="w-full bg-background border rounded-2xl p-4 min-h-[100px] text-sm focus:outline-primary"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Date & Time</label>
                                    <Input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} className="rounded-2xl h-12" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Location</label>
                                    <Input value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="e.g. Virtual Arena" className="rounded-2xl h-12" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-10 pt-0 flex gap-4">
                            <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs">Dismiss</Button>
                            <Button onClick={handleCreate} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-xs">Summon</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
