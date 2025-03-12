import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function CuponDetail() {
  const { id } = useParams();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchCupon = async () => {
      try {
        const cuponDoc = await getDoc(doc(db, "cupones", id));
        if (cuponDoc.exists()) {
          const data = cuponDoc.data();

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
      <p><strong>Cantidad Disponible:</strong> {cupon.cantidadDisp}</p>
      <button onClick={() => setShowPaymentModal(true)}>Confirmar Compra</button>

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Ingrese los datos de su tarjeta</h2>
            <input type="text" placeholder="Número de tarjeta" />
            <input type="text" placeholder="Nombre en la tarjeta" />
            <input type="text" placeholder="Fecha de expiración (MM/AA)" />
            <input type="text" placeholder="Código de seguridad" />
            <button onClick={() => alert("Compra realizada con éxito")}>Pagar</button>
            <button onClick={() => setShowPaymentModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .modal input {
          display: block;
          width: 100%;
          margin: 10px 0;
          padding: 8px;
        }
        .modal button {
          margin: 10px;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default CuponDetail;
