import config from './config';

/**
 * Convert relative image URLs to full URLs
 * @param {string} imageUrl - The image URL (relative or absolute)
 * @returns {string} - Full URL with API base URL
 */
export const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // If it's a relative URL, prepend the API base URL
    if (imageUrl.startsWith('/')) {
        return `${config.getApiUrl()}${imageUrl}`;
    }

    // Otherwise, treat it as a relative path
    return `${config.getApiUrl()}/${imageUrl}`;
};
