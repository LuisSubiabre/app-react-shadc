import { useContext } from "react";

import { Routes, Route } from "react-router-dom";
import Login from "@/app/login/page";
import Dashboard from "@/app/dashboard/page";
import Usuarios from "@/app/dashboard/toor/usuarios/page";
import Layout from "@/app/dashboard/layout";
import Estudiantes from "./app/dashboard/toor/estudiantes/page";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { auth } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/login" element={<Login />} />
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
        path="/dashboard/toor/estudiantes"
        element={
          <Layout>
            <Estudiantes />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
