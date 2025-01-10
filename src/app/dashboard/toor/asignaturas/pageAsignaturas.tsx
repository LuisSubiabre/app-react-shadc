import React, { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Asignatura } from "./types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { saveNew, saveEdit, deleteAsignatura } from "./asignaturaService";

const Asignaturas: React.FC = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newAsignatura, setNewAsignatura] = useState<Partial<Asignatura>>({
    nombre: "",
    descripcion: "",
    indice: 0,
    concepto: false,
    codigo_sige: 0,
    nivel_educativo: 0,
    es_comun: false,
  });
  const [currentAsignatura, setCurrentAsignatura] = useState<Asignatura | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [asignaturaToDelete, setAsignaturaToDelete] =
    useState<Asignatura | null>(null);

  const getTokenFromContext = useAuth();
  if (!getTokenFromContext || !getTokenFromContext.authToken) {
    throw new Error("authToken is null");
  }
  const token = getTokenFromContext.authToken;

  const { data, loading, error, refetch } = useFetch<Asignatura[]>(
    "asignaturas",
    token
  );

  if (loading) return <div className="spinner">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  const handleSaveNew = async () => {
    setSaving(true);
    setErrorMessage(null);

    if (!newAsignatura.nombre) {
      setErrorMessage("El nombre es obligatorio");
      setSaving(false);
      return;
    }

    try {
      await saveNew(newAsignatura, token);
      refetch();
      handleCloseNewModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddClick = () => {
    setIsNewModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    form: "new" | "edit"
  ) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;

    if (form === "new") {
      setNewAsignatura({
        ...newAsignatura,
        [name]: parsedValue,
      });
    } else {
      setCurrentAsignatura((curr) =>
        curr
          ? {
              ...curr,
              [name]: parsedValue,
            }
          : null
      );
    }
  };

  const handleCheckboxChange = (
    name: string,
    checked: boolean,
    form: "new" | "edit"
  ) => {
    if (form === "new") {
      setNewAsignatura({
        ...newAsignatura,
        [name]: checked,
      });
    } else {
      setCurrentAsignatura((curr) =>
        curr
          ? {
              ...curr,
              [name]: checked,
            }
          : null
      );
    }
  };

  const handleCloseNewModal = () => {
    setIsNewModalOpen(false);
    setNewAsignatura({
      nombre: "",
      descripcion: "",
      indice: 0,
      concepto: false,
      codigo_sige: 0,
      nivel_educativo: 0,
      es_comun: false,
    });
    setErrorMessage(null);
  };

  const handleEditClick = (asignatura: Asignatura) => {
    setCurrentAsignatura(asignatura);
    setIsModalEditOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalEditOpen(false);
    setCurrentAsignatura(null);
    setErrorMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!currentAsignatura) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      await saveEdit(token, currentAsignatura);
      refetch();
      handleCloseEditModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (asignatura: Asignatura) => {
    setAsignaturaToDelete(asignatura);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!asignaturaToDelete) return;

    try {
      await deleteAsignatura(token, asignaturaToDelete);
      refetch();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al eliminar la asignatura"
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setAsignaturaToDelete(null);
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-bold">Asignaturas</h1>
        <div>
          <Button onClick={handleAddClick}>Agregar Asignatura</Button>
        </div>

        <Table>
          <TableCaption>Lista de asignaturas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>

              <TableHead>Código SIGE</TableHead>
              <TableHead>Nivel Educativo</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Es Común</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((asignatura) => (
              <TableRow key={asignatura.asignatura_id}>
                <TableCell>
                  <strong>{asignatura.nombre}</strong>
                  <br />
                  <small>{asignatura.descripcion}</small>
                </TableCell>

                <TableCell>{asignatura.codigo_sige}</TableCell>
                <TableCell>
                  {asignatura.nivel_educativo === 1
                    ? "Básica"
                    : asignatura.nivel_educativo === 2
                    ? "Media"
                    : asignatura.nivel_educativo}
                </TableCell>
                <TableCell>{asignatura.concepto ? "Sí" : "No"}</TableCell>
                <TableCell>{asignatura.es_comun ? "Sí" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(asignatura)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(asignatura)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal para nueva asignatura */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Asignatura</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={newAsignatura.nombre}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                name="descripcion"
                value={newAsignatura.descripcion}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="indice">Índice</Label>
              <Input
                type="number"
                id="indice"
                name="indice"
                value={newAsignatura.indice}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codigo_sige">Código SIGE</Label>
              <Input
                type="number"
                id="codigo_sige"
                name="codigo_sige"
                value={newAsignatura.codigo_sige}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nivel_educativo">Nivel Educativo</Label>
              <Input
                type="number"
                id="nivel_educativo"
                name="nivel_educativo"
                value={newAsignatura.nivel_educativo}
                onChange={(e) => handleInputChange(e, "new")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="concepto"
                name="concepto"
                checked={newAsignatura.concepto}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("concepto", checked as boolean, "new")
                }
              />
              <Label htmlFor="concepto">Concepto</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="es_comun"
                name="es_comun"
                checked={newAsignatura.es_comun}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("es_comun", checked as boolean, "new")
                }
              />
              <Label htmlFor="es_comun">Es Común</Label>
            </div>
          </div>
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseNewModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNew} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar asignatura */}
      <Dialog open={isModalEditOpen} onOpenChange={setIsModalEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Asignatura</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                name="nombre"
                value={currentAsignatura?.nombre}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Input
                id="edit-descripcion"
                name="descripcion"
                value={currentAsignatura?.descripcion}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-indice">Índice</Label>
              <Input
                type="number"
                id="edit-indice"
                name="indice"
                value={currentAsignatura?.indice}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-codigo_sige">Código SIGE</Label>
              <Input
                type="number"
                id="edit-codigo_sige"
                name="codigo_sige"
                value={currentAsignatura?.codigo_sige}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-nivel_educativo">Nivel Educativo</Label>
              <Input
                type="number"
                id="edit-nivel_educativo"
                name="nivel_educativo"
                value={currentAsignatura?.nivel_educativo}
                onChange={(e) => handleInputChange(e, "edit")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-concepto"
                name="concepto"
                checked={currentAsignatura?.concepto}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("concepto", checked as boolean, "edit")
                }
              />
              <Label htmlFor="edit-concepto">Concepto</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-es_comun"
                name="es_comun"
                checked={currentAsignatura?.es_comun}
                onCheckedChange={(checked) =>
                  handleCheckboxChange("es_comun", checked as boolean, "edit")
                }
              />
              <Label htmlFor="edit-es_comun">Es Común</Label>
            </div>
          </div>
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              asignatura {asignaturaToDelete?.nombre}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Asignaturas;
