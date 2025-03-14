import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { auth } from "../firebase/config";
import { arrayUnion } from "firebase/firestore";


function CuponDetail() {
  const { id } = useParams();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    numeroTarjeta: "",
    nombreTarjeta: "",
    fechaExpiracion: "",
    codigoSeguridad: "",
  });

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
          console.warn("Cupón no encontrado.");
        }
      } catch (error) {
        console.error("Error cargando el cupón:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCupon();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidCardNumber = (cardNumber) => {
    const digits = cardNumber.replace(/\D/g, "").split("").reverse().map(Number);
    return (
      digits.reduce((sum, digit, idx) => {
        if (idx % 2 !== 0) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        return sum + digit;
      }, 0) % 10 === 0
    );
  };

  const isValidExpirationDate = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(date)) return false;
    
    const [month, year] = date.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100; // Últimos 2 dígitos del año
    const currentMonth = new Date().getMonth() + 1;

    return year > currentYear || (year === currentYear && month >= currentMonth);
  };

  const isValidCVV = (cvv) => /^[0-9]{3}$/.test(cvv);

  const handlePayment = async () => {
    const { numeroTarjeta, nombreTarjeta, fechaExpiracion, codigoSeguridad } = formData;

    if (!numeroTarjeta || !nombreTarjeta || !fechaExpiracion || !codigoSeguridad) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (!isValidCardNumber(numeroTarjeta)) {
      alert("Número de tarjeta inválido.");
      return;
    }

    if (!isValidExpirationDate(fechaExpiracion)) {
      alert("Fecha de expiración inválida o pasada.");
      return;
    }

    if (!isValidCVV(codigoSeguridad)) {
      alert("Código de seguridad inválido.");
      return;
    }

    if (cupon.cantidadDisp <= 0) {
      alert("Lo sentimos, este cupón ya no está disponible.");
      return;
    }

    try {
      const cuponRef = doc(db, "cupones", id);
      await updateDoc(cuponRef, {
        cantidadDisp: cupon.cantidadDisp - 1,
      });

      setCupon((prev) => ({ ...prev, cantidadDisp: prev.cantidadDisp - 1 }));

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          cuponesComprados: arrayUnion({
            id: cupon.id,
            titulo: cupon.titulo,
            fechaCompra: new Date().toISOString(),
            imagenURL: cupon.imagenURL,
          }),
        });
      }

      alert("Compra realizada con éxito.");
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      alert("Hubo un problema al procesar la compra.");
    }
  };

  if (loading) return <p>Cargando cupón...</p>;
  if (!cupon) return <p>No se encontró el cupón.</p>;

  return (
    <div className="compra-cupon bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <div className="flex space-x-10">
          <Link to="/miscupones">
            <i className="fa-solid fa-ticket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/perfil">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
        </div>
      </header>

      <section className="pt-28 px-28 flex justify-center">
        <div className="bg-[#d9d9d9] rounded-lg shadow p-4 text-center">
          <h1 className="monse text-xl font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h1>
          <img src={cupon.imagenURL} alt={cupon.titulo} width="100" className="w-40 mb-3 mx-auto block" />
          <p className="mb-2 text-gray-700">{cupon.descripcion}</p>
          <div className="text-justify px-4">
            <p><strong>Detalles:</strong> {cupon.detalles}</p>
            <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
            <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
            <p><strong>Fecha Límite de Uso:</strong> {cupon.fechaLimiteUsar}</p>
            <p><strong>Cantidad Disponible:</strong> {cupon.cantidadDisp}</p>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-[#3C7499] text-white mt-3 px-4 py-2 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103"
          >
            Confirmar Compra
          </button>
        </div>
      </section>

      {showPaymentModal && (
        <div className="modal-overlay flex items-center justify-center min-h-screen bg-gray-100">
          <div className="modal bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="monse text-xl font-semibold text-[#1d3557] mb-3">Ingrese los datos de su tarjeta</h2>
            <input
              type="text"
              name="numeroTarjeta"
              placeholder="Número de tarjeta"
              className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="nombreTarjeta"
              placeholder="Nombre en la tarjeta"
              className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="fechaExpiracion"
              placeholder="Fecha de expiración (MM/AA)"
              className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="codigoSeguridad"
              placeholder="Código de seguridad"
              className="w-full p-2 border border-gray-300 rounded-lg mb-2"
              onChange={handleInputChange}
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded-xl transition hover:scale-103 hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                className="bg-[#3C7499] text-white font-bold py-2 px-4 rounded-xl hover:bg-[#6da3c3] transition hover:scale-103"
              >
                Pagar
              </button>
            </div>
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
      `}</style>
    </div>
  );
}

export default CuponDetail;