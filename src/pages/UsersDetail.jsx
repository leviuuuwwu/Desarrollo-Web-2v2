import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore"; // Importamos query y where
import { Link } from "react-router-dom";

export default function UsersDetail() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Realizamos la consulta para filtrar por 'role' = 'cliente'
        const usersQuery = query(collection(db, "users"), where("role", "==", "cliente"));
        const snapshot = await getDocs(usersQuery); // Usamos la consulta filtrada
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsuarios(usersData);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-center mb-4">Usuarios Registrados</h1>
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 p-2">Nombre</th>
            <th className="border border-gray-400 p-2">Correo</th>
            <th className="border border-gray-400 p-2">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length > 0 ? (
            usuarios.map(user => (
              <tr key={user.id} className="text-center">
                <td className="border border-gray-400 p-2">{user.fullName || "No disponible"}</td>
                <td className="border border-gray-400 p-2">{user.email || "No disponible"}</td>
                <td className="border border-gray-400 p-2">{user.phone || "No disponible"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-4">No hay usuarios registrados</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="text-center mt-4">
        <Link to="/AdminDashboard">
          <button className="bg-[#3C7499] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#6da3c3] transition hover:scale-103">
            Volver al Panel
          </button>
        </Link>
      </div>
    </div>
  );
}