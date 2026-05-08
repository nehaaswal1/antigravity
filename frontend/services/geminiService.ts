import { GoogleGenAI, Type } from '@google/genai';
import { TravelPreferences, TripPlan, Activity, RealTimeContext } from '../types';
import { generateId, generateImageUrl } from '../utils';

// Initialize the SDK strictly according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

const activitySchema = {
    type: Type.OBJECT,
    properties: {
        timeOfDay: { type: Type.STRING, description: "Morning, Afternoon, or Evening" },
        name: { type: Type.STRING, description: "Name of the activity or place" },
        description: { type: Type.STRING, description: "Engaging description of what to do" },
        location: { type: Type.STRING, description: "Specific neighborhood or address" },
        estimatedCost: { type: Type.STRING, description: "Estimated cost in local currency or USD" },
        travelTip: { type: Type.STRING, description: "A useful tip for this specific activity" },
        transitInfo: { type: Type.STRING, description: "Logical transit instructions and estimated time from the previous activity (or hotel if first)." }
    },
    required: ["timeOfDay", "name", "description", "location", "estimatedCost", "travelTip", "transitInfo"]
};

const itinerarySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy title for the trip" },
        summary: { type: Type.STRING, description: "A brief overview of what to expect" },
        days: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    dayNumber: { type: Type.INTEGER },
                    theme: { type: Type.STRING, description: "Theme for the day, e.g., 'Historical Immersion'" },
                    activities: {
                        type: Type.ARRAY,
                        items: activitySchema
                    }
                },
                required: ["dayNumber", "theme", "activities"]
            }
        }
    },
    required: ["title", "summary", "days"]
};

export const getRealTimeContext = async (destination: string): Promise<RealTimeContext> => {
    const prompt = `What are the current notable events, festivals, or important local news happening in ${destination} right now or in the very near future? Also briefly mention the current general weather forecast. Keep it concise.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                role: 'user',
                parts: [{ text: prompt }]
            },
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.3
            }
        });

        const text = response.text || "No current events found.";
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const sources = chunks
            .map(chunk => chunk.web)
            .filter((web): web is { uri: string; title: string } => web !== undefined && web.uri !== undefined && web.title !== undefined)
            .map(web => ({ title: web.title, uri: web.uri }));

        return {
            weather: "Check local forecasts for exact details.", 
            events: text,
            sources: sources.slice(0, 3) // Keep top 3 sources
        };
    } catch (error) {
        console.error("Error fetching real-time context:", error);
        return {
            weather: "Unable to fetch current weather.",
            events: "Unable to fetch current events.",
            sources: []
        };
    }
};

export const generateItinerary = async (prefs: TravelPreferences, contextEvents: string): Promise<TripPlan> => {
    const prompt = `
    Create a highly detailed, dynamic travel itinerary for ${prefs.destination} for ${prefs.durationDays} days.
    
    Constraints & Preferences:
    - Budget Level: ${prefs.budget}
    - Travel Pace: ${prefs.pace}
    - Key Interests: ${prefs.interests.join(', ')}
    - Dietary Restrictions: ${prefs.dietary || 'None'}
    
    Real-Time Local Context (Weather/Events):
    ${contextEvents || 'None available.'}
    
    CRITICAL INSTRUCTIONS: 
    1. You MUST adapt the itinerary to the real-time context. If bad weather is mentioned, suggest indoor activities. If local festivals are mentioned, include them.
    2. GEOGRAPHICAL LOGIC: Ensure activities flow logically to minimize travel time. You MUST provide 'transitInfo' for each activity, explaining the best way to get there from the previous location (or hotel) and the estimated travel time.
    
    Provide realistic estimated costs based on the budget level.
    Make the descriptions engaging and unique.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                role: 'user',
                parts: [{ text: prompt }]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: itinerarySchema,
                temperature: 0.7,
            }
        });

        const plan = JSON.parse(response.text) as TripPlan;
        
        // Add unique IDs and images using utility functions
        plan.days.forEach(day => {
            day.activities.forEach(act => {
                act.id = generateId();
                act.imageUrl = generateImageUrl(act.name);
            });
        });

        return plan;
    } catch (error) {
        console.error("Error generating itinerary:", error);
        throw new Error("Failed to generate itinerary. Please try again.");
    }
};

export const swapActivity = async (
    prefs: TravelPreferences, 
    currentActivity: Activity, 
    dayTheme: string
): Promise<Activity> => {
    const prompt = `
    I am planning a trip to ${prefs.destination}. 
    On a day themed "${dayTheme}", I currently have this activity planned for the ${currentActivity.timeOfDay}:
    "${currentActivity.name}" - ${currentActivity.description}.
    
    The user wants to swap this out for something else.
    Provide a NEW, different activity for the ${currentActivity.timeOfDay} that fits these preferences:
    - Budget: ${prefs.budget}
    - Interests: ${prefs.interests.join(', ')}
    
    Ensure the new activity is geographically logical and provide updated 'transitInfo'.
    Return ONLY the new activity details in JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                role: 'user',
                parts: [{ text: prompt }]
            },
            config: {
                responseMimeType: 'application/json',
                responseSchema: activitySchema,
                temperature: 0.9, 
            }
        });

        const newActivity = JSON.parse(response.text) as Activity;
        newActivity.id = generateId();
        newActivity.imageUrl = generateImageUrl(newActivity.name);
        
        return newActivity;
    } catch (error) {
        console.error("Error swapping activity:", error);
        throw new Error("Failed to find an alternative activity.");
    }
};

export const sendChatMessageStream = async (
    message: string,
    history: { role: 'user' | 'model', text: string }[],
    plan: TripPlan,
    prefs: TravelPreferences
) => {
    const systemInstruction = `You are a helpful, expert travel assistant for a user going to ${prefs.destination}.
    Here is their current generated itinerary: ${JSON.stringify(plan)}.
    Answer their questions about the trip, provide packing tips, give directions between activities, or offer local etiquette advice. 
    Keep answers concise, friendly, and directly related to their itinerary. Use markdown for formatting.`;

    const contents = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    return await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: { 
            systemInstruction,
            temperature: 0.7
        }
    });
};
