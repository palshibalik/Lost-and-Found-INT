import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const isLoggedIn =
    localStorage.getItem("campusFindLoggedIn") === "true";

  const userEmail = localStorage.getItem("campusFindUserEmail");

  if (!isLoggedIn || !userEmail) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;