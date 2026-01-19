import { Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: number[];
}) => {
  const { user, isLoading } = useAuth();

  // ⏳ Wait until auth is restored
  if (isLoading) {
    return <div>Loading...</div>; // or spinner
  }

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
