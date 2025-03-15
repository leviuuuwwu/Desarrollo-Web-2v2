import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

function EmpresaDashboard() {
  const [cupones, setCupones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [codigoRedimir, setCodigoRedimir] = useState("");
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    detalles: "",
    cantidadDisp: 1,
    estado: "aceptado",
    fechaInicio: "",
    fechaFin: "",
    fechaLimiteUsar: "",
    imagenURL: "",
    precioOferta: "",
    precioRegular: "",
    rubro: "",
  });

  useEffect(() => {
    const obtenerCupones = async () => {
      const empresaId = auth.currentUser?.uid;
      if (!empresaId) return;
      const q = query(collection(db, "cupones"), where("idVendedor", "==", empresaId));
      const querySnapshot = await getDocs(q);
      setCupones(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    obtenerCupones();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const crearCupon = async () => {
    const empresaId = auth.currentUser?.uid;
    if (!empresaId) {
      alert("Error: No hay usuario autenticado.");
      return;
    }

    const codigoUnico = uuidv4().slice(0, 8);
    const nuevoCupon = {
      ...formData,
      idVendedor: empresaId,
      codigo: codigoUnico,
      estado: "activo",
    };

    try {
      const docRef = await addDoc(collection(db, "cupones"), nuevoCupon);
      alert(`Cupón creado exitosamente. Código: ${codigoUnico}`);
      setCupones([...cupones, { id: docRef.id, ...nuevoCupon }]);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al crear cupón:", error);
    }
  };

  const redimirCupon = async () => {
    try {
      const cuponRef = doc(db, "cupones", codigoRedimir);
      const cuponSnap = await getDoc(cuponRef);

      if (!cuponSnap.exists()) {
        alert("Cupón no encontrado. Verifique el ID.");
        return;
      }

      const cuponData = cuponSnap.data();

      if (cuponData.estado === "redimido") {
        alert("Este cupón ya fue redimido.");
        return;
      }

      await updateDoc(cuponRef, { estado: "redimido" });

      alert("Cupón redimido exitosamente.");
      setRedeemModalOpen(false);
      setCupones(prevCupones =>
        prevCupones.map(cupon =>
          cupon.id === codigoRedimir ? { ...cupon, estado: "redimido" } : cupon
        )
      );
    } catch (error) {
      console.error("Error al redimir cupón:", error);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <button onClick={() => setModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">+ Crear Cupón</button>
      <button onClick={() => setRedeemModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded mb-4 ml-2">🎟️ Redimir Cupón</button>
      <h2 className="text-xl font-semibold mb-2">Cupones Generados</h2>
      <ul>
        {cupones.map((cupon) => (
          <li key={cupon.id} className="border p-2 mb-2">
            <strong>{cupon.titulo}</strong> - {cupon.descripcion}
            <span className={`ml-2 px-2 py-1 text-sm rounded ${cupon.estado === "redimido" ? "bg-red-500 text-white" : "bg-green-300"}`}>{cupon.estado}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmpresaDashboard;