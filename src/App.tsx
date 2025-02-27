import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute"; // Asegúrate de que ProtectedRoute está correctamente importado
import Spinner from "./components/Spinner";

const Login = lazy(() => import("@/app/login/page"));
const Logout = lazy(() => import("@/app/logout/pageLogout"));
const UnauthorizedComponent = lazy(
  () => import("@/components/unauthorizedComponent")
);
const Layout = lazy(() => import("@/app/dashboard/layout"));
const Dashboard = lazy(() => import("@/app/dashboard/page"));
const Usuarios = lazy(
  () => import("@/app/dashboard/toor/usuarios/pageUsuarios")
);
const Roles = lazy(() => import("@/app/dashboard/toor/roles/pageRoles"));
const Cursos = lazy(() => import("@/app/dashboard/toor/cursos/pageCursos"));
const Estudiantes = lazy(
  () => import("@/app/dashboard/toor/estudiantes/pageEstudiantes")
);
const Asignaturas = lazy(
  () => import("@/app/dashboard/toor/asignaturas/pageAsignaturas")
);
const AcademicoInicio = lazy(
  () => import("@/app/dashboard/academico/inicio/pageInicio")
);
const Calificaciones = lazy(
  () => import("@/app/dashboard/academico/calificaciones/pageCalificaciones")
);
const InspectoriaAsistencia = lazy(
  () => import("@/app/dashboard/inspectoria/asistencia/pageAsistencia")
);
const AcleTalleres = lazy(
  () => import("@/app/dashboard/acles/talleres/pageTalleres")
);
const AclesInscritos = lazy(
  () => import("@/app/dashboard/acles/talleres/pageInscritos")
);
const Jefatura = lazy(() => import("@/app/dashboard/jefatura/pageJefatura"));

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Suspense
          fallback={
            <>
              <div className="flex justify-center items-center h-full w-2/5 mx-auto">
                <Spinner />
              </div>
              <div className="flex justify-center items-center h-full w-2/5 mx-auto">
                Un momento por favor...
              </div>
            </>
          }
        >
          <Routes>
            {/* Public Routes */}

            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/unauthorized" element={<UnauthorizedComponent />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
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

            <Route
              path="/dashboard/academico/inicio"
              element={
                <ProtectedRoute requiredRoles={[2]}>
                  <Layout>
                    <AcademicoInicio />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/academico/calificaciones/:id"
              element={
                <ProtectedRoute requiredRoles={[2]}>
                  <Layout>
                    <Calificaciones />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/inspectoria/asistencia"
              element={
                <ProtectedRoute requiredRoles={[3]}>
                  <Layout>
                    <InspectoriaAsistencia />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/inspectoria/atrasos"
              element={
                <ProtectedRoute requiredRoles={[3]}>
                  <Layout>
                    <h1>Inspectoria Atrasos</h1>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/acles/talleres"
              element={
                <ProtectedRoute requiredRoles={[1]}>
                  <Layout>
                    <AcleTalleres />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/acles/talleres/inscritos/:id"
              element={
                <ProtectedRoute requiredRoles={[1]}>
                  <Layout>
                    <AclesInscritos />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/jefatura"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Jefatura />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect to login if not authenticated */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
