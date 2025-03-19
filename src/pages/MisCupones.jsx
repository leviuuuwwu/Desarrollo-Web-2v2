import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom"; 
import Perfil from "../components/ModalPerfil";

function MisCupones() {
  const [cuponesComprados, setCuponesComprados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  
  useEffect(() => {
    const fetchCuponesComprados = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn("No hay usuario autenticado");
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("Datos del usuario:", userData);

          if (!userData.cuponesComprados || !Array.isArray(userData.cuponesComprados)) {
            console.warn("El usuario no tiene cupones comprados.");
            setCuponesComprados([]);
          } else {
            console.log("Cupones comprados:", userData.cuponesComprados);
            setCuponesComprados(userData.cuponesComprados);
          }
        } else {
          console.warn("No se encontró el documento del usuario en Firestore.");
        }
      } catch (error) {
        console.error("Error al obtener los cupones comprados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCuponesComprados();
  }, []);

  const toggleModal = () => {
    setModal(!modal);
  }

  if (loading) return <p className="text-center">Cargando cupones...</p>;

  return (
    <div className="container bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <div className="flex space-x-10">
          <Link to="/clientedashboard">
            <i className="fa-solid fa-house text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/miscupones">
            <i className="fa-solid fa-ticket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            {modal && <Perfil modal={modal} toggleModal={toggleModal}/>}
          </button>
        </div>
      </header>
      

      <section className="pt-24 px-28">
        <h1 className="text-2xl font-semibold text-center mb-3 monse">Mis Cupones</h1>
        {cuponesComprados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 p-1 rounded-lg place-items-center">
            {cuponesComprados.map((cupon, index) => (
              <div key={index} 
                className="bg-[#c0c8cf] rounded-lg shadow p-4 text-center mb-7 w-72 h-103 flex flex-col items-center justify-center">
                <h2 className="monse text-xl font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo || "Título no disponible"}</h2>

                {cupon.imagenURL ? (
                  <img 
                    src={cupon.imagenURL} 
                    alt={cupon.titulo || "Cupón"} 
                    className="w-auto h-35 mb-3 mx-auto block"
                  />
                ) : (
                  <p className="text-gray-500">Imagen no disponible</p>
                )}

                <div className="text-justify px-4 mb-2">
                  <p>
                    <strong>Fecha de compra:</strong> {cupon.fechaCompra ? new Date(cupon.fechaCompra).toLocaleDateString() : "Fecha no disponible"}
                  </p>

                  {/* Levi arregla esto */}
                  <p>
                    <strong>Fecha de vencimiento:</strong> {cupon.fechaCompra ? new Date(cupon.fechaCompra).toLocaleDateString() : "Fecha no disponible"}
                  </p>
                  <p>
                    <strong>Código del cupón:</strong> {cupon.codigo || "No disponible"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
        ) : (
          <p className="text-center text-gray-500">Aún no has comprado cupones.</p>
        )}
      </section>

    </div>
  );
}

export default MisCupones;