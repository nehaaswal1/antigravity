export interface TravelPreferences {
    destination: string;
    durationDays: number;
    budget: 'Budget' | 'Moderate' | 'Luxury';
    pace: 'Relaxed' | 'Balanced' | 'Action-Packed';
    interests: string[];
    dietary: string;
}

export interface Activity {
    id: string;
    timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
    name: string;
    description: string;
    location: string;
    estimatedCost: string;
    travelTip: string;
    imageUrl?: string;
}

export interface DailyItinerary {
    dayNumber: number;
    theme: string;
    activities: Activity[];
}

export interface TripPlan {
    title: string;
    summary: string;
    days: DailyItinerary[];
}

export interface RealTimeContext {
    weather: string;
    events: string;
    sources: { title: string; uri: string }[];
}
