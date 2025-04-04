import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";
import { createUserWithEmailAndPassword } from "firebase/auth";

function GestionEmpleado() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({ email: "", phone: "" });

  const obtenerTrabajadores = async () => {
    const empresaId = auth.currentUser?.uid;
    if (!empresaId) return;

    const q = query(
      collection(db, "users"),
      where("rol", "==", "trabajador"),
      where("idEmpresa", "==", empresaId)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTrabajadores(data);
  };

  useEffect(() => {
    obtenerTrabajadores();
  }, []);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Requerido"),
      email: Yup.string().email("Correo inválido").required("Requerido"),
      phone: Yup.string().required("Requerido"),
      password: Yup.string().min(6, "Mínimo 6 caracteres").required("Requerido"),
    }),
    onSubmit: async (values) => {
      const empresaId = auth.currentUser?.uid;
      if (!empresaId) return;
  
      try {
        // Crea el usuario en Auth con su contraseña
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const nuevoUsuario = userCredential.user;
  
        // Crea el documento en Firestore con el mismo UID
        await setDoc(doc(db, "users", nuevoUsuario.uid), {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          role: "trabajador",
          idEmpresa: empresaId,
        });
  
        alert("Trabajador creado exitosamente.");
        setModalOpen(false);
        formik.resetForm();
        obtenerTrabajadores();

  
      } catch (error) {
        console.error("Error al crear trabajador:", error);
      }
    },
  });  

  const handleEditar = (trabajador) => {
    setEditandoId(trabajador.id);
    setEditForm({ email: trabajador.email, phone: trabajador.phone });
  };

  const handleGuardarEdicion = async (id) => {
    try {
      const trabajadorRef = doc(db, "users", id);
      await updateDoc(trabajadorRef, {
        email: editForm.email,
        phone: editForm.phone,
      });
      setEditandoId(null);
      obtenerTrabajadores();
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este trabajador?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        obtenerTrabajadores();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const toggleModal = () => setModal(!modal);

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60" />
        <div className="flex space-x-8">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#3c7499] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#6da3c3] transition hover:scale-103"
          >
            + Añadir Trabajador
          </button>
          <Link to="/gestionempleado">
            <i className="fa-solid fa-users text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/empresa">
            <i className="fa-solid fa-house text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            {modal && <Perfil modal={modal} toggleModal={toggleModal} />}
          </button>
          <Link to="/">
            <button>
              <i className="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            </button>
          </Link>
        </div>
      </header>

      <main className="pt-28 px-20">
        <h1 className="text-2xl font-bold mb-6">Lista de Trabajadores</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trabajadores.map((trabajador) => (
            <div key={trabajador.id} className="bg-white p-4 shadow rounded-lg">
              {editandoId === trabajador.id ? (
                <>
                  <h3 className="text-lg font-bold">{trabajador.fullName}</h3>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full mt-2 p-1 border rounded"
                  />
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full mt-2 p-1 border rounded"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setEditandoId(null)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleGuardarEdicion(trabajador.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Guardar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold">{trabajador.fullName}</h3>
                  <p>
                    <strong>Email:</strong> {trabajador.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {trabajador.phone}
                  </p>
                  <div className="flex justify-end gap-4 mt-3">
                    <button
                      onClick={() => handleEditar(trabajador)}
                      className="bg-[#3C7499] text-white text-md font-bold py-2 px-4 rounded-lg hover:bg-[#6da3c3] w-full transition hover:scale-103"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(trabajador.id)}
                      className="bg-[#ff2323] text-white text-md font-bold py-2 px-4 rounded-lg hover:bg-[#ff5757] w-full transition hover:scale-103"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-center text-xl font-semibold text-[#1d3557] monse mb-3">Registrar Nuevo Trabajador</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Nombre Completo"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-red-500 text-sm">{formik.errors.fullName}</p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm">{formik.errors.email}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="phone"
                  placeholder="Teléfono"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-sm">{formik.errors.phone}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-sm">{formik.errors.password}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-[#ff2323] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#ff5757] w-full transition hover:scale-103"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#3C7499] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#6da3c3] w-full transition hover:scale-103"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionEmpleado; 