import { useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function TrabajadroDashboard() {
  const [codigo, setCodigo] = useState("");
  const [cupon, setCupon] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Obtener el usuario actual (trabajador)
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
      if (!userData.empresaId) {
        setError("El trabajador no tiene una empresa asociada.");
        setLoading(false);
        return;
      }

      // Buscar el cupón en la colección de cupones
      const cuponesSnap = await getDoc(doc(db, "cupones", codigo));
      if (!cuponesSnap.exists()) {
        setError("Cupón no encontrado.");
        setLoading(false);
        return;
      }

      const cuponData = cuponesSnap.data();

      // Verificar si el cupón pertenece a la empresa del trabajador
      if (cuponData.idVendedor !== userData.empresaId) {
        setError("No tienes permiso para canjear este cupón.");
        setLoading(false);
        return;
      }

      // Mostrar los detalles del cupón
      setCupon({
        id: cuponesSnap.id,
        ...cuponData,
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
      await updateDoc(doc(db, "cupones", cupon.id), {
        redimido: true,
      });

      setError("");
      alert("Cupón redimido con éxito.");
      setCupon(null);
      setCodigo("");
    } catch (error) {
      console.error("Error al redimir el cupón:", error);
      setError("No se pudo redimir el cupón.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Validar Cupón</h1>

      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Ingrese código del cupón"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="p-2 border rounded-lg"
        />
        <button
          onClick={buscarCupon}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {loading && <p className="text-center">Buscando cupón...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {cupon && (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold">{cupon.titulo}</h2>
          {cupon.imagenURL && (
            <img src={cupon.imagenURL} alt={cupon.titulo} className="w-40 mx-auto my-3" />
          )}
          <p><strong>Descripción:</strong> {cupon.descripcion}</p>
          <p><strong>Detalles:</strong> {cupon.detalles || "No especificados"}</p>
          <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
          <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>

          <button
            onClick={redimirCupon}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Redimir Cupón
          </button>
        </div>
      )}
    </div>
  );
}

export default TrabajadroDashboard;
