import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

// Renders children only for a verified session with the right role; otherwise
// redirects to the matching login screen before any page (or API call) runs.
function ProtectedRoute({ role, redirectTo, children }) {
  const { status, user, signedOut } = useAuth();

  if (status === "loading") {
    return <div className="route-loading">Loading…</div>;
  }

  if (!user || user.role !== role) {
    return <Navigate to={signedOut ? "/profiles" : redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
