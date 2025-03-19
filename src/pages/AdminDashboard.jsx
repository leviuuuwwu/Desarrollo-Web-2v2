import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

function AdminDashboard() {
  const [empresas, setEmpresas] = useState([]);
  const [cupones, setCupones] = useState([]);

  useEffect(() => {
    // Cargar empresas pendientes
    const fetchEmpresas = async () => {
      const empresasRef = collection(db, "empresas");
      const snapshot = await getDocs(empresasRef);
      const empresasPendientes = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(empresa => empresa.estado === "pendiente");
      setEmpresas(empresasPendientes);
    };

    // Cargar cupones pendientes
    const fetchCupones = async () => {
      const cuponesRef = collection(db, "cupones");
      const snapshot = await getDocs(cuponesRef);
      const cuponesPendientes = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(cupon => cupon.estado === "pendiente");
      setCupones(cuponesPendientes);
    };

    fetchEmpresas();
    fetchCupones();
  }, []);

  const aprobarEmpresa = async (id) => {
    await updateDoc(doc(db, "empresas", id), { estado: "aprobado" });
    setEmpresas(empresas.filter(empresa => empresa.id !== id));
  };

  const aprobarCupon = async (id) => {
    await updateDoc(doc(db, "cupones", id), { estado: "aprobado" });
    setCupones(cupones.filter(cupon => cupon.id !== id));
  };

  return (
    <div>
      <h1>Panel de Administración</h1>

      <h2>Empresas Pendientes</h2>
      <ul>
        {empresas.length > 0 ? (
          empresas.map(empresa => (
            <li key={empresa.id}>
              {empresa.nombre}{" "}
              <button onClick={() => aprobarEmpresa(empresa.id)}>Aprobar</button>
            </li>
          ))
        ) : (
          <p>No hay empresas pendientes</p>
        )}
      </ul>

      <h2>Cupones Pendientes</h2>
      <ul>
        {cupones.length > 0 ? (
          cupones.map(cupon => (
            <li key={cupon.id}>
              {cupon.codigo} - {cupon.descuento}%{" "}
              <button onClick={() => aprobarCupon(cupon.id)}>Aprobar</button>
            </li>
          ))
        ) : (
          <p>No hay cupones pendientes</p>
        )}
      </ul>
    </div>
  );
}

export default AdminDashboard;