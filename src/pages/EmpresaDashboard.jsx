import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";

function EmpresaDashboard() {
  const [cupones, setCupones] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const obtenerCupones = async () => {
      const empresaId = auth.currentUser?.uid;
      if (!empresaId) return;
      const q = query(collection(db, "cupones"), where("idEmpresa", "==", empresaId));
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
      rubro: Yup.string().oneOf(["diversión", "tecnología", "comida", "belleza"], "Selección inválida").required("Requerido"),
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
        estado: "pendiente",
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
    <div className="bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <div className="flex space-x-8">
          <button onClick={() => setModalOpen(true)} className="bg-[#3c7499] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#6da3c3] transition hover:scale-103">
            + Crear Cupón
          </button>
          <Link to="/gestionempleado">
            <i className="fa-solid fa-users text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
          </Link>
          <Link to="/">
            <button>
            <i class="fa-solid fa-arrow-right-from-bracket text-white text-3xl hover:scale-130 transition cursor-pointer"></i>
            </button>
          </Link>
        </div>
      </header>
      
      <section className="pt-24 px-28">
        <h1 className="text-2xl font-semibold mb-3 text-center monse">Panel de Administración</h1>
        <h2 className="text-xl font-bold mb-4 text-center">Cupones Generados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 p-1 rounded-lg place-items-center">
          {cupones.map((cupon) => (
            <div key={cupon.id} 
              className="cupon bg-[#c0c8cf] rounded-lg shadow p-4 text-center mb-7 w-72 h-103 flex flex-col items-center justify-center">
              <h3 className="monse text-lg font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h3>
              <img src={cupon.imagenURL} alt={cupon.titulo} width="100" className="w-auto h-35 mb-3 mx-auto block" />
              <p className="mb-2 text-gray-700">{cupon.descripcion}</p>
              <div className="text-justify px-4 mb-2">
                  <h3><strong>Cantidad Disponible:</strong> {cupon.cantidadDisp}</h3>
                  <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
                  <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
              </div>
              <span className="text-white font-semibold ml-2 px-2 py-1 rounded-lg bg-[#ff7837]">{cupon.estado}</span>
            </div>
          ))}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-sm shadow-lg w-110">
            <h2 className="text-2xl font-bold mb-1 text-center monse">Crear Cupón</h2>

            <div className="max-h-screen overflow-y-auto p-2">
              <form onSubmit={formik.handleSubmit} className="bg-white rounded-sm space-y-2 max-w-sm mx-auto">
                {[  
                  { name: "titulo", type: "text", placeholder: "Título" },
                  { name: "descripcion", type: "text", placeholder: "Descripción" },
                  { name: "detalles", type: "textarea", placeholder: "Detalles" },
                  { name: "cantidadDisp", type: "number", placeholder: "Cantidad Disponible" },
                  { name: "fechaInicio", type: "datetime-local" },
                  { name: "fechaFin", type: "datetime-local", placeholder: "Fecha Fin de Cupon"},
                  { name: "fechaLimiteUsar", type: "datetime-local", placeholder: "Fecha Limite de Usar" },
                  { name: "imagenURL", type: "text", placeholder: "URL de Imagen" },
                  { name: "precioOferta", type: "number", placeholder: "Precio Oferta" },
                  { name: "precioRegular", type: "number", placeholder: "Precio Regular" },
                ].map(({ name, type, placeholder }) => (
                  <div key={name} className="flex flex-col">
                    {type === "textarea" ? (
                      <textarea
                        name={name}
                        placeholder={placeholder}
                        value={formik.values[name]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full p-1 pl-2 border border-gray-300 rounded-lg"
                      />
                    ) : (
                      <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={formik.values[name]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full p-1 border border-gray-300 rounded-lg"
                      />
                    )}
                    {formik.touched[name] && formik.errors[name] && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors[name]}</p>
                    )}
                  </div>
                ))}

                {/* Select de Rubro */}
                <div className="flex flex-col">
                  <select
                    name="rubro"
                    value={formik.values.rubro}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border border-gray-300 p-1 rounded-md"
                  >
                    <option value="">Selecciona un rubro</option>
                    <option value="diversión">Diversión</option>
                    <option value="tecnología">Tecnología</option>
                    <option value="comida">Comida</option>
                    <option value="belleza">Belleza</option>
                  </select>
                  {formik.touched.rubro && formik.errors.rubro && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.rubro}</p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex space-x-2 mt-3">
                <button 
                    type="button" 
                    onClick={() => setModalOpen(false)} 
                    className="w-full text-white bg-[#ff2323] py-2 rounded-lg hover:bg-[#ff5757] transition hover:scale-103 font-bold"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="w-full text-white bg-[#3c7499] py-2 rounded-lg hover:bg-[#6da3c3] transition hover:scale-103 font-bold">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmpresaDashboard;
