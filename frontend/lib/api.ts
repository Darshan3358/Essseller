const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

// Compute the base server URL (without /api)
export const SERVER_URL = (() => {
    if (typeof window === 'undefined') return API_URL.replace(/\/api$/, '');
    
    // If API_URL is relative (starts with /), prepend the current origin
    if (API_URL.startsWith('/')) {
        const origin = window.location.origin;
        // In dev, usually the backend is on a different port (e.g. 5000)
        // If we're on 3000, we might need to point to 5000 for static files
        return origin.includes('localhost') ? 'http://localhost:5000' : origin;
    }
    
    return API_URL.replace(/\/api$/, '');
})();

/**
 * Robust helper to get the full URL for a static asset
 * @param path The relative path (e.g. /uploads/...) or full URL
 */
export const getFullImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanServerUrl = SERVER_URL.endsWith('/') ? SERVER_URL.slice(0, -1) : SERVER_URL;
    
    return `${cleanServerUrl}${cleanPath}`;
};

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;


    
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const text = await response.text();
    let data: any;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        data = { message: text || 'Invalid JSON response from server' };
    }

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

export const api = {
    get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint: string, body: any) =>
        apiRequest(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    put: (endpoint: string, body: any) =>
        apiRequest(endpoint, {
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};
