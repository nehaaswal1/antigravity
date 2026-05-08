import React, { useEffect, useRef, useState } from 'react';
import { Activity } from '../types';
import { MapPinOff } from 'lucide-react';

interface DayMapProps {
    activities: Activity[];
}

export const DayMap: React.FC<DayMapProps> = ({ activities }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapError, setMapError] = useState<string | null>(null);

    useEffect(() => {
        // Check if Google Maps API is loaded
        if (!window.google || !window.google.maps) {
            setMapError("Google Maps API is not available. Please check your API key.");
            return;
        }

        if (!mapRef.current) return;

        // Filter activities that have valid coordinates
        const validActivities = activities.filter(a => a.coordinates && typeof a.coordinates.lat === 'number' && typeof a.coordinates.lng === 'number');

        if (validActivities.length === 0) {
            setMapError("No valid coordinates available for today's activities.");
            return;
        }

        try {
            // Initialize map centered on the first activity
            const map = new window.google.maps.Map(mapRef.current, {
                center: validActivities[0].coordinates,
                zoom: 12,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            const bounds = new window.google.maps.LatLngBounds();
            const pathCoordinates: google.maps.LatLngLiteral[] = [];

            // Add markers and build path
            validActivities.forEach((activity, index) => {
                if (!activity.coordinates) return;

                const position = { lat: activity.coordinates.lat, lng: activity.coordinates.lng };
                
                // Create marker
                new window.google.maps.Marker({
                    position,
                    map,
                    title: activity.name,
                    label: {
                        text: (index + 1).toString(),
                        color: 'white',
                        fontWeight: 'bold'
                    }
                });

                bounds.extend(position);
                pathCoordinates.push(position);
            });

            // Draw polyline connecting the activities
            if (pathCoordinates.length > 1) {
                const flightPath = new window.google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: '#0d9488', // brand-600
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                });
                flightPath.setMap(map);
            }

            // Fit map to bounds if there's more than one activity
            if (validActivities.length > 1) {
                map.fitBounds(bounds);
                // Add a little padding
                const listener = window.google.maps.event.addListener(map, "idle", function() { 
                    if (map.getZoom()! > 16) map.setZoom(16); 
                    window.google.maps.event.removeListener(listener); 
                });
            }

            setMapError(null);
        } catch (err) {
            console.error("Error initializing Google Maps:", err);
            setMapError("Failed to load the map.");
        }

    }, [activities]);

    if (mapError) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-gray-500 p-4 text-center print:hidden">
                <MapPinOff className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm">{mapError}</p>
            </div>
        );
    }

    return (
        <div 
            ref={mapRef} 
            className="w-full h-64 sm:h-80 rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:hidden"
            aria-label="Interactive map showing today's activities"
            role="application"
        />
    );
};
