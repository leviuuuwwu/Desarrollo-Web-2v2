import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserSessionPersistence, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    signOut(auth);
    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.error("Error al configurar persistencia:", error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Usuario detectado:", user.uid);

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Datos obtenidos de Firestore:", userData);

          if (!userData.role) {
            console.warn("El usuario no tiene un rol definido en Firestore.");
            return;
          }

          setUser(userData);

          // Redirigir si el usuario está autenticado
          if (userData.role === "admin") {
            console.log("Redirigiendo a /admin");
            navigate("/admin");
          } else if (userData.role === "empresa") {
            console.log("Redirigiendo a /empresa");
            navigate("/empresa");
          } else {
            console.log("Redirigiendo a /cliente");
            navigate("/cliente");
          }
        } else {
          console.warn("El documento de usuario no existe en Firestore.");
        }
      } else {
        console.log("No hay usuario autenticado.");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "cliente",
      });

      console.log("Usuario registrado correctamente:", user);
      navigate("/cliente"); // Redirigir después de registrarse
    } catch (error) {
      console.error("Error al registrar usuario:", error);
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
        console.log("Inicio de sesión exitoso, datos del usuario:", userData);

        // Redirigir según el rol
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.role === "empresa") {
          navigate("/empresa");
        } else {
          navigate("/cliente");
        }
      } else {
        console.warn("No se encontró información del usuario en Firestore.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{isRegistering ? "Regístrate" : "Inicia Sesión"}</h1>
      <form onSubmit={isRegistering ? registerUser : signInUser} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ margin: "10px", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ margin: "10px", padding: "8px" }}
        />
        <button type="submit" style={{ margin: "10px", padding: "10px", cursor: "pointer" }}>
          {isRegistering ? "Registrarse" : "Iniciar Sesión"}
        </button>
      </form>
      <p>
        {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
        <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: "blue", cursor: "pointer" }}>
          {isRegistering ? "Inicia sesión" : "Regístrate"}
        </span>
      </p>
    </div>
  );
}

export default Login;
