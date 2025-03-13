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
    <div className="landing">
      <header className="bg-[#012E40] py-4 px-20 flex items-center justify-between">
        <img src="/CM.png" alt="logo" className="w-60"/>
        <Link to="/login">
          <button className="text-white bg-[#3C7499] rounded font-bold px-4 py-2 hover:bg-[#6da3c3]">Iniciar Sesión</button>
        </Link>
      </header>

      <section >
        <h2>Ofertas destacadas</h2>
        <div className="cupones">
          {cupones.map((cupon) => (
            <div key={cupon.id} className="cupon">
              <h3>{cupon.titulo}</h3>
              <p>{cupon.descripcion}</p>
              <Link to={`/cupon/${cupon.id}`}>
                <button>Comprar Cupón</button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;