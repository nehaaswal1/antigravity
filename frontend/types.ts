export interface TravelPreferences {
    destination: string;
    durationDays: number;
    budget: 'Budget' | 'Moderate' | 'Luxury';
    pace: 'Relaxed' | 'Balanced' | 'Action-Packed';
    interests: string[];
    dietary: string;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Activity {
    id: string;
    timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
    name: string;
    description: string;
    location: string;
    coordinates?: Coordinates; // Added for Google Maps integration
    estimatedCost: string;
    travelTip: string;
    transitInfo: string;
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
    coverImageUrl?: string; // Added for Google Imagen integration
    days: DailyItinerary[];
}

export interface RealTimeContext {
    weather: string;
    events: string;
    sources: { title: string; uri: string }[];
}
