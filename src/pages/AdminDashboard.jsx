import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";

function AdminDashboard() {
  const [cupones, setCupones] = useState([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const fetchCupones = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cupones"));
        const cuponesPendientes = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(cupon => cupon.estado === "pendiente");
        setCupones(cuponesPendientes);
      } catch (error) {
        console.error("Error cargando cupones:", error);
      }
    };

    fetchCupones();
  }, []);

  const aprobarCupon = async (id) => {
    await updateDoc(doc(db, "cupones", id), { estado: "aprobado" });
    setCupones(cupones.filter(cupon => cupon.id !== id));
  };

  const rechazarCupon = async (id) => {
    const motivo = prompt("Ingresa el motivo de rechazo:");
    if (!motivo) return;
    await updateDoc(doc(db, "cupones", id), { estado: "rechazado", motivoRechazo: motivo });
    setCupones(cupones.filter(cupon => cupon.id !== id));
  };

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

      {/* cupones */}
      <section className="pt-24 px-28">
        <h1 className="text-2xl text-center monse font-semibold mb-3">Panel de Administración</h1>

        <h2 className="text-xl font-bold mb-4 text-center">Cupones Pendientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 p-1 rounded-lg place-items-center">
          {cupones.length > 0 ? (
            cupones.map(cupon => cupon && (
              <div key={cupon.id} className="bg-[#c0c8cf] rounded-lg shadow p-4 text-center mb-7 w-72 h-110 flex flex-col items-center justify-center">
                <h3 className="monse text-lg font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo || "Sin título"}</h3>
                {cupon.imagenURL && <img src={cupon.imagenURL} alt="Cupón" className="w-auto h-35 mb-3 mx-auto block" />}
                <p className="mb-2 text-gray-700">{cupon.detalles || "No disponible"}</p>
                <p><strong>Precio Oferta:</strong> ${cupon.precioOferta || "N/A"}</p>
                <p><strong>Precio Regular:</strong> ${cupon.precioRegular || "N/A"}</p>
                <div className="space-x-2 mt-2">
                  <button onClick={() => rechazarCupon(cupon.id)} className="bg-[#ff2323] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#ff5757] transition hover:scale-103">Rechazar</button>
                  <button onClick={() => aprobarCupon(cupon.id)} className="bg-[#3C7499] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#6da3c3] transition hover:scale-103">Aprobar</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No hay cupones pendientes</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;