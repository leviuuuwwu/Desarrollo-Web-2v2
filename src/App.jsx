import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ClienteDashboard from "./pages/ClienteDashboard";
import EmpresaDashboard from "./pages/EmpresaDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrabajadorDashboard from "./pages/TrabajadorDashboard";
import PrivateRoute from "./components/PrivateRoute";
import CuponDetail from "./pages/CuponDetail";
import MisCupones from "./pages/MisCupones";
import Perfil from "./components/ModalPerfil";
import { auth, db } from "./firebase/config";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

function RedirectAfterLogin() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Usuario autenticado:", user.uid);
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          console.log("Rol obtenido desde Firestore:", userDoc.data().role);
          setUserRole(userDoc.data().role);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (userRole) {
    console.log("Redirigiendo a dashboard según rol...");
    if (userRole === "admin") return <Navigate to="/Administrador" replace />;
    if (userRole === "cliente") return <Navigate to="/Cliente" replace />;
    if (userRole === "empresa") return <Navigate to="/Empresa" replace />;
    if (userRole === "trabajador") return <Navigate to="/Trabajador" replace />;
  }

  return null; // Si no hay usuario autenticado, no hace nada
}

function App() {
  return (
    <Router>
      <RedirectAfterLogin />
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
        </Route>

        {/* Rutas protegidas para ADMINISTRADORES */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/Administrador" element={<AdminDashboard />} />
        </Route>

        {/* Si la ruta no existe, redirigir a la página principal */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;