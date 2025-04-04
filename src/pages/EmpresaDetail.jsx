import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function EmpresaDetail() {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const empresasData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === "empresa"); // Filtrando solo empresas
        setEmpresas(empresasData);
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    };

    fetchEmpresas();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-center mb-4">Empresas Registradas</h1>
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 p-2">Nombre</th>
            <th className="border border-gray-400 p-2">Correo</th>
            <th className="border border-gray-400 p-2">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {empresas.length > 0 ? (
            empresas.map(empresa => (
              <tr key={empresa.id} className="text-center">
                <td className="border border-gray-400 p-2">{empresa.fullName || "No disponible"}</td>
                <td className="border border-gray-400 p-2">{empresa.email || "No disponible"}</td>
                <td className="border border-gray-400 p-2">{empresa.phone || "No disponible"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-4">No hay empresas registradas</td>
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
