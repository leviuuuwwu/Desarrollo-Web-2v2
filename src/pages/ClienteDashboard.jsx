import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";

function ClienteDashboard() {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const fetchCupones = async () => {
      try {
        console.log("Intentando conectar a Firestore...");
        
        const cuponesRef = collection(db, "cupones");
        const querySnapshot = await getDocs(cuponesRef);

        if (querySnapshot.empty) {
          console.warn("No hay cupones en la base de datos.");
        } else {
          console.log("Datos obtenidos de Firestore:", querySnapshot.docs.map(doc => doc.data()));
        }

        const cuponesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCupones(cuponesData);
      } catch (error) {
        console.error("Error al obtener cupones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCupones();
  }, []);

  const toggleModal = () => {
    setModal(!modal)
  }

  useEffect(() => {
    console.log("Estado actualizado: cupones =", cupones);
  }, [cupones]);

  if (loading) return <p>Cargando cupones...</p>;

  return (
    <div className="landing bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <div className="flex space-x-10">
          <Link to="/cliente">
            <i className="fa-solid fa-house text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/miscupones">
            <i className="fa-solid fa-ticket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
             {modal && <Perfil modal={modal} toggleModal={toggleModal}/>}
          </button>
          <Link to="/">
            <button>
            <i class="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            </button>
          </Link>
        </div>
      </header>

      <section className="pt-24 px-28">
        <h2 className="text-2xl text-center monse font-semibold mb-3">Ofertas destacadas</h2>
        <div className="cupones grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 p-1 rounded-lg place-items-center">
          {cupones.length > 0 ? (
            cupones.map((cupon) => (
              <div 
                key={cupon.id} 
                className="cupon bg-[#c0c8cf] rounded-lg shadow p-4 text-center mb-7 w-72 h-103 flex flex-col items-center justify-center">
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
                  <button className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103">Comprar Cupón</button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No hay cupones disponibles.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ClienteDashboard;
