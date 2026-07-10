import axios from "axios";

// Create Axios instance pointing to the backend API Gateway
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Enables cookies to be sent back and forth automatically
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken = localStorage.getItem("accessToken") || null;
let refreshSubscribers = [];
let isRefreshing = false;

// Set the access token in memory and local storage
export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export const getAccessToken = () => accessToken;

// Notify all subscribers of the new access token
const onRefreshed = (token) => {
  refreshSubscribers.map((callback) => callback(token));
  refreshSubscribers = [];
};

// Add request to the refresh queue
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Request Interceptor: Attach bearer token to request authorization header
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401s and token refresh automatically
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // Check if error is 401 and request hasn't been retried yet
    if (response && response.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop on refresh route or login/register routes
      if (
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/register") ||
        originalRequest.url.includes("/auth/refresh-token")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until token is refreshed
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refresh token request (cookies contain the refresh token)
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;
        setAccessToken(newAccessToken);
        isRefreshing = false;

        // Process queued requests
        onRefreshed(newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        setAccessToken(null);

        // Dispatch a custom event to notify components/context about session expiry
        window.dispatchEvent(new Event("auth:session-expired"));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
