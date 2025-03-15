import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";

function EmpresaDashboard() {
  const [cupones, setCupones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const obtenerCupones = async () => {
      const empresaId = auth.currentUser?.uid;
      if (!empresaId) return;
      const q = query(collection(db, "cupones"), where("idVendedor", "==", empresaId));
      const querySnapshot = await getDocs(q);
      setCupones(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    obtenerCupones();
  }, []);

  const formik = useFormik({
    initialValues: {
      titulo: "",
      descripcion: "",
      detalles: "",
      cantidadDisp: 1,
      fechaInicio: "",
      fechaFin: "",
      fechaLimiteUsar: "",
      imagenURL: "",
      precioOferta: "",
      precioRegular: "",
      rubro: "",
    },
    validationSchema: Yup.object({
      titulo: Yup.string().required("Requerido"),
      descripcion: Yup.string().required("Requerido"),
      detalles: Yup.string().required("Requerido"),
      cantidadDisp: Yup.number().min(1, "Debe ser al menos 1").required("Requerido"),
      fechaInicio: Yup.date().required("Requerido"),
      fechaFin: Yup.date().required("Requerido"),
      fechaLimiteUsar: Yup.date().required("Requerido"),
      imagenURL: Yup.string().url("Debe ser una URL válida").required("Requerido"),
      precioOferta: Yup.number().min(0, "Debe ser positivo").required("Requerido"),
      precioRegular: Yup.number().min(0, "Debe ser positivo").required("Requerido"),
      rubro: Yup.string().oneOf(["diversión", "tecnología", "comida"], "Selección inválida").required("Requerido"),
    }),
    onSubmit: async (values) => {
      const empresaId = auth.currentUser?.uid;
      if (!empresaId) {
        alert("Error: No hay usuario autenticado.");
        return;
      }

      const nuevoCupon = {
        ...values,
        idVendedor: empresaId,
        estado: "activo",
      };

      try {
        const docRef = await addDoc(collection(db, "cupones"), nuevoCupon);
        alert("Cupón creado exitosamente.");
        setCupones([...cupones, { id: docRef.id, ...nuevoCupon }]);
        setModalOpen(false);
        formik.resetForm();
      } catch (error) {
        console.error("Error al crear cupón:", error);
      }
    },
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <button onClick={() => setModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        + Crear Cupón
      </button>

      <h2 className="text-xl font-semibold mb-2">Cupones Generados</h2>
      <ul>
        {cupones.map((cupon) => (
          <li key={cupon.id} className="border p-2 mb-2">
            <strong>{cupon.titulo}</strong> - {cupon.descripcion}
            <span className="ml-2 px-2 py-1 text-sm rounded bg-green-300">{cupon.estado}</span>
          </li>
        ))}
      </ul>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Crear Cupón</h2>

            <form onSubmit={formik.handleSubmit}>
              {[
                { name: "titulo", type: "text", placeholder: "Título" },
                { name: "descripcion", type: "text", placeholder: "Descripción" },
                { name: "detalles", type: "textarea", placeholder: "Detalles" },
                { name: "cantidadDisp", type: "number", placeholder: "Cantidad Disponible" },
                { name: "fechaInicio", type: "datetime-local" },
                { name: "fechaFin", type: "datetime-local" },
                { name: "fechaLimiteUsar", type: "datetime-local" },
                { name: "imagenURL", type: "text", placeholder: "URL de Imagen" },
                { name: "precioOferta", type: "number", placeholder: "Precio Oferta" },
                { name: "precioRegular", type: "number", placeholder: "Precio Regular" },
              ].map(({ name, type, placeholder }) => (
                <div key={name} className="mb-2">
                  {type === "textarea" ? (
                    <textarea
                      name={name}
                      placeholder={placeholder}
                      value={formik.values[name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border p-2"
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      placeholder={placeholder}
                      value={formik.values[name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border p-2"
                    />
                  )}
                  {formik.touched[name] && formik.errors[name] && (
                    <p className="text-red-500 text-sm">{formik.errors[name]}</p>
                  )}
                </div>
              ))}

              {/* Select de Rubro */}
              <div className="mb-2">
                <select
                  name="rubro"
                  value={formik.values.rubro}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border p-2"
                >
                  <option value="">Selecciona un rubro</option>
                  <option value="diversión">Diversión</option>
                  <option value="tecnología">Tecnología</option>
                  <option value="comida">Comida</option>
                </select>
                {formik.touched.rubro && formik.errors.rubro && (
                  <p className="text-red-500 text-sm">{formik.errors.rubro}</p>
                )}
              </div>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                Guardar
              </button>
              <button type="button" onClick={() => setModalOpen(false)} className="mt-2 text-gray-500 underline w-full">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmpresaDashboard;
