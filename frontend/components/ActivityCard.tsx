import React, { useState } from 'react';
import { Clock, MapPin, DollarSign, Lightbulb, RefreshCw, AlertCircle, Navigation } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
    activity: Activity;
    onSwap: (activity: Activity) => Promise<void>;
}

export const ActivityCard: React.FC<ActivityCardProps> = React.memo(({ activity, onSwap }) => {
    const [isSwapping, setIsSwapping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSwap = async () => {
        setIsSwapping(true);
        setError(null);
        try {
            await onSwap(activity);
        } catch (err) {
            setError("Failed to swap. Try again.");
        } finally {
            setIsSwapping(false);
        }
    };

    const timeColors = {
        Morning: 'bg-amber-100 text-amber-800 border-amber-200',
        Afternoon: 'bg-sky-100 text-sky-800 border-sky-200',
        Evening: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };

    return (
        <article className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row print:border-gray-300 print:shadow-none print:rounded-lg">
            {/* Image Section */}
            <div className="sm:w-1/3 h-48 sm:h-auto relative overflow-hidden print:hidden">
                <img 
                    src={activity.imageUrl} 
                    alt={`Visual representation of ${activity.name}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${timeColors[activity.timeOfDay]} shadow-sm backdrop-blur-md bg-opacity-90`}>
                        {activity.timeOfDay}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 sm:w-2/3 flex flex-col justify-between relative print:w-full print:p-4">
                
                {/* Swap Button */}
                <button 
                    onClick={handleSwap}
                    disabled={isSwapping}
                    aria-label={`Swap ${activity.name} for a different activity`}
                    aria-busy={isSwapping}
                    className="print:hidden absolute top-4 right-4 p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors border border-gray-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    title="Swap for something else"
                >
                    <RefreshCw className={`w-4 h-4 ${isSwapping ? 'animate-spin' : ''}`} aria-hidden="true" />
                </button>

                <div>
                    <div className="hidden print:inline-block mb-2">
                        <span className="px-2 py-1 rounded text-xs font-bold border border-gray-300 text-gray-700">
                            {activity.timeOfDay}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 pr-10 print:pr-0">{activity.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 print:line-clamp-none print:text-black">{activity.description}</p>
                </div>

                <div className="space-y-2 mt-auto">
                    <div className="flex items-center text-sm text-gray-500 print:text-gray-800">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 print:text-gray-600 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate print:whitespace-normal">{activity.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 print:text-gray-800">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400 print:text-gray-600 flex-shrink-0" aria-hidden="true" />
                        <span>{activity.estimatedCost}</span>
                    </div>
                    
                    {/* Transit Info */}
                    <div className="flex items-center text-sm text-gray-500 print:text-gray-800 pt-1">
                        <Navigation className="w-4 h-4 mr-2 text-brand-500 print:text-gray-600 flex-shrink-0" aria-hidden="true" />
                        <span className="italic text-gray-600 print:text-gray-800">{activity.transitInfo}</span>
                    </div>

                    <div className="flex items-start text-sm text-brand-700 bg-brand-50 p-3 rounded-lg mt-3 print:bg-transparent print:border print:border-gray-200 print:text-gray-800 print:p-2">
                        <Lightbulb className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 print:text-gray-600" aria-hidden="true" />
                        <span className="italic">{activity.travelTip}</span>
                    </div>
                </div>
            </div>
            
            {/* Loading Overlay for Swap */}
            {isSwapping && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 print:hidden" role="status" aria-live="polite">
                    <div className="flex flex-col items-center text-brand-600">
                        <RefreshCw className="w-8 h-8 animate-spin mb-2" aria-hidden="true" />
                        <span className="text-sm font-medium">Finding alternatives...</span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && !isSwapping && (
                <div className="absolute bottom-4 right-4 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-md shadow-sm border border-red-100 flex items-center print:hidden animate-fadeIn" role="alert">
                    <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                    {error}
                </div>
            )}
        </article>
    );
});
