import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";

export default function EmpresaDetail() {
  const [empresas, setEmpresas] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const empresasData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role === "empresa");
        setEmpresas(empresasData);
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    };

    fetchEmpresas();
  }, []);
  const toggleModal = () => {
    setModal(!modal)
  }

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const empresaRef = doc(db, "users", id);
      await updateDoc(empresaRef, { estado: nuevoEstado });

      setEmpresas(prev =>
        prev.map(emp =>
          emp.id === id ? { ...emp, estado: nuevoEstado } : emp
        )
      );
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  return (
    <div>
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60" />
        <div className="flex gap-7">
          <Link to="/ClientesDetail">
            <i className="fa-solid fa-users text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/EmpresaDetail">
            <i className="fa-solid fa-building text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
              {modal && <Perfil modal={modal} toggleModal={toggleModal}/>}
          </button>
          <Link to="/">
            <i className="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
        </div>
      </header>

      <div className="pt-24 px-28">
        <h1 className="text-2xl text-center monse font-semibold mb-3">Empresas Registradas</h1>
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-[#c0c8cf]">
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] uppercase">Nombre</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] uppercase">Correo</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] uppercase">Teléfono</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] uppercase">Estado</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length > 0 ? (
              empresas.map(empresa => (
                <tr key={empresa.id} className="text-center">
                  <td className="border border-gray-400 p-2">{empresa.fullName || "No disponible"}</td>
                  <td className="border border-gray-400 p-2">{empresa.email || "No disponible"}</td>
                  <td className="border border-gray-400 p-2">{empresa.phone || "No disponible"}</td>
                  <td className="border border-gray-400 p-2 capitalize">{empresa.estado || "pendiente"}</td>
                  <td className="border border-gray-400 p-2">
                    {empresa.estado === "pendiente" ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => actualizarEstado(empresa.id, "aprobado")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => actualizarEstado(empresa.id, "rechazado")}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic">Ya {empresa.estado}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">No hay empresas registradas</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="text-center mt-4">
          <Link to="/AdminDashboard">
            <button className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103">
              Volver al Panel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}