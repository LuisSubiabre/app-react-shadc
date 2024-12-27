import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "@/app/login/page";
import Dashboard from "@/app/dashboard/page";
import Usuarios from "@/app/dashboard/toor/usuarios/page";
import Layout from "@/app/dashboard/layout";
import Estudiantes from "./app/dashboard/toor/estudiantes/page";
import { AuthContext } from "./context/AuthContext";
import Roles from "./app/dashboard/toor/roles/page";

function App() {
  const { auth, loading } = useContext(AuthContext) || {
    auth: false,
    loading: true,
  };

  if (loading) {
    // Mostrar un indicador de carga mientras se verifica la autenticación
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<div>Home</div>} />
      <Route
        path="/hola"
        element={!auth ? <div>Not Login</div> : <div>With Login</div>}
      />
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      {auth ? (
        <>
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/dashboard/toor/usuarios"
            element={
              <Layout>
                <Usuarios />
              </Layout>
            }
          />
          <Route
            path="/dashboard/toor/roles"
            element={
              <Layout>
                <Roles />
              </Layout>
            }
          />
          <Route
            path="/dashboard/toor/estudiantes"
            element={
              <Layout>
                <Estudiantes />
              </Layout>
            }
          />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}

export default App;
