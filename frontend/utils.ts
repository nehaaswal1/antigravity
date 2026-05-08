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
