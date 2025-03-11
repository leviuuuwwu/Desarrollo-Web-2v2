import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ClienteDashboard from "./pages/ClienteDashboard";
import EmpresaDashboard from "./pages/EmpresaDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import CuponDetail from "./pages/CuponDetail";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal y login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas para CLIENTES */}
        <Route element={<PrivateRoute allowedRoles={["cliente"]} />}>
          <Route path="/cliente" element={<ClienteDashboard />} />
          <Route path="/cupon/:id" element={<CuponDetail />} /> {/* Nueva ruta */}
        </Route>

        {/* Rutas protegidas para EMPRESAS */}
        <Route element={<PrivateRoute allowedRoles={["empresa"]} />}>
          <Route path="/empresa" element={<EmpresaDashboard />} />
        </Route>

        {/* Rutas protegidas para ADMINISTRADORES */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Si la ruta no existe, redirigir a la página principal en lugar de login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
