const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

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
