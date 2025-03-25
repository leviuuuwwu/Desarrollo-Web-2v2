import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [empresas, setEmpresas] = useState([]);
  const [cupones, setCupones] = useState([]);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "empresas"));
        const empresasPendientes = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(empresa => empresa.estado === "pendiente");
        setEmpresas(empresasPendientes);
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    };

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

    fetchEmpresas();
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

  // Función para formatear fechas de Firestore
  const formatFecha = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "No especificada";
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <div>
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <Link to="/">
          <button>
            <i className="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </button>
        </Link>
      </header>

      <section className="pt-24 px-28">
        <h1 className="text-2xl text-center monse font-semibold mb-3">Panel de Administración</h1>

        {/* Cupones Pendientes */}
        <h2 className="text-xl font-bold mb-4 text-center">Cupones Pendientes</h2>
        <div className="cupones grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 p-1 rounded-lg place-items-center">
          {cupones && cupones.length > 0 ? (
            cupones.map(cupon => cupon && (
              <div key={cupon.id} className="bg-[#c0c8cf] rounded-lg shadow p-4 text-center mb-7 w-72 h-110 flex flex-col items-center justify-center">
                <h3 className="monse text-lg font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo ? cupon.titulo : "Sin título"}</h3>
                {cupon.imagenURL && <img src={cupon.imagenURL} alt="Cupón" className="w-auto h-35 mb-3 mx-auto block" />}
                <p className="mb-2 text-gray-700">{cupon.detalles ? cupon.detalles : "No disponible"}</p>
                <div className="text-justify px-4">
                  <p><strong>Precio Oferta:</strong> ${cupon.precioOferta ? cupon.precioOferta : "N/A"}</p>
                  <p><strong>Precio Regular:</strong> ${cupon.precioRegular ? cupon.precioRegular : "N/A"}</p>
                  <p><strong>Fecha Inicio:</strong> {formatFecha(cupon.fechaInicio)}</p>
                  <p><strong>Fecha Fin:</strong> {formatFecha(cupon.fechaFin)}</p>
                 {cupon.precioRegular && cupon.precioOferta && (
                  <p>
                    <strong>Descuento:</strong> {((1 - cupon.precioOferta / cupon.precioRegular) * 100).toFixed(2)}%
                  </p>
                )}
                </div>
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