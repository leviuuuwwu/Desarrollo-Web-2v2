import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
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
          .filter(user => user.role === "empresa"); // Filtrando solo empresas
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

  return (
    <div>
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
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
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] mb-2 uppercase">Nombre</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] mb-2 uppercase">Correo</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] mb-2 uppercase">Teléfono</th>
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
            <button className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103">
              Volver al Panel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
