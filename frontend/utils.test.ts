import { generateId, ensurePunctuation, replaceActivityInPlan, parseGroundingMetadata, calculateTripBoundingBox, reorderActivitiesInDay } from './utils';
import { TripPlan, Activity } from './types';

/**
 * A lightweight, in-browser test runner for complex scenarios.
 */
export const runTests = async () => {
    console.log('%c--- Running Complex Test Scenarios ---', 'color: #14b8a6; font-weight: bold; font-size: 14px;');
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            passed++;
            console.log(`%c✅ PASS: ${message}`, 'color: #10b981;');
        } else {
            failed++;
            console.error(`%c❌ FAIL: ${message}`, 'color: #ef4444;');
        }
    };

    const describe = async (suiteName: string, tests: () => Promise<void> | void) => {
        console.group(`%c🧪 ${suiteName}`, 'color: #6366f1; font-weight: bold;');
        try {
            await tests();
        } catch (e) {
            console.error(`Error in test suite ${suiteName}:`, e);
        }
        console.groupEnd();
    };

    await describe('State Management: replaceActivityInPlan', () => {
        const mockActivity1: Activity = { id: 'a1', timeOfDay: 'Morning', name: 'A1', description: '', location: '', estimatedCost: '', travelTip: '', transitInfo: '' };
        const mockActivity2: Activity = { id: 'a2', timeOfDay: 'Afternoon', name: 'A2', description: '', location: '', estimatedCost: '', travelTip: '', transitInfo: '' };
        const mockNewActivity: Activity = { id: 'a3', timeOfDay: 'Morning', name: 'A3', description: 'New', location: '', estimatedCost: '', travelTip: '', transitInfo: '' };
        
        const initialPlan: TripPlan = {
            title: 'Test Trip',
            summary: 'Test',
            days: [
                { dayNumber: 1, theme: 'Day 1', activities: [mockActivity1] },
                { dayNumber: 2, theme: 'Day 2', activities: [mockActivity2] }
            ]
        };

        const updatedPlan = replaceActivityInPlan(initialPlan, 0, 'a1', mockNewActivity);

        // 1. Immutability & Structural Sharing Tests
        assert(updatedPlan !== initialPlan, 'Returns a new TripPlan object (Immutability)');
        assert(updatedPlan.days[0] !== initialPlan.days[0], 'Returns a new Day object for the modified day');
        assert(updatedPlan.days[1] === initialPlan.days[1], 'Retains reference to unmodified days (Structural Sharing)');
        
        // 2. Logic Tests
        assert(updatedPlan.days[0].activities[0].id === 'a3', 'Successfully replaces the target activity');
        assert(updatedPlan.days[0].activities.length === 1, 'Does not alter the length of the activities array');

        // 3. Edge Case Tests
        const outOfBoundsPlan = replaceActivityInPlan(initialPlan, 5, 'a1', mockNewActivity);
        assert(outOfBoundsPlan === initialPlan, 'Returns original plan reference if dayIndex is out of bounds');

        const notFoundPlan = replaceActivityInPlan(initialPlan, 0, 'non-existent', mockNewActivity);
        assert(notFoundPlan === initialPlan, 'Returns original plan reference if activity ID is not found');
    });

    await describe('State Management: reorderActivitiesInDay (Drag & Drop Simulation)', () => {
        const a1 = { id: 'a1', name: 'A1' } as Activity;
        const a2 = { id: 'a2', name: 'A2' } as Activity;
        const a3 = { id: 'a3', name: 'A3' } as Activity;
        const a4 = { id: 'a4', name: 'A4' } as Activity;

        const initialPlan: TripPlan = {
            title: 'Reorder Test', summary: '',
            days: [
                { dayNumber: 1, theme: 'Day 1', activities: [a1, a2, a3, a4] },
                { dayNumber: 2, theme: 'Day 2', activities: [] }
            ]
        };

        // 1. Move item down (index 0 to 2)
        const movedDown = reorderActivitiesInDay(initialPlan, 0, 0, 2);
        assert(movedDown !== initialPlan, 'Immutability: Returns a new TripPlan reference');
        assert(movedDown.days[0] !== initialPlan.days[0], 'Immutability: Returns a new Day reference');
        assert(movedDown.days[1] === initialPlan.days[1], 'Structural Sharing: Unmodified days retain original reference');
        assert(
            movedDown.days[0].activities.map(a => a.id).join(',') === 'a2,a3,a1,a4',
            'Correctly shifts items when moving an activity down the list'
        );

        // 2. Move item up (index 3 to 1)
        const movedUp = reorderActivitiesInDay(initialPlan, 0, 3, 1);
        assert(
            movedUp.days[0].activities.map(a => a.id).join(',') === 'a1,a4,a2,a3',
            'Correctly shifts items when moving an activity up the list'
        );

        // 3. Edge Cases: Out of bounds
        const invalidDay = reorderActivitiesInDay(initialPlan, 99, 0, 1);
        assert(invalidDay === initialPlan, 'Returns exact original reference if dayIndex is invalid');

        const invalidSource = reorderActivitiesInDay(initialPlan, 0, -1, 1);
        assert(invalidSource === initialPlan, 'Returns exact original reference if sourceIndex is invalid');

        const invalidDest = reorderActivitiesInDay(initialPlan, 0, 0, 99);
        assert(invalidDest === initialPlan, 'Returns exact original reference if destinationIndex is invalid');
    });

    await describe('Data Parsing: parseGroundingMetadata', () => {
        const mockChunks = [
            { web: { uri: 'https://example.com/1', title: 'Valid Source 1' } },
            { web: { uri: 'https://example.com/2' } }, // Missing title
            { web: { title: 'Missing URI' } }, // Missing URI
            { otherType: { data: 'ignore me' } }, // Not a web chunk
            { web: { uri: 'https://example.com/3', title: 'Valid Source 2' } },
            null, // Malformed chunk
            undefined
        ];

        const result = parseGroundingMetadata(mockChunks);

        assert(result.length === 2, 'Filters out malformed, null, or non-web chunks');
        assert(result[0].title === 'Valid Source 1' && result[1].title === 'Valid Source 2', 'Correctly maps valid titles');
        assert(result[0].uri === 'https://example.com/1', 'Correctly maps valid URIs');
        
        const emptyResult = parseGroundingMetadata(null as any);
        assert(Array.isArray(emptyResult) && emptyResult.length === 0, 'Handles null input gracefully');
    });

    await describe('Spatial Data Aggregation: calculateTripBoundingBox', () => {
        const createMockActivity = (lat?: number, lng?: number): Activity => ({
            id: generateId(), timeOfDay: 'Morning', name: 'Test', description: '', location: '', estimatedCost: '', travelTip: '', transitInfo: '',
            ...(lat !== undefined && lng !== undefined ? { coordinates: { lat, lng } } : {})
        });

        const planWithCoordinates: TripPlan = {
            title: 'Spatial Test', summary: '',
            days: [
                { dayNumber: 1, theme: '', activities: [createMockActivity(10, 20), createMockActivity(-5, 30)] },
                { dayNumber: 2, theme: '', activities: [createMockActivity(15, -10), createMockActivity()] } // One missing coords
            ]
        };

        const planWithoutCoordinates: TripPlan = {
            title: 'No Spatial Test', summary: '',
            days: [{ dayNumber: 1, theme: '', activities: [createMockActivity(), createMockActivity()] }]
        };

        // 1. Complex Aggregation Test
        const bbox = calculateTripBoundingBox(planWithCoordinates);
        assert(bbox !== null, 'Returns a bounding box when coordinates exist');
        if (bbox) {
            assert(bbox.minLat === -5, 'Correctly calculates minimum latitude across multiple days');
            assert(bbox.maxLat === 15, 'Correctly calculates maximum latitude across multiple days');
            assert(bbox.minLng === -10, 'Correctly calculates minimum longitude across multiple days');
            assert(bbox.maxLng === 30, 'Correctly calculates maximum longitude across multiple days');
        }

        // 2. Null State Handling
        const nullBbox = calculateTripBoundingBox(planWithoutCoordinates);
        assert(nullBbox === null, 'Returns null when no activities have coordinates');
        
        // 3. Empty Plan Handling
        const emptyPlanBbox = calculateTripBoundingBox({ title: '', summary: '', days: [] });
        assert(emptyPlanBbox === null, 'Returns null for an empty trip plan');
    });

    await describe('Utility Functions', () => {
        const id1 = generateId();
        const id2 = generateId();
        assert(typeof id1 === 'string' && id1.length === 7, 'generateId returns a 7-character string');
        assert(id1 !== id2, 'generateId returns unique values');

        assert(ensurePunctuation('Hello') === 'Hello.', 'ensurePunctuation adds period to unpunctuated string');
        assert(ensurePunctuation('Hello!') === 'Hello!', 'ensurePunctuation respects existing exclamation mark');
        assert(ensurePunctuation('Hello?') === 'Hello?', 'ensurePunctuation respects existing question mark');
    });

    console.log(`%c--- Test Results: ${passed} Passed, ${failed} Failed ---`, `color: ${failed > 0 ? '#ef4444' : '#10b981'}; font-weight: bold; font-size: 14px;`);
};
