import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ClienteDashboard from "./pages/ClienteDashboard";
import EmpresaDashboard from "./pages/EmpresaDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal y login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas según el rol del usuario */}
        <Route element={<PrivateRoute allowedRoles={["cliente"]} />}>
          <Route path="/cliente" element={<ClienteDashboard />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={["empresa"]} />}>
          <Route path="/empresa" element={<EmpresaDashboard />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Redirigir cualquier ruta desconocida a /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
