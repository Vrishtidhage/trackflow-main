import { Navigate } from "react-router-dom";
import { canManageProjects, getTokenPayload } from "../utils/auth";

export default function ProjectManagerRoute({ children }) {
  const payload = getTokenPayload();

  if (!payload) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageProjects(payload)) {
    return <Navigate to="/projects" replace />;
  }

  return children;
}
