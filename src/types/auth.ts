export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    roles: number[];
    cursos: number[];
  };
}

export interface ServerResponse {
  message: string;
  success: boolean;
}
