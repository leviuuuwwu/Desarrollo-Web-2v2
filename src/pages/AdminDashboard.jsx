import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";

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
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <div className="flex space-x-10">
          <Link to="/">
            <button>
            <i class="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            </button>
          </Link>
        </div>
      </header>

      <section className="pt-24 px-28">
        <h1 className="text-2xl text-center monse font-semibold mb-3">Panel de Administración</h1>

        <h2 className="text-xl font-bold mb-4 text-center">Empresas Pendientes</h2>
        <div>
          {empresas.length > 0 ? (
            empresas.map(empresa => (
              <div key={empresa.id}>
                {empresa.nombre}{" "}
                <button onClick={() => aprobarEmpresa(empresa.id)}>Aprobar</button>
              </div>
            ))
          ) : (
            <p>No hay empresas pendientes</p>
          )}
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">Cupones Pendientes</h2>
        <div>
          {cupones.length > 0 ? (
            cupones.map(cupon => (
              <div key={cupon.id}>
                {cupon.codigo} - {cupon.descuento}%{" "}
                <button onClick={() => aprobarCupon(cupon.id)}>Aprobar</button>
              </div>
            ))
          ) : (
            <p>No hay cupones pendientes</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;