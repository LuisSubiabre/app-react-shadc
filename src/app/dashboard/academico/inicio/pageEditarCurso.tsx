import React, { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

/* refactory */
import { useCursosFuncionarios } from "@/hooks/useCursosFuncionario.ts"; // Asegúrate de importar el hook que creaste
/* refactory */

import { AlertCircle, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
//import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { Curso } from "./types"; // Importa la interfaz desde el archivo types.ts
import { User } from "@/app/dashboard/toor/usuarios/types"; // Importa la interfaz desde el archivo types.ts

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth"; // Importamos correctamente desde hooks
import { useFetch } from "@/hooks/useFetch"; // Importamos correctamente desde hooks
import { savaEdit } from "./cursoService";
import Spinner from "@/components/Spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@radix-ui/react-separator";
import { CursoApiResponseType } from "@/types";

const AcademicoCalificacionesCurso: React.FC = () => {
  /* refactory */
  const funcionarioId = 84; // O cualquier ID de funcionario que quieras pasar
  const {
    error,
    loading,
    funcionarioCursos,
    setFuncionarioCursos, // Desestructura setFuncionarioCursos
  } = useCursosFuncionarios(funcionarioId);

  useEffect(() => {
    // Aquí puedes hacer algo cuando el `funcionarioCursos` cambie o cuando se haya cargado
    if (funcionarioCursos) {
      console.log("Cursos del funcionario cargados:", funcionarioCursos);
    }
  }, []);

  /* refactory */

  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentCurso, setCurrentCurso] = useState<Curso | null>(null);

  /* token para enviar al backend */
  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;
  //const { toast } = useToast();

  const { data: dataUsuarios } = useFetch<User[]>("usuarios", token); // Trae los datos de la API (usuarios)

  if (loading)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Spinner />
      </div>
    ); // Spinner de carga

  if (error)
    return (
      <div className="flex justify-center items-center h-full w-2/5 mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    ); // Mensaje de error al cargar los datos de la API

  /* Logica Editar */

  const handleSaveEdit = async () => {
    if (!currentCurso) return;

    setSaving(true);
    setErrorMessage(null);

    try {
      await savaEdit(token, {
        ...currentCurso,
        nombre: currentCurso.nombre,
        descripcion: currentCurso.descripcion,
        indice: currentCurso.indice,
        codigo_ensenanza: currentCurso.codigo_ensenanza,
        profesor_jefe_id: currentCurso.profesor_jefe_id,
        id: currentCurso.id.toString(),
      });

      // Actualizar el estado funcionarioCursos con el curso editado
      setFuncionarioCursos((prevCursos) =>
        prevCursos.map((curso) =>
          curso.id === currentCurso.id
            ? {
                ...curso,
                nombre: currentCurso.nombre,
                jefatura:
                  dataUsuarios?.find(
                    (user) => user.id === currentCurso.profesor_jefe_id
                  )?.nombre || curso.jefatura,
              }
            : curso
        )
      );

      setIsModalEditOpen(false); // Cerrar el modal después de guardar
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (curso: Curso) => {
    setCurrentCurso(curso);
    setIsModalEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setCurrentCurso(null);
    setErrorMessage(null);
    setIsModalEditOpen(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCurso) {
      setCurrentCurso({
        ...currentCurso,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <Toaster />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Cursos</h1>
        <Separator orientation="horizontal" className="w-full" />
        <Separator orientation="horizontal" className="w-full" />
        <Table>
          <TableCaption>Lista de cursos</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Nombre</TableHead>
              <TableHead className="w-[50px]">Jefatura</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarioCursos.length > 0 ? (
              funcionarioCursos.map((c: CursoApiResponseType) => (
                <TableRow key={c.id}>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>{c.jefatura}</TableCell>
                  <TableCell>
                    <Button className="mr-2" onClick={() => handleEditClick(c)}>
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No hay cursos disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Editar */}
      <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          {currentCurso && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  disabled
                  id="nombre"
                  name="nombre"
                  value={currentCurso.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  value={currentCurso.descripcion}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Jefatura</Label>
                <Select
                  value={JSON.stringify({
                    id: currentCurso.profesor_jefe_id,
                    nombre:
                      dataUsuarios?.find(
                        (user) => user.id === currentCurso.profesor_jefe_id
                      )?.nombre || "",
                  })}
                  onValueChange={(value) => {
                    const selected = JSON.parse(value);
                    setCurrentCurso({
                      ...currentCurso,
                      profesor_jefe_id: selected.id,
                    });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona Jefatura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Funcionarios</SelectLabel>
                      {dataUsuarios?.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={JSON.stringify({
                            id: user.id,
                            nombre: user.nombre,
                          })}
                        >
                          {user.nombre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Label htmlFor="indice">Índice</Label>
                <Input
                  id="indice"
                  name="indice"
                  type="number"
                  value={currentCurso.indice}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="codigo_ensenanza">Código Enseñanza</Label>
                <Input
                  id="codigo_ensenanza"
                  name="codigo_ensenanza"
                  type="number"
                  value={currentCurso.codigo_ensenanza}
                  onChange={handleInputChange}
                />
              </div>

              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseEditModal}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicoCalificacionesCurso;
