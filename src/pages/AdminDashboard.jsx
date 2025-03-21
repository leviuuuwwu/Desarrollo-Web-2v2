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
        <div>
          {cupones && cupones.length > 0 ? (
            cupones.map(cupon => cupon && (
              <div key={cupon.id} className="mb-6 p-4 border rounded shadow">
                <h3 className="font-semibold">{cupon.titulo ? cupon.titulo : "Sin título"}</h3>
                <p><strong>Detalle:</strong> {cupon.detalles ? cupon.detalles : "No disponible"}</p>
                <p><strong>Precio Oferta:</strong> ${cupon.precioOferta ? cupon.precioOferta : "N/A"}</p>
                <p><strong>Precio Regular:</strong> ${cupon.precioRegular ? cupon.precioRegular : "N/A"}</p>
                <p><strong>Fecha Inicio:</strong> {formatFecha(cupon.fechaInicio)}</p>
                <p><strong>Fecha Fin:</strong> {formatFecha(cupon.fechaFin)}</p>

                {cupon.precioRegular && cupon.precioOferta && (
                  <p>
                    <strong>Descuento:</strong> {((1 - cupon.precioOferta / cupon.precioRegular) * 100).toFixed(2)}%
                  </p>
                )}

                {cupon.imagenURL && <img src={cupon.imagenURL} alt="Cupón" className="w-40 h-40 object-cover mt-2 rounded" />}

                <div className="space-x-2 mt-2">
                  <button onClick={() => aprobarCupon(cupon.id)} className="bg-green-500 text-white px-3 py-1 rounded">Aprobar</button>
                  <button onClick={() => rechazarCupon(cupon.id)} className="bg-red-500 text-white px-3 py-1 rounded">Rechazar</button>
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