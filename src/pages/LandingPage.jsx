import { Link } from "react-router-dom";

function LandingPage() {
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
          <div className="cupon">
            <h3>50% en Pizza Hut</h3>
            <p>Solo por tiempo limitado.</p>
            <button>Comprar Cupón</button>
          </div>
          <div className="cupon">
            <h3>2x1 en Starbucks</h3>
            <p>Válido hasta el 30 de abril.</p>
            <button>Comprar Cupón</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
