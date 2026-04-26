import { jwtDecode } from "jwt-decode";

export function getStoredToken() {
  return localStorage.getItem("accessToken");
}

export function getTokenPayload() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const payload = jwtDecode(token);
    if (payload?.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("accessToken");
      return null;
    }
    return payload;
  } catch {
    localStorage.removeItem("accessToken");
    return null;
  }
}

export function isAdminUser(user) {
  return Boolean(user?.is_admin) || user?.role === "admin";
}

export function canManageProjects(user) {
  return isAdminUser(user) || user?.role === "manager";
}
