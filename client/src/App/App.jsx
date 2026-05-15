import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "../Home/Home";
import Login from "../Login/Login";
import Review from "../Reviews/Reviews";
import ProtectedRoute from "../ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Rota da Home */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Rota para a LISTA de todas as reviews */}
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />

      {/* Rota para uma review INDIVIDUAL */}
      <Route
        path="/review/:id"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />

      {/* Se a rota não existir, volta para o Login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
