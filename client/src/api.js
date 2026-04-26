import axios from "axios";

const LOCAL_API_URL = "http://127.0.0.1:8000";
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && !configuredApiUrl) {
  // Vercel cannot reach your local backend. Set VITE_API_URL in Vercel
  // to the deployed FastAPI backend URL before production deployment.
  console.warn("VITE_API_URL is not set. API requests will use the local backend URL.");
}

const BASE_URL = configuredApiUrl || LOCAL_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

function isAuthRequest(config) {
  const url = config?.url || "";
  return url.includes("/auth/login") || url.includes("/auth/admin-login");
}

function clearInvalidSession(config) {
  if (isAuthRequest(config)) return;

  localStorage.removeItem("accessToken");

  const path = window.location.pathname;
  const isPublicPath =
    path === "/" ||
    path === "/login" ||
    path === "/register" ||
    path === "/admin/login";

  if (!isPublicPath) {
    window.location.replace("/login");
  }
}

function attachToken(config) {
  const token = localStorage.getItem("accessToken");
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

function normalizeError(err) {
  const backend = err.response?.data;
  if (err.response?.status === 401) {
    clearInvalidSession(err.config);
  }

  err.message = backend?.message || backend?.detail || "Something went wrong";
  return Promise.reject(err);
}

axios.interceptors.request.use(attachToken);
axios.interceptors.response.use((res) => res, normalizeError);

api.interceptors.request.use(attachToken);
api.interceptors.response.use((res) => {
  if (res.data?.success !== undefined) {
    return {
      ...res,
      data: res.data.data,
      message: res.data.message,
      success: res.data.success,
    };
  }

  return res;
}, normalizeError);

export { api };
export default BASE_URL;
