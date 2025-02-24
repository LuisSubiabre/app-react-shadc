const UnauthorizedComponent = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <LockIcon className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Acceso no autorizado
        </h1>
        <p className="mt-4 text-muted-foreground">
          No tienes los permisos necesarios para acceder a este recurso. Por
          favor, contacta a tu administrador para obtener ayuda.
        </p>

        <div className="mt-6">
          <a href="/dashboard" className="text-primary hover:underline">
            Regresar al incio
          </a>
        </div>
      </div>
    </div>
  );
};
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
export default UnauthorizedComponent;
