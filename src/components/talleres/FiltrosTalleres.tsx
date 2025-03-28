import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/app/dashboard/toor/usuarios/types";
import Spinner from "@/components/Spinner";
import { TallerType } from "@/types/index.ts";

interface FiltrosTalleresProps {
  funcionarios: User[];
  loadingFuncionario: boolean;
  errorFuncionario: string | null;
  onFuncionarioChange: (value: string) => void;
  newTaller: Partial<TallerType>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    form: "new" | "edit"
  ) => void;
  isEditMode?: boolean;
}

export const FiltrosTalleres: React.FC<FiltrosTalleresProps> = ({
  funcionarios,
  loadingFuncionario,
  errorFuncionario,
  onFuncionarioChange,
  newTaller,
  handleInputChange,
  isEditMode = false,
}) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="taller_nombre"
          name="taller_nombre"
          value={newTaller.taller_nombre}
          onChange={(e) => handleInputChange(e, isEditMode ? "edit" : "new")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="taller_descripcion"
          name="taller_descripcion"
          value={newTaller.taller_descripcion}
          onChange={(e) => handleInputChange(e, isEditMode ? "edit" : "new")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="indice">Horario</Label>
        <Input
          type="text"
          id="taller_horario"
          name="taller_horario"
          value={newTaller.taller_horario}
          onChange={(e) => handleInputChange(e, isEditMode ? "edit" : "new")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ubicacion">Ubicación</Label>
        <Input
          type="text"
          id="taller_ubicacion"
          name="taller_ubicacion"
          value={newTaller.taller_ubicacion}
          onChange={(e) => handleInputChange(e, isEditMode ? "edit" : "new")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nivel">Nivel</Label>
        <Select
          value={newTaller.taller_nivel}
          onValueChange={(value) =>
            handleInputChange(
              {
                target: {
                  name: "taller_nivel",
                  value: value,
                },
              } as React.ChangeEvent<HTMLInputElement>,
              isEditMode ? "edit" : "new"
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Niveles</SelectLabel>
              <SelectItem value="pre-basica">Pre-básica</SelectItem>
              <SelectItem value="basica">Básica</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profesor">Profesor</Label>
        {loadingFuncionario ? (
          <Spinner />
        ) : errorFuncionario ? (
          <div className="text-red-500">{errorFuncionario}</div>
        ) : (
          <Select
            value={JSON.stringify({
              id: newTaller.taller_profesor_id,
              nombre: funcionarios.find(
                (f) => f.id === newTaller.taller_profesor_id
              )?.nombre,
            })}
            onValueChange={onFuncionarioChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un profesor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Profesores</SelectLabel>
                {funcionarios.map((funcionario) => (
                  <SelectItem
                    key={funcionario.id}
                    value={JSON.stringify({
                      id: funcionario.id,
                      nombre: funcionario.nombre,
                    })}
                  >
                    {funcionario.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cupos">Cantidad de cupos</Label>
        <Input
          type="number"
          id="taller_cantidad_cupos"
          name="taller_cantidad_cupos"
          value={newTaller.taller_cantidad_cupos}
          onChange={(e) => handleInputChange(e, isEditMode ? "edit" : "new")}
        />
      </div>
    </div>
  );
};
