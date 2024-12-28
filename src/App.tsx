import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "@/app/login/page";
import Dashboard from "@/app/dashboard/page";
import Usuarios from "@/app/dashboard/toor/usuarios/page";
import Layout from "@/app/dashboard/layout";
import Estudiantes from "@/app/dashboard/toor/estudiantes/page";
import { AuthProvider } from "@/context/AuthProvider";
import Roles from "@/app/dashboard/toor/roles/page";
import ProtectedRoute from "@/components/ProtectedRoute"; // Asegúrate de que ProtectedRoute está correctamente importado

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<Login />} />

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
            <ProtectedRoute>
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
          path="/dashboard/toor/estudiantes"
          element={
            <ProtectedRoute>
              <Layout>
                <Estudiantes />
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
