// Backend base URL — set NEXT_PUBLIC_API_URL in the deploy environment
// (e.g. Render) to point at the production backend instead of localhost.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
