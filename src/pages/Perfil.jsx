import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function Perfil() {
  const user = auth.currentUser;
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    contraseña: "",
    contraseñaActual: "", // Necesaria para reautenticación
  });

  useEffect(() => {
    if (user) {
      const obtenerDatos = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setFormData({ ...userDoc.data(), correo: user.email, contraseña: "", contraseñaActual: "" });
        }
      };
      obtenerDatos();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const reauthenticateUser = async () => {
    const credential = EmailAuthProvider.credential(user.email, formData.contraseñaActual);
    await reauthenticateWithCredential(user, credential);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (user) {
        const userRef = doc(db, "usuarios", user.uid);
        await updateDoc(userRef, {
          nombre: formData.nombre,
          telefono: formData.telefono,
        });

        await updateProfile(user, { displayName: formData.nombre });

        if (formData.contraseña) {
          await updatePassword(user, formData.contraseña);
        }

        if (formData.correo !== user.email) {
          await reauthenticateUser();
          await updateEmail(user, formData.correo);
        }

        alert("Perfil actualizado con éxito");
      }
    } catch (error) {
      alert("Error al actualizar perfil: " + error.message);
    }
  };

  return (
    <div>
      <h1>Mi Perfil</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
        </label>
        <br />
        <label>
          Teléfono:
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
        </label>
        <br />
        <label>
          Correo:
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} />
        </label>
        <br />
        <label>
          Contraseña actual (requerida para cambiar correo):
          <input type="password" name="contraseñaActual" value={formData.contraseñaActual} onChange={handleChange} />
        </label>
        <br />
        <label>
          Nueva Contraseña:
          <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} />
        </label>
        <br />
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
}

export default Perfil;