import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; 

function LandingPage() {
  const [cupones, setCupones] = useState([]);

  useEffect(() => {
    const fetchCupones = async () => {
      const querySnapshot = await getDocs(collection(db, "cupones"));
      const cuponesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCupones(cuponesData);
    };

    fetchCupones();
  }, []);

  return (
    <div className="landing bg-[#f5f5f5]">
      <header className="w-full bg-[#012E40] fixed py-4 px-20 flex items-center justify-between ">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <Link to="/login">
          <button className="text-white bg-[#3C7499] rounded-lg font-bold px-4 py-2 hover:bg-[#6da3c3] transition">Iniciar Sesión</button>
        </Link>
      </header>

      <section className="pt-22 px-28">
        <h2 className="text-2xl text-center monse font-semibold mb-3">Ofertas destacadas</h2>
        
        <div className="cupones grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10 rounded-lg place-items-center">
          {cupones.map((cupon) => (
            <div 
              key={cupon.id} 
              className={`cupon bg-[#d9d9d9] rounded-lg shadow p-4 text-center max-w-xs mx-auto 
                ${cupones.length === 1 ? "col-span-1" : ""}
                ${cupones.length === 2 ? "md:col-span-2" : ""}
                ${cupones.length > 3 && (index % 3 === 0) ? "lg:col-span-3 justify-self-center" : ""}
              `}
              >
              <h3 className="text-xl font-extrabold text-[#1d3557] mb-2 uppercase">{cupon.titulo}</h3>
              <p className="mb-4">{cupon.descripcion}</p>
              <Link to={`/cupon/${cupon.id}`}>
                <button className="bg-[#3C7499] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6da3c3] transition">Comprar Cupón</button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;