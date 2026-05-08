import React, { useState } from 'react';
import { TripPlan, RealTimeContext, TravelPreferences, Activity } from '../types';
import { ActivityCard } from './ActivityCard';
import { Map, Info, ExternalLink, ChevronLeft, ChevronRight, Printer } from 'lucide-react';

interface ItineraryViewProps {
    plan: TripPlan;
    context: RealTimeContext | null;
    preferences: TravelPreferences;
    onSwapActivity: (dayIndex: number, oldActivity: Activity) => Promise<void>;
    onStartOver: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ 
    plan, 
    context, 
    preferences, 
    onSwapActivity,
    onStartOver
}) => {
    const [activeDay, setActiveDay] = useState(0);

    const handlePrevDay = () => setActiveDay(prev => Math.max(0, prev - 1));
    const handleNextDay = () => setActiveDay(prev => Math.min(plan.days.length - 1, prev + 1));

    const currentDayData = plan.days[activeDay];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm print:static print:shadow-none print:border-b-2 print:border-black">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
                        <p className="text-sm text-gray-500">{preferences.destination} • {preferences.durationDays} Days • {preferences.pace} Pace</p>
                    </div>
                    <nav className="flex items-center space-x-6" aria-label="Itinerary Actions">
                        <button 
                            onClick={() => window.print()}
                            aria-label="Print current day itinerary"
                            className="print:hidden text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1"
                        >
                            <Printer className="w-4 h-4 mr-1.5" aria-hidden="true" /> Print Day
                        </button>
                        <button 
                            onClick={onStartOver}
                            aria-label="Start over and create a new itinerary"
                            className="print:hidden text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1"
                        >
                            Start Over
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Summary & Context Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" aria-label="Trip Overview and Context">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 print:border-gray-300 print:shadow-none">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <Map className="w-5 h-5 mr-2 text-brand-500 print:text-black" aria-hidden="true" /> Trip Overview
                        </h2>
                        <p className="text-gray-600 leading-relaxed print:text-black">{plan.summary}</p>
                    </div>

                    {context && (
                        <aside className="bg-gradient-to-br from-brand-50 to-sky-50 rounded-2xl p-6 shadow-sm border border-brand-100 print:bg-none print:border-gray-300 print:shadow-none" aria-label="Live Local Context">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <Info className="w-5 h-5 mr-2 text-brand-500 print:text-black" aria-hidden="true" /> Live Local Context
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 print:text-gray-800">Current Events/News</h3>
                                    <p className="text-sm text-gray-700 line-clamp-4 print:line-clamp-none print:text-black">{context.events}</p>
                                </div>
                                {context.sources.length > 0 && (
                                    <div className="print:hidden">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sources</h3>
                                        <ul className="space-y-1">
                                            {context.sources.map((source, idx) => (
                                                <li key={idx}>
                                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline flex items-center truncate focus:outline-none focus:ring-2 focus:ring-brand-500 rounded">
                                                        <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" aria-hidden="true" />
                                                        {source.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}
                </section>

                {/* Day Navigation */}
                <nav className="print:hidden flex items-center justify-between mb-6 bg-white p-2 rounded-full shadow-sm border border-gray-100" aria-label="Day Navigation">
                    <button 
                        onClick={handlePrevDay}
                        disabled={activeDay === 0}
                        aria-label="Previous Day"
                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" aria-hidden="true" />
                    </button>
                    
                    <div className="flex-1 overflow-x-auto hide-scrollbar px-4" role="tablist">
                        <div className="flex justify-center space-x-2 min-w-max">
                            {plan.days.map((day, idx) => (
                                <button
                                    key={day.dayNumber}
                                    role="tab"
                                    aria-selected={activeDay === idx}
                                    aria-controls={`day-panel-${idx}`}
                                    id={`day-tab-${idx}`}
                                    onClick={() => setActiveDay(idx)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
                                        activeDay === idx 
                                            ? 'bg-brand-600 text-white shadow-md' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Day {day.dayNumber}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleNextDay}
                        disabled={activeDay === plan.days.length - 1}
                        aria-label="Next Day"
                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-700" aria-hidden="true" />
                    </button>
                </nav>

                {/* Active Day Content */}
                <section 
                    id={`day-panel-${activeDay}`}
                    role="tabpanel"
                    aria-labelledby={`day-tab-${activeDay}`}
                    className="animate-fadeIn"
                    aria-live="polite"
                >
                    <header className="mb-6 text-center print:text-left print:mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Day {currentDayData.dayNumber}</h2>
                        <p className="text-brand-600 font-medium print:text-gray-700">{currentDayData.theme}</p>
                    </header>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent print:before:hidden print:space-y-4">
                        {currentDayData.activities.map((activity, index) => (
                            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active print:flex-row print:odd:flex-row print:items-start">
                                {/* Timeline Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-100 text-brand-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 print:hidden" aria-hidden="true">
                                    <span className="text-xs font-bold">{index + 1}</span>
                                </div>
                                
                                {/* Card Container */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 print:w-full print:p-0">
                                    <ActivityCard 
                                        activity={activity} 
                                        onSwap={(act) => onSwapActivity(activeDay, act)} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};
