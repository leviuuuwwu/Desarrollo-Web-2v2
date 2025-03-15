import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/config";

function LandingPage() {
  const [cupones, setCupones] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCupones = async () => {
      const querySnapshot = await getDocs(collection(db, "cupones"));
      const cuponesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCupones(cuponesData);
    };

    fetchCupones();
  }, []);

  const handleCompraClick = (cuponId) => {
    if (!auth.currentUser) {
      navigate("/login"); 
    } else {
      navigate(`/cupon/${cuponId}`); 
    }
  };

  return (
    <div className="landing bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60" />
        <button
          onClick={() => navigate("/login")}
          className="text-white bg-[#3C7499] rounded-lg font-bold px-4 py-2 hover:bg-[#6da3c3] transition hover:scale-103"
        >
          Iniciar Sesión
        </button>
      </header>

      <section className="pt-24 px-28">
        <h2 className="text-2xl text-center monse font-semibold mb-3">Ofertas destacadas</h2>

        <div className="cupones grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 rounded-lg place-items-center">
          {cupones.map((cupon) => (
            <div 
              key={cupon.id} 
              className="cupon bg-[#d9d9d9] rounded-lg shadow p-4 text-center max-w-xs mx-auto mb-7">
              <h3 className="text-xl font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h3>
              <img 
                src={cupon.imagenURL} 
                alt={cupon.titulo} 
                className="w-40 mb-3 mx-auto block"
              />
              <p className="mb-2 text-gray-700">{cupon.descripcion}</p>
              <div className="text-justify px-4">
                <p><strong>Precio Regular:</strong> ${cupon.precioRegular}</p>
                <p><strong>Precio Oferta:</strong> ${cupon.precioOferta}</p>
              </div>
              <button 
                onClick={() => handleCompraClick(cupon.id)} 
                className="bg-[#3C7499] text-white px-4 py-2 mt-3 rounded-lg font-semibold hover:bg-[#6da3c3] transition hover:scale-103"
              >
                Comprar Cupón
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;