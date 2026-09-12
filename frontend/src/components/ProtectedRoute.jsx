import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function ProtectedRoute() {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
