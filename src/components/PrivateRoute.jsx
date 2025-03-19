import { Navigate, Outlet, useLocation } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = ({ allowedRoles }) => {
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

  console.log("Estado actual:", { loading, userRole });

  // 🔴 No mostrar nada hasta que loading sea false
  if (loading) {
    return <p>Cargando...</p>;
  }

  // 🔴 Si el usuario no tiene el rol adecuado, lo mandamos a login
  if (!userRole || !allowedRoles.includes(userRole)) {
    console.log("Acceso denegado. Redirigiendo a /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Si todo está bien, renderiza la ruta protegida
  return <Outlet />;
};

export default PrivateRoute;