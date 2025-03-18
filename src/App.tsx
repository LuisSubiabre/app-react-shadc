import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute"; // Asegúrate de que ProtectedRoute está correctamente importado
import Spinner from "./components/Spinner";
import ErrorBoundary from "@/components/ErrorBoundary"; // Importa el ErrorBoundary
import AcademicoEditarCurso from "./app/dashboard/academico/inicio/pageEditarCurso";
import AcademicoCursosAsignaturas from "./app/dashboard/academico/inicio/pageAsignaturas";
import PageCalificaciones from "./app/dashboard/academico/calificaciones/pageCalificaciones";
import PageAtrasos from "./app/dashboard/inspectoria/atrasos/pageAtrasos";
import PageControlAtrasos from "./app/dashboard/inspectoria/atrasos/pageControlAtrasos";

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
const PasswordResetRequest = lazy(() => import("@/app/password-reset/request"));
const PasswordReset = lazy(() => import("@/app/password-reset/reset"));

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <ErrorBoundary>
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
              <Route
                path="/recuperar-contrasena"
                element={<PasswordResetRequest />}
              />
              <Route
                path="/reset-password/:token"
                element={<PasswordReset />}
              />

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
                path="/dashboard/academico/cursos"
                element={
                  <ProtectedRoute requiredRoles={[2]}>
                    <Layout>
                      <AcademicoEditarCurso />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/academico/asignaturas"
                element={
                  <ProtectedRoute requiredRoles={[2]}>
                    <Layout>
                      <AcademicoCursosAsignaturas />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/academico/notas"
                element={
                  <ProtectedRoute requiredRoles={[2]}>
                    <Layout>
                      <PageCalificaciones />
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
                      <PageAtrasos />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/inspectoria/controlatrasos"
                element={
                  <ProtectedRoute requiredRoles={[3]}>
                    <Layout>
                      <PageControlAtrasos />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/acles/talleres"
                element={
                  <ProtectedRoute requiredRoles={[4]}>
                    <Layout>
                      <AcleTalleres />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/acles/talleres/inscritos/:id"
                element={
                  <ProtectedRoute requiredRoles={[4]}>
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
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
