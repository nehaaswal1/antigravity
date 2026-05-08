import { TripPlan, Activity } from './types';

/**
 * Generates a short, random alphanumeric ID.
 */
export const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
};

/**
 * Generates a placeholder image URL based on a seed string.
 */
export const generateImageUrl = (seed: string, width: number = 400, height: number = 300): string => {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
};

/**
 * Formats a string to ensure it ends with a period if it doesn't already.
 */
export const ensurePunctuation = (text: string): string => {
    if (!text) return text;
    const trimmed = text.trim();
    if (/[.!?]$/.test(trimmed)) return trimmed;
    return `${trimmed}.`;
};

/**
 * Pure function to immutably replace an activity within a complex TripPlan state.
 * Returns the original plan if the dayIndex is out of bounds or activity is not found.
 */
export const replaceActivityInPlan = (
    plan: TripPlan, 
    dayIndex: number, 
    oldActivityId: string, 
    newActivity: Activity
): TripPlan => {
    if (dayIndex < 0 || dayIndex >= plan.days.length) {
        return plan;
    }

    const newDays = [...plan.days];
    const targetDay = newDays[dayIndex];
    const newActivities = [...targetDay.activities];
    
    const activityIndex = newActivities.findIndex(a => a.id === oldActivityId);
    
    if (activityIndex === -1) {
        return plan;
    }

    newActivities[activityIndex] = newActivity;
    newDays[dayIndex] = { ...targetDay, activities: newActivities };
    
    return { ...plan, days: newDays };
};

/**
 * Pure function to immutably reorder activities within a specific day of a TripPlan.
 * This is highly useful for implementing drag-and-drop functionality safely.
 */
export const reorderActivitiesInDay = (
    plan: TripPlan,
    dayIndex: number,
    sourceIndex: number,
    destinationIndex: number
): TripPlan => {
    if (dayIndex < 0 || dayIndex >= plan.days.length) {
        return plan;
    }

    const targetDay = plan.days[dayIndex];
    if (
        sourceIndex < 0 || sourceIndex >= targetDay.activities.length ||
        destinationIndex < 0 || destinationIndex >= targetDay.activities.length
    ) {
        return plan;
    }

    // Create a shallow copy of the activities array to mutate
    const newActivities = [...targetDay.activities];
    
    // Remove the item from the source index
    const [movedActivity] = newActivities.splice(sourceIndex, 1);
    
    // Insert the item at the destination index
    newActivities.splice(destinationIndex, 0, movedActivity);

    // Reconstruct the plan immutably
    const newDays = [...plan.days];
    newDays[dayIndex] = { ...targetDay, activities: newActivities };

    return { ...plan, days: newDays };
};

/**
 * Pure function to safely parse and filter grounding metadata chunks from the Gemini API.
 */
export const parseGroundingMetadata = (chunks: any[]): { title: string; uri: string }[] => {
    if (!Array.isArray(chunks)) return [];
    
    return chunks
        .map(chunk => chunk?.web)
        .filter((web): web is { uri: string; title: string } => 
            web !== undefined && 
            typeof web.uri === 'string' && 
            typeof web.title === 'string'
        )
        .map(web => ({ title: web.title, uri: web.uri }));
};

/**
 * Pure function to enrich a raw activity payload from the AI with required client-side metadata (ID, Image).
 * This adheres to DRY principles by centralizing data enrichment.
 */
export const enrichActivity = (rawActivity: Omit<Activity, 'id' | 'imageUrl'>): Activity => {
    return {
        ...rawActivity,
        id: generateId(),
        imageUrl: generateImageUrl(rawActivity.name || 'travel destination')
    };
};

/**
 * Complex Data Aggregation: Calculates the geographical bounding box (min/max lat/lng) 
 * for an entire trip plan to determine the optimal map viewport.
 * Ignores activities without valid coordinates.
 */
export const calculateTripBoundingBox = (plan: TripPlan): { minLat: number, maxLat: number, minLng: number, maxLng: number } | null => {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    let hasCoordinates = false;

    for (const day of plan.days) {
        for (const act of day.activities) {
            if (act.coordinates && typeof act.coordinates.lat === 'number' && typeof act.coordinates.lng === 'number') {
                hasCoordinates = true;
                minLat = Math.min(minLat, act.coordinates.lat);
                maxLat = Math.max(maxLat, act.coordinates.lat);
                minLng = Math.min(minLng, act.coordinates.lng);
                maxLng = Math.max(maxLng, act.coordinates.lng);
            }
        }
    }

    return hasCoordinates ? { minLat, maxLat, minLng, maxLng } : null;
};
