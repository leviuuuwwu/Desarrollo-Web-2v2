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
      <header>
        <h1>Bienvenido a CuponeraX</h1>
        <p>Compra cupones con grandes descuentos en restaurantes, tiendas y más.</p>
        <Link to="/login">
          <button>Iniciar Sesión</button>
        </Link>
      </header>

      <section>
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
}

export default LandingPage;