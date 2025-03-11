import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function CuponDetail() {
  const { id } = useParams();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCupon = async () => {
      try {
        const cuponDoc = await getDoc(doc(db, "cupones", id));
        if (cuponDoc.exists()) {
          const data = cuponDoc.data();

          // Convertir el timestamp de Firebase a una fecha legible
          const fechaLimite = data.fechaLimiteUsar
            ? new Date(data.fechaLimiteUsar.seconds * 1000).toLocaleDateString("es-ES")
            : "No disponible";

          setCupon({ id: cuponDoc.id, ...data, fechaLimiteUsar: fechaLimite });
        } else {
          console.warn("⚠️ Cupón no encontrado.");
        }
      } catch (error) {
        console.error("🔥 Error cargando el cupón:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCupon();
  }, [id]);

  if (loading) return <p>Cargando cupón...</p>;
  if (!cupon) return <p>No se encontró el cupón.</p>;

  return (
    <div className="compra-cupon">
      <h1>{cupon.titulo}</h1>
      <img src={cupon.imagenURL} alt={cupon.titulo} width="300" />
      <p>{cupon.descripcion}</p>
      <p><strong>Detalles:</strong> {cupon.detalles}</p>
      <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
      <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
      <p><strong>Fecha Límite de Uso:</strong> {cupon.fechaLimiteUsar}</p>
      <button onClick={() => alert("¡Cupón comprado!")}>Confirmar Compra</button>
    </div>
  );
}

export default CuponDetail;