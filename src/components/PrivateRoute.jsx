import { Navigate, Outlet } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = ({ allowedRoles }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
