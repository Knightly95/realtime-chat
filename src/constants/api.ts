const EXTERNAL_API_URL: string | undefined = import.meta.env.VITE_API_URL;

export const API_CONFIG = {
  /** A real backend when VITE_API_URL is set; otherwise the in-browser mock. */
  BASE_URL: EXTERNAL_API_URL || `${window.location.origin}/api/v1`,
  USE_MOCK_API: !EXTERNAL_API_URL,
  TOKEN: import.meta.env.VITE_API_TOKEN || 'demo-token',
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION: 'Authorization',
    BEARER: 'Bearer',
  },
  ENDPOINTS: {
    MESSAGES: '/messages',
    /** Who is writing a message right now: `{ typing: string[] }`. */
    TYPING: '/typing',
  },
  DEFAULTS: {
    MESSAGE_LIMIT: 50,
  },
};
