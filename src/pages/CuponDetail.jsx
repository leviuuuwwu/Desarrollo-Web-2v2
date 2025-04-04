import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";
import { signOut } from "firebase/auth";

function CuponDetail() {
  const { id } = useParams();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
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

          let fechaLimite = "No disponible";
          if (data.fechaLimiteUsar) {
            const fecha = new Date(data.fechaLimiteUsar);
            if (!isNaN(fecha)) {
              fechaLimite = fecha.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            } else {
              fechaLimite = data.fechaLimiteUsar; // ya es string válido
            }
          }

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

  const toggleModal = () => {
    setModal(!modal);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handlePayment = async () => {
    if (!formData.numeroTarjeta || !formData.nombreTarjeta || !formData.fechaExpiracion || !formData.codigoSeguridad) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    if (!cupon.cantidadDisp || cupon.cantidadDisp <= 0) {
      alert("Lo sentimos, este cupón ya no está disponible.");
      return;
    }

    try {
      const cuponRef = doc(db, "cupones", id);
      await updateDoc(cuponRef, { cantidadDisp: cupon.cantidadDisp - 1 });

      setCupon((prev) => ({ ...prev, cantidadDisp: prev.cantidadDisp - 1 }));

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const cuponUUID = uuidv4();

        await updateDoc(userRef, {
          cuponesComprados: arrayUnion({
            codigo: cuponUUID,
            titulo: cupon.titulo,
            imagenURL: cupon.imagenURL,
            fechaCompra: new Date().toISOString(),
            idEmpresa: cupon.idVendedor,
            redimido: false,
          }),
        });

        const empresaRef = doc(db, "users", cupon.idVendedor);
        await updateDoc(empresaRef, {
          cuponesVendidos: arrayUnion(cuponUUID),
        });

        alert("Compra realizada con éxito. Tu código único es: " + cuponUUID);
      }

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
        <img src="/CM.png" alt="logo" className="w-60" />
        <div className="flex space-x-10">
          <Link to="/cliente">
            <i className="fa-solid fa-house text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/miscupones">
            <i className="fa-solid fa-ticket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            {modal && <Perfil modal={modal} toggleModal={toggleModal} />}
          </button>
          <Link to="/landingpage">
            <button onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            </button>
          </Link>
        </div>
      </header>

      <section className="pt-28 px-28 flex justify-center">
        <div className="bg-[#c0c8cf] rounded-lg shadow p-4 text-center mb-7 w-80 h-auto flex flex-col items-center justify-center">
          <h1 className="text-lg font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h1>
          <img src={cupon.imagenURL} alt={cupon.titulo} className="w-auto h-35 mb-3 mx-auto block" />
          <p className="mb-2 text-gray-700">{cupon.descripcion}</p>
          <div className="text-left ml-3">
            <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
            <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
            <p><strong>Fecha Límite de Uso:</strong> {cupon.fechaLimiteUsar}</p>
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
        <div className="modal-overlay fixed inset-0 top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200">
          <div className="modal bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-center text-xl font-semibold text-[#1d3557] monse mb-3">Ingrese los datos de su tarjeta</h2>
            <div className="space-y-2">
              <input type="text" name="numeroTarjeta" placeholder="Número de tarjeta" className="w-full p-2 border border-gray-300 rounded-lg" onChange={handleInputChange} />
              <input type="text" name="nombreTarjeta" placeholder="Nombre en la tarjeta" className="w-full p-2 border border-gray-300 rounded-lg" onChange={handleInputChange} />
              <input type="text" name="fechaExpiracion" placeholder="Fecha de expiración (MM/AA)" className="w-full p-2 border border-gray-300 rounded-lg" onChange={handleInputChange} />
              <input type="text" name="codigoSeguridad" placeholder="Código de seguridad" className="w-full p-2 border border-gray-300 rounded-lg" onChange={handleInputChange} />
            </div>
            <div className="flex items-center mt-4 gap-2">
              <button onClick={() => setShowPaymentModal(false)} className="bg-[#ff2323] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#ff5757] w-full transition hover:scale-103">Cancelar</button>
              <button onClick={handlePayment} className="bg-[#3C7499] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#6da3c3] w-full transition hover:scale-103">Pagar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CuponDetail;