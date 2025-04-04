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
} from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import Perfil from "../components/ModalPerfil";

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
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Requerido"),
      email: Yup.string().email("Correo inválido").required("Requerido"),
      phone: Yup.string().required("Requerido"),
    }),
    onSubmit: async (values) => {
      const empresaId = auth.currentUser?.uid;
      if (!empresaId) return;

      const nuevoTrabajador = {
        ...values,
        rol: "trabajador",
        idEmpresa: empresaId,
      };

      try {
        await addDoc(collection(db, "users"), nuevoTrabajador);
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
          <Link to="/empresa">
            <i className="fa-solid fa-house text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <button onClick={toggleModal} className="relative bg-transparent border-none outline-none">
            <i className="fa-solid fa-user text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            {modal && <Perfil modal={modal} toggleModal={toggleModal} />}
          </button>
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
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(trabajador.id)}
                      className="text-sm text-red-600 hover:underline"
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
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Registrar Nuevo Trabajador</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-3">
              {["fullName", "email", "phone"].map((name) => (
                <div key={name}>
                  <input
                    type={name === "email" ? "email" : "text"}
                    name={name}
                    placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {formik.touched[name] && formik.errors[name] && (
                    <p className="text-red-500 text-sm">{formik.errors[name]}</p>
                  )}
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#3c7499] text-white px-4 py-2 rounded hover:bg-[#6da3c3]"
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