// Determine API base URL dynamically
const hostname = window.location.hostname;
// Check for localhost or local network IP
const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.');
// Check if running on ngrok (which serves both frontend and backend on same origin)
const isNgrok = hostname.includes('ngrok-free.app') || hostname.includes('ngrok.io') || hostname.includes('ngrok-free.dev');

export const API_BASE = isNgrok
    ? "" // Always use relative path for ngrok (same origin)
    : isLocal
        ? `http://${hostname}:8086`
        : (import.meta.env.VITE_API_BASE)
            ? import.meta.env.VITE_API_BASE
            : "https://shreemedicare-backend.onrender.com";

export const apiUrl = (path: string) => {
    // Ensure no double slashes if API_BASE ends with / and path starts with /
    const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
};

export default apiUrl;
