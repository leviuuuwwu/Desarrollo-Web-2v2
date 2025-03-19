import { useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import Perfil from "../components/ModalPerfil";
import { Link } from "react-router-dom";

function TrabajadorDashboard() {
  const [codigo, setCodigo] = useState("");
  const [cupon, setCupon] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

  const toggleModal = () => {
    setModal(!modal)
  }

  // Función para buscar el cupón
  const buscarCupon = async () => {
    if (!codigo) {
      setError("Por favor, ingresa un código de cupón.");
      return;
    }

    setLoading(true);
    setError("");
    setCupon(null);

    try {
      // Obtener el usuario autenticado (trabajador)
      const user = auth.currentUser;
      if (!user) {
        setError("No hay un usuario autenticado.");
        setLoading(false);
        return;
      }

      // Obtener la empresa del trabajador
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setError("El usuario no existe en la base de datos.");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      if (!userData.idEmpresa) {
        setError("El trabajador no tiene una empresa asociada.");
        setLoading(false);
        return;
      }

      // Buscar en todos los usuarios con rol "cliente"
      const clientesQuery = query(collection(db, "users"), where("role", "==", "cliente"));
      const clientesSnapshot = await getDocs(clientesQuery);

      let cuponEncontrado = null;
      let clienteId = null;

      for (const clienteDoc of clientesSnapshot.docs) {
        const clienteData = clienteDoc.data();
        const cuponesComprados = clienteData.cuponesComprados || [];

        const cuponBuscado = cuponesComprados.find((c) => c.codigo === codigo);

        if (cuponBuscado) {
          // Validar si el cupón pertenece a la misma empresa del trabajador
          if (cuponBuscado.idEmpresa === userData.idEmpresa) {
            cuponEncontrado = cuponBuscado;
            clienteId = clienteDoc.id;
            break; // Detener la búsqueda al encontrar el cupón válido
          }
        }
      }

      if (!cuponEncontrado) {
        setError("Cupón no encontrado o no pertenece a tu empresa.");
        setLoading(false);
        return;
      }

      // Mostrar los detalles del cupón encontrado
      setCupon({
        ...cuponEncontrado,
        clienteId,
      });

    } catch (error) {
      console.error("Error al buscar el cupón:", error);
      setError("Hubo un error al buscar el cupón.");
    } finally {
      setLoading(false);
    }
  };

  // Función para redimir el cupón
  const redimirCupon = async () => {
    if (!cupon) return;

    try {
      // Actualizar el estado del cupón en la lista de cuponesComprados del cliente
      const clienteRef = doc(db, "users", cupon.clienteId);
      const clienteDoc = await getDoc(clienteRef);

      if (!clienteDoc.exists()) {
        setError("El cliente no existe en la base de datos.");
        return;
      }

      const clienteData = clienteDoc.data();
      const cuponesActualizados = clienteData.cuponesComprados.map((c) =>
        c.codigo === cupon.codigo ? { ...c, redimido: true } : c
      );

      await updateDoc(clienteRef, {
        cuponesComprados: cuponesActualizados,
      });

      setError("");
      alert("Cupón canjeado con éxito.");
      setCupon(null);
      setCodigo("");
    } catch (error) {
      console.error("Error al canjear el cupón:", error);
      setError("No se pudo redimir el cupón.");
    }
  };

  return (
    <div className="bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <div className="flex space-x-10">
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
             {modal && <Perfil modal={modal} toggleModal={toggleModal}/>}
          </button>
          <Link to="/">
            <button>
            <i class="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            </button>
          </Link>
        </div>
      </header>

      <div className="pt-24 px-28 text-center">
        <h1 className="monse text-2xl font-extrabold mb-2 uppercase">Validar Cupón</h1>
          <input
            type="text"
            placeholder="Ingrese código del cupón"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={buscarCupon}
            className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103 ml-2"
          >
            Buscar
          </button>
      </div>

      {loading && <p className="text-center">Buscando cupón...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {cupon && (
        <section className="p-6 flex justify-center items-center">
          <div className="bg-[#c0c8cf] rounded-lg shadow p-4 text-center mb-7 w-72 h-103 flex flex-col items-center justify-center">
          
          <h2 className="monse text-lg font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h2>
          {cupon.imagenURL && (
            <img src={cupon.imagenURL} alt={cupon.titulo} className="w-auto h-35 mb-3 mx-auto block" />
          )}
          <p className="mb-2 text-gray-700">{cupon.descripcion}</p>
          <div className="text-justify px-4">
            <p><strong>Detalles:</strong> {cupon.detalles || "No especificados"}</p>
            <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
            <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
          </div>
          <button
            onClick={redimirCupon}
            className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103"
          >
            Canjear Cupón
          </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default TrabajadorDashboard;