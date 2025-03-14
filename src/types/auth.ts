export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    roles: number[];
    cursos: any[];
  };
}

export interface ServerResponse {
  message: string;
  success: boolean;
}
