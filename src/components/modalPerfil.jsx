import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function Perfil({ modal, toggleModal }) {
  const [perfil, setPerfil] = useState({
    nombre: "Cargando...",
    telefono: "Cargando...",
    correo: "Cargando...",
  });

  useEffect(() => {
    const obtenerDatos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPerfil({ 
            nombre: data.fullName || "No disponible", 
            telefono: data.phone || "No disponible", 
            correo: user.email || "No disponible" 
          });
        }
      } catch (error) {
        console.error("Error obteniendo datos del perfil:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    modal && (
      <div id="perfil-modal" className="absolute top-full right-0 mt-2 w-85 bg-white shadow-lg rounded p-6 z-50 border border-gray-300">
        <h2 className="text-xl font-semibold text-center mb-3 monse">Mi Perfil</h2>
        <div className="text-left">
          <p><strong>Nombre:</strong> {perfil.nombre}</p>
          <p><strong>Teléfono:</strong> {perfil.telefono}</p>
          <p><strong>Correo:</strong> {perfil.correo}</p>
        </div>
        <button 
          onClick={toggleModal} 
          className="mt-3 w-full bg-[#3C7499] text-white py-1 rounded-lg hover:bg-[#6da3c3] transition hover:scale-103">
          Cerrar
        </button>
      </div>
    )
  );
}