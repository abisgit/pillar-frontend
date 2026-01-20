'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export function Rightbar() {
    return (
        <div className="hidden lg:block w-80 pl-8 space-y-6 sticky top-16 h-[calc(100vh-4rem)]">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4" />
                        Upcoming Events
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground pb-4">
                        No upcoming events.
                    </div>
                    <div className="p-3 bg-accent/10 border rounded-md mb-2">
                        <p className="font-medium text-sm">Stoic Sunday Hike</p>
                        <p className="text-xs text-muted-foreground">Tomorrow, 9:00 AM</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Suggested Communities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Deep Work Club</p>
                            <p className="text-xs text-muted-foreground">1.2k members</p>
                        </div>
                        <button className="text-xs font-semibold text-primary hover:underline">Join</button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Stoic Dads</p>
                            <p className="text-xs text-muted-foreground">850 members</p>
                        </div>
                        <button className="text-xs font-semibold text-primary hover:underline">Join</button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
