import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getTokenPayload } from "../utils/auth";

export default function ProtectedRoute() {
  const location = useLocation();
  const payload = getTokenPayload();

  if (!payload) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
