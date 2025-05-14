import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const AdminProtected = ({ element }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!isAuthenticated() || user.role !== "admin") {
    return <Navigate to="/login" />;
  }
  return element;
};

export default AdminProtected;