/**
 * Establishes a clean URL for Google Books thumbnails.
 * Removes the 'edge=curl' parameter which adds a white page-turn effect.
 * Ensures the URL uses HTTPS.
 * @param {string} url - The original thumbnail URL.
 * @returns {string|null} - The cleaned URL.
 */
export const cleanGoogleBooksUrl = (url, highRes = false) => {
    if (!url) return null;
    
    let cleaned = url
        .replace("http://", "https://")
        .replace(/[&?]edge=curl/g, "");

    if (highRes) {
        // Boost to high quality (zoom=2) for detail screens
        cleaned = cleaned.replace("zoom=1", "zoom=2").replace("zoom=5", "zoom=2");
    } else {
        // Ensure we at least have zoom=1 (reliable standard) instead of 5 (tiny)
        cleaned = cleaned.replace("zoom=5", "zoom=1");
    }

    return cleaned;
};
