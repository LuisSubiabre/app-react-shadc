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
}

export const FiltrosTalleres: React.FC<FiltrosTalleresProps> = ({
  funcionarios,
  loadingFuncionario,
  errorFuncionario,
  onFuncionarioChange,
  newTaller,
  handleInputChange,
}) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="taller_nombre"
          name="taller_nombre"
          value={newTaller.taller_nombre}
          onChange={(e) => handleInputChange(e, "new")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="taller_descripcion"
          name="taller_descripcion"
          value={newTaller.taller_descripcion}
          onChange={(e) => handleInputChange(e, "new")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="indice">Horario</Label>
        <Input
          type="text"
          id="taller_horario"
          name="taller_horario"
          value={newTaller.taller_horario}
          onChange={(e) => handleInputChange(e, "new")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="nivel">Nivel</Label>
        <Select
          name="nivel"
          defaultValue="pre-basica"
          value={newTaller.taller_nivel?.toString()}
          onValueChange={(value) =>
            handleInputChange(
              {
                target: {
                  name: "taller_nivel",
                  value,
                  type: "select-one",
                },
              } as React.ChangeEvent<HTMLInputElement>,
              "new"
            )
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pre-basica">Pre-Básica</SelectItem>
            <SelectItem value="basica">Básica</SelectItem>
            <SelectItem value="media">Media</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        {loadingFuncionario && <Spinner />}
        {errorFuncionario && (
          <div className="text-red-500 text-sm">{errorFuncionario}</div>
        )}
        <Label htmlFor="descripcion">Monitor:</Label>
        <Select onValueChange={onFuncionarioChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccione Monitor" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Funcionarios</SelectLabel>
              {funcionarios?.map((user) => (
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
      <div className="grid gap-2">
        <Label htmlFor="cupos">Cantidad de cupos</Label>
        <Input
          type="number"
          id="taller_cantidad_cupos"
          name="taller_cantidad_cupos"
          value={newTaller.taller_cantidad_cupos}
          onChange={(e) => handleInputChange(e, "new")}
        />
      </div>
    </div>
  );
};
