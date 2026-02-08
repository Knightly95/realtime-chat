export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  TOKEN: 'demo-token',
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    AUTHORIZATION: 'Authorization',
    BEARER: 'Bearer',
  },
  ENDPOINTS: {
    MESSAGES: '/messages',
  },
  DEFAULTS: {
    MESSAGE_LIMIT: 50,
  },
};
