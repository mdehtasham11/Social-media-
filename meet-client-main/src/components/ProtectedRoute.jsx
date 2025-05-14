import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const Protected = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

export default Protected;
