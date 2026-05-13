// No App.jsx ou em um arquivo separado
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Se não tem token, manda pro login de verdade
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;