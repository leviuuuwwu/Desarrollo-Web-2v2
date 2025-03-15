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
    <div className="bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60" />
        <div className="flex space-x-5">
          <button onClick={() => setModalOpen(true)} className="bg-[#3C7499] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103 ">+ Crear Cupón</button>
          <button onClick={() => setRedeemModalOpen(true)} className="bg-[#00ca4e] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#00f263] transition hover:scale-103">Redimir Cupón</button>
        </div>
      </header>

      <section className="pt-24 px-28">
        <h1 className="text-2xl text-center monse font-semibold mb-3">Panel de Administración</h1>
        <h2 className="text-xl font-bold mb-4 text-center">Cupones Generados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-lg place-items-center">
          {cupones.map((cupon) => (
            <div 
              key={cupon.id} 
              className="bg-[#d9d9d9] rounded-lg shadow p-4 text-center max-w-xs mx-auto mb-7">
              <h3 className="text-xl font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h3>
              <img 
                src={cupon.imagenURL}
                alt={cupon.titulo} 
                className="w-40 mb-3 mx-auto block"
              />
              <p className="mb-2 text-gray-700">{cupon.descripcion}</p>
              <div className="text-justify px-4 mb-3">
                <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
                <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
              </div>
              <span className={`ml-2 px-2 py-1 rounded-lg ${cupon.estado === "redimido" ? "bg-[#ff2323] text-white" : "bg-[#00f263]"}`}>{cupon.estado}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EmpresaDashboard;