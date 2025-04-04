import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

function ClienteDashboard() {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const fetchCupones = async () => {
      try {
        const cuponesRef = collection(db, "cupones");
        const q = query(cuponesRef, where("estado", "==", "aprobado"));
        const querySnapshot = await getDocs(q);

        const cuponesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCupones(cuponesData);
      } catch (error) {
        console.error("Error al obtener cupones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCupones();
  }, []);

  const toggleModal = () => setModal(!modal);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada con éxito.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const cuponesPorRubro = cupones.reduce((acc, cupon) => {
    const rubro = cupon.rubro || "Sin rubro";
    if (!acc[rubro]) {
      acc[rubro] = [];
    }
    acc[rubro].push(cupon);
    return acc;
  }, {});

  if (loading) return <p>Cargando cupones...</p>;

  return (
    <div className="landing bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60" />
        <div className="flex space-x-10">
          <Link to="/cliente">
            <i className="fa-solid fa-house text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/miscupones">
            <i className="fa-solid fa-ticket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            {modal && <Perfil modal={modal} toggleModal={toggleModal} />}
          </button>
          <Link to="/landingpage">
            <button onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            </button>
          </Link>
        </div>
      </header>

      <section className="pt-24 px-28">
        <h2 className="text-2xl text-center monse font-semibold mb-6">Ofertas destacadas</h2>
        
        {Object.keys(cuponesPorRubro).map((rubro) => (
          <div key={rubro} className="mb-10">
            <h3 className="text-xl font-bold mb-4 text-[#012E40] uppercase border-b border-gray-300 pb-1">{rubro}</h3>
            <div className="cupones grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1 rounded-lg place-items-center">
              {cuponesPorRubro[rubro].map((cupon) => (
                <div 
                  key={cupon.id} 
                  className="cupon bg-[#c0c8cf] rounded-lg shadow p-4 text-center w-72 h-103 flex flex-col items-center justify-center">
                  <h3 className="monse text-lg font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h3>
                  <img 
                    src={cupon.imagenURL} 
                    alt={cupon.titulo} 
                    width="100" 
                    className="w-auto h-35 mb-3 mx-auto block" 
                  />
                  <p className="mb-2 text-gray-700">{cupon.descripcion}</p>
                  <div className="text-justify px-4">
                    <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
                    <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
                  </div>
                  <Link to={`/cupon/${cupon.id}`}>
                    <button className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103">
                      Comprar Cupón
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default ClienteDashboard;