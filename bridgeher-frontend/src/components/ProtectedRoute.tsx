import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional: restrict by role (e.g., Learner or Mentor)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />; // 🚫 redirect if not logged in
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // 🚫 redirect if role not allowed
  }

  return <>{children}</>;
};

export default ProtectedRoute;
