import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ClienteDashboard from "./pages/ClienteDashboard";
import EmpresaDashboard from "./pages/EmpresaDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import CuponDetail from "./pages/CuponDetail";
import MisCupones from "./pages/MisCupones";
import Perfil from "./pages/Perfil";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal y login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/LogIn" element={<Login />} />

        {/* Rutas protegidas para CLIENTES */}
        <Route element={<PrivateRoute allowedRoles={["cliente"]} />}>
          <Route path="/Cliente" element={<ClienteDashboard />} />
          <Route path="/Cupon/:id" element={<CuponDetail />} />
          <Route path="/MisCupones" element={<MisCupones />} /> {/* Nueva ruta */}
          <Route path="/Perfil" element={<Perfil />} /> {/* Nueva ruta */}
        </Route>

        {/* Rutas protegidas para EMPRESAS */}
        <Route element={<PrivateRoute allowedRoles={["empresa"]} />}>
          <Route path="/Empresa/:id" element={<EmpresaDashboard />} />
        </Route>

        {/* Rutas protegidas para ADMINISTRADORES */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/Administrdor" element={<AdminDashboard />} />
        </Route>

        {/* Si la ruta no existe, redirigir a la página principal */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;