import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom"; 

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
      
      <h1 className="text-2xl font-bold text-center mb-4">Mis Cupones</h1>

      {cuponesComprados.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cuponesComprados.map((cupon, index) => (
            <li key={index} className="bg-white shadow-md rounded-lg p-4 text-center">
              <h2 className="text-lg font-semibold">{cupon.titulo || "Título no disponible"}</h2>

              {cupon.imagenURL ? (
                <img 
                  src={cupon.imagenURL} 
                  alt={cupon.titulo || "Cupón"} 
                  className="w-40 h-40 object-cover mx-auto my-2 rounded-lg shadow-md"
                />
              ) : (
                <p className="text-gray-500">Imagen no disponible</p>
              )}

              <p className="text-gray-500">
                Fecha de compra: {cupon.fechaCompra ? new Date(cupon.fechaCompra).toLocaleDateString() : "Fecha no disponible"}
              </p>
              <p className="text-gray-700">
                Código del cupón: <strong>{cupon.codigo || "No disponible"}</strong>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">Aún no has comprado cupones.</p>
      )}
    </div>
  );
}

export default MisCupones;
