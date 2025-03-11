import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

function ClienteDashboard() {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCupones = async () => {
      try {
        console.log("✅ Intentando conectar a Firestore...");
        
        const cuponesRef = collection(db, "cupones");
        const querySnapshot = await getDocs(cuponesRef);

        if (querySnapshot.empty) {
          console.warn("⚠️ No hay cupones en la base de datos.");
        } else {
          console.log("🎉 Datos obtenidos de Firestore:", querySnapshot.docs.map(doc => doc.data()));
        }

        const cuponesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCupones(cuponesData);
      } catch (error) {
        console.error("🔥 Error al obtener cupones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCupones();
  }, []);

  useEffect(() => {
    console.log("🔄 Estado actualizado: cupones =", cupones);
  }, [cupones]);

  if (loading) return <p>Cargando cupones...</p>;

  return (
    <div className="landing">
      <header>
        <h1>Bienvenido a CuponeraX</h1>
        <p>Aprovecha los mejores descuentos en restaurantes, tiendas y más.</p>
      </header>

      <section>
        <h2>Ofertas destacadas</h2>
        <div className="cupones">
          {cupones.length > 0 ? (
            cupones.map((cupon) => (
              <div key={cupon.id} className="cupon">
                <h3>{cupon.titulo}</h3>
                <p>{cupon.descripcion}</p>
                <img src={cupon.imagenURL} alt={cupon.titulo} width="100" />
                <p>Precio Oferta: ${cupon.precioOferta}</p>
                <Link to={`/cupon/${cupon.id}`}>
                  <button>Comprar Cupón</button>
                </Link>
              </div>
            ))
          ) : (
            <p>No hay cupones disponibles.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ClienteDashboard;
