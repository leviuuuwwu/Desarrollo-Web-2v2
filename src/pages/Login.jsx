import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserSessionPersistence, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      await setPersistence(auth, browserSessionPersistence).catch(() => {});
      
      const currentUser = auth.currentUser;
      if (currentUser) {
        await signOut(auth); //Cierra sesión si hay una sesión activa
      }

      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
          }
        } else {
          setUser(null);
        }
      });

      return () => unsubscribe();
    };

    checkUser();
  }, []);

  // Redirección automática si el usuario ya está autenticado
  if (user) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/Administrador" replace />;
      case "empresa":
        return <Navigate to="/Empresa" replace />;
      case "trabajador":
        return <Navigate to="/Trabajador" replace />;
      default:
        return <Navigate to="/Cliente" replace />;
    }
  }

  const registerUser = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        fullName,
        phone,
        role: "cliente",
      });

      navigate("/cliente");
    } catch (error) {
      alert("Error al registrarse. Intenta de nuevo.");
    }
  };

  const signInUser = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        switch (userData.role) {
          case "admin":
            navigate("/Administrador");
            break;
          case "empresa":
            navigate("/Empresa");
            break;
          case "trabajador":
            navigate("/Trabajador");
            break;
          default:
            navigate("/Cliente");
        }
      } else {
        alert("No se encontraron datos de usuario.");
      }
    } catch (error) {
      alert("Correo o contraseña incorrectos. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <img src="/Logo.png" alt="logo" className="w-28 pb-5 mx-auto block" />
          <h1 className="text-2xl font-bold text-center mb-4">
            {isRegistering ? "Regístrate" : "Iniciar Sesión"}
          </h1>
          <form onSubmit={isRegistering ? registerUser : signInUser} className="space-y-4">
            {isRegistering && (
              <>
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </>
            )}

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            {isRegistering && (
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            )}
            <button 
              type="submit" 
              className="w-full bg-[#3C7499] text-white p-2 rounded-lg hover:bg-[#6da3c3] transition font-bold hover:scale-103"
            >
              {isRegistering ? "Registrarse" : "Iniciar Sesión"}
            </button>
          </form>

          <p className="text-center mt-4">
            {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
            <span 
              onClick={() => setIsRegistering(!isRegistering)} 
              className="text-[#1d3557] font-bold cursor-pointer hover:underline"
            >
              {isRegistering ? "Inicia sesión" : "Regístrate"}
            </span>
          </p>
        </div>
      </div>
      <footer className="w-full bg-[#012E40] py-4 px-20 text-center">
      <h3 className="text-center text-white">¿Eres una empresa? <span className="font-bold hover:underline">Regístrate</span></h3>
      </footer>
    </div>
  );
}

export default Login;