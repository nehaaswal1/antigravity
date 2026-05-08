import { generateId, generateImageUrl, ensurePunctuation } from './utils';

// Simple mock test suite to demonstrate testing capabilities
const runTests = () => {
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            failed++;
            console.error(`❌ FAIL: ${message}`);
        }
    };

    console.log('--- Running Utils Tests ---');

    // Test generateId
    const id1 = generateId();
    const id2 = generateId();
    assert(typeof id1 === 'string' && id1.length > 0, 'generateId returns a non-empty string');
    assert(id1 !== id2, 'generateId returns unique values');

    // Test generateImageUrl
    const url = generateImageUrl('Tokyo', 800, 600);
    assert(url === 'https://picsum.photos/seed/Tokyo/800/600', 'generateImageUrl formats URL correctly');

    // Test ensurePunctuation
    assert(ensurePunctuation('Hello') === 'Hello.', 'ensurePunctuation adds period');
    assert(ensurePunctuation('Hello!') === 'Hello!', 'ensurePunctuation respects existing punctuation');
    assert(ensurePunctuation('') === '', 'ensurePunctuation handles empty strings');

    console.log(`--- Test Results: ${passed} Passed, ${failed} Failed ---`);
};

// Execute tests in development/sandbox environments
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    runTests();
}

export { runTests };
