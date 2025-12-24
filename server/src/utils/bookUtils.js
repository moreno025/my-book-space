/**
 * Establishes a clean URL for Google Books thumbnails.
 * Removes the 'edge=curl' parameter which adds a white page-turn effect.
 * Ensures the URL uses HTTPS.
 * @param {string} url - The original thumbnail URL.
 * @returns {string|null} - The cleaned URL.
 */
export const cleanGoogleBooksUrl = (url) => {
    if (!url) return null;
    
    return url
        .replace("http://", "https://")
        .replace(/[&?]edge=curl/g, "");
};
