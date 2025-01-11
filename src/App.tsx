import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "@/app/login/page";
import Dashboard from "@/app/dashboard/page";
import Usuarios from "@/app/dashboard/toor/usuarios/pageUsuarios";
import Layout from "@/app/dashboard/layout";
import Estudiantes from "@/app/dashboard/toor/estudiantes/pageEstudiantes";
import { AuthProvider } from "@/context/AuthProvider";
import Roles from "@/app/dashboard/toor/roles/pageRoles";
import ProtectedRoute from "@/components/ProtectedRoute"; // Asegúrate de que ProtectedRoute está correctamente importado
import Logout from "./app/logout/pageLogout";
import Cursos from "./app/dashboard/toor/cursos/pageCursos";
import Asignaturas from "./app/dashboard/toor/asignaturas/pageAsignaturas";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/unauthorized" element={<div>No autorizado</div>} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/toor/usuarios"
          element={
            <ProtectedRoute requiredRoles={[1]}>
              <Layout>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/toor/roles"
          element={
            <ProtectedRoute>
              <Layout>
                <Roles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/toor/cursos"
          element={
            <ProtectedRoute requiredRoles={[1]}>
              <Layout>
                <Cursos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/toor/estudiantes"
          element={
            <ProtectedRoute>
              <Layout>
                <Estudiantes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/toor/asignaturas"
          element={
            <ProtectedRoute requiredRoles={[1]}>
              <Layout>
                <Asignaturas />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
