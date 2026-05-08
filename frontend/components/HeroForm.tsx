import React, { useState, useCallback } from 'react';
import { MapPin, Calendar, DollarSign, Activity as ActivityIcon, Utensils, Compass } from 'lucide-react';
import { TravelPreferences } from '../types';

interface HeroFormProps {
    onSubmit: (prefs: TravelPreferences) => void;
    isLoading: boolean;
}

const INTEREST_OPTIONS = ['Culture & History', 'Food & Drink', 'Nature & Outdoors', 'Nightlife', 'Shopping', 'Relaxation', 'Adventure'];

export const HeroForm: React.FC<HeroFormProps> = React.memo(({ onSubmit, isLoading }) => {
    const [prefs, setPrefs] = useState<TravelPreferences>({
        destination: '',
        durationDays: 3,
        budget: 'Moderate',
        pace: 'Balanced',
        interests: [],
        dietary: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prefs.destination.trim() && prefs.durationDays > 0) {
            onSubmit(prefs);
        }
    };

    const toggleInterest = useCallback((interest: string) => {
        setPrefs(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-labelledby="hero-heading">
            {/* Background Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://picsum.photos/id/1018/1920/1080)' }}
                aria-hidden="true"
            >
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl p-6">
                <header className="text-center mb-10">
                    <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                        Gemini <span className="text-brand-400">Journeys</span>
                    </h1>
                    <p className="text-xl text-gray-200 font-light">
                        Intelligent, real-time travel planning tailored to your exact vibe.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 shadow-2xl" aria-label="Travel Preferences Form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Basics */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-brand-600" aria-hidden="true" /> Where to?
                                </label>
                                <input
                                    id="destination"
                                    type="text"
                                    required
                                    aria-required="true"
                                    placeholder="e.g., Tokyo, Japan"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-white/80"
                                    value={prefs.destination}
                                    onChange={e => setPrefs({...prefs, destination: e.target.value})}
                                />
                            </div>

                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-brand-600" aria-hidden="true" /> Duration (Days)
                                </label>
                                <input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    max="14"
                                    required
                                    aria-required="true"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-white/80"
                                    value={prefs.durationDays}
                                    onChange={e => setPrefs({...prefs, durationDays: parseInt(e.target.value) || 1})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2 text-brand-600" aria-hidden="true" /> Budget
                                    </label>
                                    <select
                                        id="budget"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white/80"
                                        value={prefs.budget}
                                        onChange={e => setPrefs({...prefs, budget: e.target.value as TravelPreferences['budget']})}
                                    >
                                        <option value="Budget">Budget</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Luxury">Luxury</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="pace" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <ActivityIcon className="w-4 h-4 mr-2 text-brand-600" aria-hidden="true" /> Pace
                                    </label>
                                    <select
                                        id="pace"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white/80"
                                        value={prefs.pace}
                                        onChange={e => setPrefs({...prefs, pace: e.target.value as TravelPreferences['pace']})}
                                    >
                                        <option value="Relaxed">Relaxed</option>
                                        <option value="Balanced">Balanced</option>
                                        <option value="Action-Packed">Action-Packed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="space-y-6">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Compass className="w-4 h-4 mr-2 text-brand-600" aria-hidden="true" /> Vibe & Interests
                                </legend>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="Select your interests">
                                    {INTEREST_OPTIONS.map(interest => {
                                        const isSelected = prefs.interests.includes(interest);
                                        return (
                                            <button
                                                key={interest}
                                                type="button"
                                                onClick={() => toggleInterest(interest)}
                                                aria-pressed={isSelected}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
                                                    isSelected
                                                        ? 'bg-brand-500 text-white border-brand-500'
                                                        : 'bg-white/60 text-gray-600 border-gray-300 hover:bg-white'
                                                }`}
                                            >
                                                {interest}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            <div>
                                <label htmlFor="dietary" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Utensils className="w-4 h-4 mr-2 text-brand-600" aria-hidden="true" /> Dietary Needs (Optional)
                                </label>
                                <input
                                    id="dietary"
                                    type="text"
                                    placeholder="e.g., Vegan, Gluten-free"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-white/80"
                                    value={prefs.dietary}
                                    onChange={e => setPrefs({...prefs, dietary: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <button
                            type="submit"
                            disabled={isLoading || !prefs.destination}
                            aria-busy={isLoading}
                            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-brand-600 border border-transparent rounded-full hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Crafting Your Journey...
                                </>
                            ) : (
                                'Generate Itinerary'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
});
