import { Navigate, useLocation } from "react-router-dom";
import { getTokenPayload, isAdminUser } from "../utils/auth";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const payload = getTokenPayload();

  if (!payload) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdminUser(payload)) {
    return <Navigate to="/projects" replace />;
  }

  return children;
}
