import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore"; // Importamos query y where
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";

export default function UsersDetail() {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal)
  }

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
        <h1 className="text-2xl text-center monse font-semibold mb-3">Usuarios Registrados</h1>
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-[#c0c8cf]">
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] mb-2 uppercase">Nombre</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] mb-2 uppercase">Correo</th>
              <th className="border border-gray-400 p-2 text-lg font-extrabold text-[#1d3557] mb-2 uppercase">Teléfono</th>
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
            <button className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103">
              Volver al Panel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}