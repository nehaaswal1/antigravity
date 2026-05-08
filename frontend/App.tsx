import React, { useState, useCallback } from 'react';
import { HeroForm } from './components/HeroForm';
import { ItineraryView } from './components/ItineraryView';
import { TravelAssistantChat } from './components/TravelAssistantChat';
import { ErrorBoundary } from './components/ErrorBoundary';
import { generateItinerary, getRealTimeContext, swapActivity, generateTripCoverImage } from './services/geminiService';
import { TravelPreferences, TripPlan, RealTimeContext, Activity } from './types';
import { replaceActivityInPlan } from './utils';

type AppState = 'input' | 'loading' | 'results' | 'error';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('input');
    const [loadingStep, setLoadingStep] = useState<string>('');
    const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
    const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
    const [context, setContext] = useState<RealTimeContext | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleGenerate = async (prefs: TravelPreferences) => {
        setPreferences(prefs);
        setAppState('loading');
        setErrorMessage('');

        try {
            // Step 1: Fetch real-time context (Google Search Grounding)
            setLoadingStep('Scouting real-time local events and weather...');
            const realTimeData = await getRealTimeContext(prefs.destination);
            setContext(realTimeData);

            // Step 2: Generate itinerary (Gemini 2.5 Flash)
            setLoadingStep('Crafting your personalized itinerary...');
            const plan = await generateItinerary(prefs, realTimeData.events);
            
            // Step 3: Generate Cover Image (Google Imagen 4.0)
            setLoadingStep('Painting a picture of your destination...');
            const coverImageUrl = await generateTripCoverImage(prefs.destination, plan.summary);
            plan.coverImageUrl = coverImageUrl;

            setTripPlan(plan);
            setAppState('results');
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || 'An unexpected error occurred.');
            setAppState('error');
        }
    };

    const handleSwapActivity = useCallback(async (dayIndex: number, oldActivity: Activity) => {
        if (!preferences || !tripPlan) return;

        const dayTheme = tripPlan.days[dayIndex].theme;
        
        // Let the error bubble up to the ActivityCard component instead of blocking with an alert
        const newActivity = await swapActivity(preferences, oldActivity, dayTheme);
        
        setTripPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            // Use the pure, tested utility function to handle complex state immutability
            return replaceActivityInPlan(prevPlan, dayIndex, oldActivity.id, newActivity);
        });
    }, [preferences, tripPlan]);

    const handleStartOver = () => {
        setAppState('input');
        setTripPlan(null);
        setContext(null);
    };

    return (
        <ErrorBoundary>
            <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
                {appState === 'input' && (
                    <HeroForm onSubmit={handleGenerate} isLoading={false} />
                )}

                {appState === 'loading' && (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" role="status" aria-live="polite">
                        <div className="relative w-24 h-24 mb-8" aria-hidden="true">
                            <div className="absolute inset-0 border-4 border-brand-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl">✈️</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Curating Your Experience</h2>
                        <p className="text-brand-600 font-medium animate-pulse">{loadingStep}</p>
                    </div>
                )}

                {appState === 'error' && (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center" role="alert">
                        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4" aria-hidden="true">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h2>
                        <p className="text-gray-600 mb-6 max-w-md">{errorMessage}</p>
                        <button 
                            onClick={handleStartOver}
                            className="px-6 py-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {appState === 'results' && tripPlan && preferences && (
                    <>
                        <ItineraryView 
                            plan={tripPlan} 
                            context={context} 
                            preferences={preferences}
                            onSwapActivity={handleSwapActivity}
                            onStartOver={handleStartOver}
                        />
                        <TravelAssistantChat 
                            plan={tripPlan}
                            preferences={preferences}
                        />
                    </>
                )}
            </main>
        </ErrorBoundary>
    );
};

export default App;
