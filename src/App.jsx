import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ClienteDashboard from "./pages/ClienteDashboard";
import EmpresaDashboard from "./pages/EmpresaDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrabajadorDashboard from "./pages/TrabajadorDashboard";
import UsersDetail from "./pages/UsersDetail"; 
import EmpresaDetail from "./pages/EmpresaDetail";
import PrivateRoute from "./components/PrivateRoute";
import CuponDetail from "./pages/CuponDetail";
import MisCupones from "./pages/MisCupones";
import Perfil from "./components/ModalPerfil";
import GestionEmpleado from "./pages/GestionEmpleado"; // 💥 NUEVA RUTA

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
          <Route path="/MisCupones" element={<MisCupones />} />
          <Route path="/Perfil" element={<Perfil />} />
        </Route>

        {/* Rutas protegidas para TRABAJADORES */}
        <Route element={<PrivateRoute allowedRoles={["trabajador"]} />}>
          <Route path="/Trabajador" element={<TrabajadorDashboard />} />
        </Route>

        {/* Rutas protegidas para EMPRESAS */}
        <Route element={<PrivateRoute allowedRoles={["empresa"]} />}>
          <Route path="/Empresa" element={<EmpresaDashboard />} />
          <Route path="/GestionEmpleado" element={<GestionEmpleado />} /> {/* 💼 NUEVA RUTA */}
        </Route>

        {/* Rutas protegidas para ADMINISTRADORES */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/Administrador" element={<AdminDashboard />} />
          <Route path="/ClientesDetail" element={<UsersDetail />} />
          <Route path="/EmpresaDetail" element={<EmpresaDetail />} />
        </Route>

        {/* Redirigir a la página principal si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;