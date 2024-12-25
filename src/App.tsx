import { Routes, Route } from "react-router-dom";
import Login from "@/app/login/page";
import Dashboard from "@/app/dashboard/page";
import Usuarios from "@/app/dashboard/toor/usuarios/page";
import Layout from "@/app/dashboard/layout"; // Asegúrate de que el archivo layout esté importado correctamente
import Estudiantes from "./app/dashboard/toor/estudiantes/page";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<div>Home</div>} />

        {/* Rutas dentro de dashboard envueltas con el layout */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              {" "}
              <Dashboard />{" "}
            </Layout>
          }
        />
        <Route
          path="/dashboard/toor/usuarios"
          element={
            <Layout>
              {" "}
              <Usuarios />{" "}
            </Layout>
          }
        />
        <Route
          path="/dashboard/toor/estudiantes"
          element={
            <Layout>
              {" "}
              <Estudiantes />{" "}
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
