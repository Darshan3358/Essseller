const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

// Compute the base server URL (without /api)
export const SERVER_URL = (() => {
    if (typeof window === 'undefined') return API_URL.replace(/\/api$/, '') || '/';
    
    // If API_URL is relative (starts with /), prepend the current origin
    if (API_URL.startsWith('/')) {
        const origin = window.location.origin;
        // In dev, usually the backend is on a different port (e.g. 5001)
        // If we're on 3000, we might need to point to 5001 for static files
        return origin.includes('localhost') ? 'http://localhost:5001' : origin;
    }
    
    return API_URL.replace(/\/api$/, '') || '/';
})();

/**
 * Robust helper to get the full URL for a static asset.
 * In production, NEXT_PUBLIC_API_URL is relative (/api), so Next.js rewrites
 * handle proxying. We must NOT prepend the origin in that case — just return
 * the path as-is so the browser fetches it through the Next.js proxy.
 */
export const getFullImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    // Already a full URL — use directly
    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // If API_URL is relative (e.g. /api), we're in production behind Next.js rewrites.
    // Return the path as-is so the browser uses the same origin and rewrites apply.
    if (API_URL.startsWith('/')) {
        return cleanPath;
    }

    // In dev (absolute URL like http://localhost:5001/api), prepend the server base
    const cleanServerUrl = SERVER_URL.endsWith('/') ? SERVER_URL.slice(0, -1) : SERVER_URL;
    return `${cleanServerUrl}${cleanPath}`;
};

const requestCache = new Map<string, { promise: Promise<any>, timestamp: number }>();
const CACHE_DURATION = 1000; // 1 second

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const isGet = !options.method || options.method === 'GET';
    const cacheKey = `${endpoint}_${JSON.stringify(options.headers || {})}`;

    if (isGet) {
        const cached = requestCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.promise;
        }
    }

    const fetchPromise = (async () => {
        let token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
        const isAdminPage = typeof window !== 'undefined' && window.location.pathname.includes('/admin');
        
        if (typeof window !== 'undefined' && (endpoint.startsWith('/admin') || isAdminPage)) {
            const adminToken = sessionStorage.getItem('adminToken');
            if (adminToken) {
                token = adminToken;
            }
        }
        
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
            // Remove from cache on error so next attempt can try again
            if (isGet) requestCache.delete(cacheKey);
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    })();

    if (isGet) {
        requestCache.set(cacheKey, { promise: fetchPromise, timestamp: Date.now() });
    }

    return fetchPromise;
}

export const api = {
    get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint: string, body?: any) => {
        requestCache.clear();
        return apiRequest(endpoint, {
            method: 'POST',
            body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        });
    },
    put: (endpoint: string, body?: any) => {
        requestCache.clear();
        return apiRequest(endpoint, {
            method: 'PUT',
            body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        });
    },
    delete: (endpoint: string) => {
        requestCache.clear();
        return apiRequest(endpoint, { method: 'DELETE' });
    },
    // Helper to clear cache manually if needed
    clearCache: () => requestCache.clear(),
};
