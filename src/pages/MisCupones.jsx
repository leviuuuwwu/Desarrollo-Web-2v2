import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";  // IMPORTANTE: Asegúrate de importar esto

function MisCupones() {
  const [cuponesComprados, setCuponesComprados] = useState([]);
  const [loading, setLoading] = useState(true);

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
            setCuponesComprados([]); // Evita errores
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
          <Link to="/perfil">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
        </div>
      </header>
      
      <section className="pt-24 px-28">
        <h2 className="text-2xl text-center monse font-semibold mb-3">Mis Cupones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-lg place-items-center">
          {cuponesComprados.length > 0 ? (
            cuponesComprados.map((cupon, index) => (
              <div 
                key={index} 
                className={`cupon bg-[#d9d9d9] rounded-lg shadow p-4 text-center max-w-xs mx-auto mb-7 
                  ${cuponesComprados.length === 1 ? "col-span-1" : ""}
                  ${cuponesComprados.length === 2 ? "md:col-span-2" : ""}
                  ${cuponesComprados.length > 3 && (index % 3 === 0) ? "lg:col-span-3 justify-self-center" : ""}
                `}
              >
                <h3 className="text-xl font-extrabold text-[#1d3557] mb-2 uppercase">
                  {cupon.titulo || "Título no disponible"}
                </h3>
                {cupon.imagenURL ? (
                  <img 
                    src={cupon.imagenURL} 
                    alt={cupon.titulo || "Cupón"} 
                    className="w-40 mx-auto mb-3 block" 
                  />
                ) : (
                  <p className="text-gray-500">Imagen no disponible</p>
                )}
                <div className="text-left px-4">
                  <p>
                    <strong>Fecha de compra:</strong> {cupon.fechaCompra ? new Date(cupon.fechaCompra).toLocaleDateString() : "Fecha no disponible"}
                  </p>
                  <p className="flex items-center gap-2" >
                    <strong>ID del cupón:</strong>{cupon.id || "ID no disponible"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Aún no has comprado cupones.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MisCupones;