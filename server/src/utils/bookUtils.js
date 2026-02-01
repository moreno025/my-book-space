/**
 * Establishes a clean URL for Google Books thumbnails.
 * Removes the 'edge=curl' parameter which adds a white page-turn effect.
 * Ensures the URL uses HTTPS.
 * @param {string} url - The original thumbnail URL.
 * @returns {string|null} - The cleaned URL.
 */
// Placeholder for books without a cover
const DEFAULT_COVER = "https://placehold.co/400x600/e2e8f0/1e293b.png?text=No+Cover";

export const cleanGoogleBooksUrl = (url, highRes = false) => {
    // 1. If no URL provided, return custom placeholder
    if (!url) return DEFAULT_COVER;
    
    // 2. Clean up Google URL
    let cleaned = url
        .replace("http://", "https://")
        .replace(/[&?]edge=curl/g, ""); // Remove page turn curl effect

    // 3. Fix Zoom Level logic
    // We previously forced zoom=2 (Large), but many books ONLY exist in zoom=1 (Thumbnail).
    // Forcing zoom=2 caused 404s on the Detail Screen for books that worked in the List.
    // Safety fix: Keep zoom=1 (Reliable) or remove zoom param to let Google decide.
    // For now, ensuring we don't have zoom=5 (tiny) is enough.
    cleaned = cleaned.replace("zoom=5", "zoom=1"); 

    // If we REALLY want high res, we could try, but it's risky without fallback checks.
    // Commenting out the risky upgrade for stability:
    /* 
    if (highRes) {
        cleaned = cleaned.replace("zoom=1", "zoom=2");
    } 
    */

    return cleaned;
};
