import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getAsignaturasEncuestaFD, postAsignaturaEncuestaFD, updateAsignaturaEncuestaFD, deleteAsignaturaEncuestaFD, inscritosAnterioresEncuestaFD, getInscritosEncuestaFD, eliminarInscritoEncuestaFD, inscribirEstudianteEncuestaFD, visualizarEncuestaFD, CreateAsignaturaEncuestaFDType } from "@/services/encuestaFDService";
import { getAsignaturas } from "@/services/asignaturasService";
import { estudiantesCurso } from "@/services/estudiantesService";
import { getCursos } from "@/services/cursosService";
import { AsignaturaEncuestaFDType, AsignaturaType, InscritoAnteriorEncuestaFDType, InscritosEncuestaFDResponseType, EstudianteType, InscribirEstudianteEncuestaFDType, EleccionEncuestaFDType } from "@/types";
import { useToast } from "@/hooks/use-toast";
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
import { Toaster } from "@/components/ui/toaster";
import * as XLSX from "xlsx";

const PageFD = () => {
  // Estados para gestionar asignaturas y sus inscritos
  const [asignaturas, setAsignaturas] = useState<AsignaturaEncuestaFDType[]>([]);
  const [asignaturasExistentes, setAsignaturasExistentes] = useState<AsignaturaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState<AsignaturaEncuestaFDType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [asignaturaToDelete, setAsignaturaToDelete] = useState<AsignaturaEncuestaFDType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showInscritosModal, setShowInscritosModal] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState<AsignaturaEncuestaFDType | null>(null);
  const [inscritosAnteriores, setInscritosAnteriores] = useState<InscritoAnteriorEncuestaFDType[]>([]);
  const [loadingInscritos, setLoadingInscritos] = useState(false);
  const [inscritosPorAsignatura, setInscritosPorAsignatura] = useState<Record<number, InscritosEncuestaFDResponseType>>({});
  const [loadingInscritosPorAsignatura, setLoadingInscritosPorAsignatura] = useState<Record<number, boolean>>({});
  const [showInscritosActualesModal, setShowInscritosActualesModal] = useState(false);
  const [selectedAsignaturaInscritos, setSelectedAsignaturaInscritos] = useState<AsignaturaEncuestaFDType | null>(null);
  const [inscritoToDelete, setInscritoToDelete] = useState<{ eleccion_id: number; estudiante_nombre: string } | null>(null);
  const [isDeleteInscritoDialogOpen, setIsDeleteInscritoDialogOpen] = useState(false);
  const [deletingInscrito, setDeletingInscrito] = useState(false);
  const [showInscribirModal, setShowInscribirModal] = useState(false);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<EstudianteType | null>(null);
  const [elecciones, setElecciones] = useState<EleccionEncuestaFDType[]>([]);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [estudiantesPorCurso, setEstudiantesPorCurso] = useState<Record<number, EstudianteType[]>>({});
  const [cursos, setCursos] = useState<{ id: number; nombre: string }[]>([]);
  const [showSeleccionModal, setShowSeleccionModal] = useState(false);
  const [loadingSeleccion, setLoadingSeleccion] = useState(false);
  const [cursoSeleccionadoModal, setCursoSeleccionadoModal] = useState<number | null>(null);
  const [estudiantesPorCursoModal, setEstudiantesPorCursoModal] = useState<Record<number, EstudianteType[]>>({});
  const [cursosModal, setCursosModal] = useState<{ id: number; nombre: string }[]>([]);
  const [cambiandoEstado, setCambiandoEstado] = useState<Record<number, boolean>>({});
  const [estadosEstudiantes, setEstadosEstudiantes] = useState<Record<number, boolean>>({});
  const [formData, setFormData] = useState<CreateAsignaturaEncuestaFDType>({
    nombre: "",
    area: "",
    bloque: "Bloque 1",
    cupos_totales: 0,
    cupos_actuales: 0,
    estado: "visible",
    asignatura_id: null,
    horario: null,
    dia: null
  });

  const { toast } = useToast();

  // Función para cargar inscritos de una asignatura y actualizar automáticamente los cupos
  const fetchInscritosAsignatura = async (asignatura_encuesta_id: number) => {
    try {
      setLoadingInscritosPorAsignatura(prev => ({ ...prev, [asignatura_encuesta_id]: true }));
      const response = await getInscritosEncuestaFD(asignatura_encuesta_id);
      setInscritosPorAsignatura(prev => ({ ...prev, [asignatura_encuesta_id]: response }));
      
      // Los cupos se actualizan automáticamente en la base de datos
      // Solo actualizamos el estado local con los datos más recientes
      const asignatura = asignaturas.find(a => a.asignatura_encuesta_id === asignatura_encuesta_id);
      if (asignatura) {
        const inscritosActuales = response.estadisticas.total_inscritos;
        const cuposDisponibles = Math.max(0, asignatura.cupos_totales - inscritosActuales);
        
        // Actualizar el estado local de las asignaturas
        setAsignaturas(prev => prev.map(asignatura => 
          asignatura.asignatura_encuesta_id === asignatura_encuesta_id
            ? { ...asignatura, cupos_actuales: cuposDisponibles }
            : asignatura
        ));
        
        // Actualizar también el estado de selectedAsignaturaInscritos para que el botón se actualice inmediatamente
        setSelectedAsignaturaInscritos(prev => {
          if (prev && prev.asignatura_encuesta_id === asignatura_encuesta_id) {
            return { ...prev, cupos_actuales: cuposDisponibles };
          }
          return prev;
        });
      }
      
    } catch (err: unknown) {
      // Si es un error 404, significa que no hay inscritos para esta asignatura
      const axiosError = err as { response?: { status?: number } };
      if (axiosError?.response?.status === 404) {
        
        // Crear una respuesta vacía para asignaturas sin inscritos
        const emptyResponse = {
          asignatura_id: asignatura_encuesta_id,
          estadisticas: {
            total_inscritos: 0,
            por_prioridad: {
              prioridad_1: 0,
              prioridad_2: 0,
              prioridad_3: 0
            }
          },
          inscritos: []
        };
        
        setInscritosPorAsignatura(prev => ({ ...prev, [asignatura_encuesta_id]: emptyResponse }));
        
        // Actualizar cupos disponibles (todos los cupos están disponibles)
        const asignatura = asignaturas.find(a => a.asignatura_encuesta_id === asignatura_encuesta_id);
        if (asignatura) {
          setAsignaturas(prev => prev.map(asignatura => 
            asignatura.asignatura_encuesta_id === asignatura_encuesta_id
              ? { ...asignatura, cupos_actuales: asignatura.cupos_totales }
              : asignatura
          ));
          
          // Actualizar también el estado de selectedAsignaturaInscritos para que el botón se actualice inmediatamente
          setSelectedAsignaturaInscritos(prev => {
            if (prev && prev.asignatura_encuesta_id === asignatura_encuesta_id) {
              return { ...prev, cupos_actuales: asignatura.cupos_totales };
            }
            return prev;
          });
        }
      } else {
        console.error(`Error fetching inscritos for asignatura ${asignatura_encuesta_id}:`, err);
      }
    } finally {
      setLoadingInscritosPorAsignatura(prev => ({ ...prev, [asignatura_encuesta_id]: false }));
    }
  };

  const fetchAsignaturas = async () => {
    try {
      setLoading(true);
      const response = await getAsignaturasEncuestaFD();
      setAsignaturas(response.data);
      
      // Cargar inscritos para todas las asignaturas y sincronizar cupos
      for (const asignatura of response.data) {
        await fetchInscritosAsignatura(asignatura.asignatura_encuesta_id);
      }
    } catch (err) {
      setError("Error al cargar las asignaturas");
      console.error("Error fetching asignaturas:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAsignaturasExistentes = async () => {
    try {
      const response = await getAsignaturas();
      setAsignaturasExistentes(response.data || response);
    } catch (err) {
      console.error("Error fetching asignaturas existentes:", err);
    }
  };

  const fetchInscritosAnteriores = async (asignatura_encuesta_id: number) => {
    try {
      setLoadingInscritos(true);
      const response = await inscritosAnterioresEncuestaFD(asignatura_encuesta_id);
      setInscritosAnteriores(response);
    } catch (err) {
      console.error("Error fetching inscritos anteriores:", err);
      toast({
        title: "Error",
        description: "Error al cargar los inscritos anteriores",
        variant: "destructive",
      });
    } finally {
      setLoadingInscritos(false);
    }
  };

  const openInscritosModal = async (asignatura: AsignaturaEncuestaFDType) => {
    setSelectedAsignatura(asignatura);
    setShowInscritosModal(true);
    await fetchInscritosAnteriores(asignatura.asignatura_encuesta_id);
  };

  const openInscritosActualesModal = (asignatura: AsignaturaEncuestaFDType) => {
    // Asegurar que tenemos los datos más recientes de la asignatura
    const asignaturaActualizada = asignaturas.find(a => a.asignatura_encuesta_id === asignatura.asignatura_encuesta_id);
    setSelectedAsignaturaInscritos(asignaturaActualizada || asignatura);
    setShowInscritosActualesModal(true);
  };

  const handleDeleteInscritoClick = (eleccion_id: number, estudiante_nombre: string) => {
    setInscritoToDelete({ eleccion_id, estudiante_nombre });
    setIsDeleteInscritoDialogOpen(true);
  };

  const handleConfirmDeleteInscrito = async () => {
    if (!inscritoToDelete || !selectedAsignaturaInscritos) return;

    try {
      setDeletingInscrito(true);
      await eliminarInscritoEncuestaFD(inscritoToDelete.eleccion_id);
      
      // Actualizar el estado inmediatamente removiendo el inscrito eliminado
      setInscritosPorAsignatura(prev => {
        const currentData = prev[selectedAsignaturaInscritos.asignatura_encuesta_id];
        if (!currentData) return prev;
        
        const updatedInscritos = currentData.inscritos.filter(
          inscrito => inscrito.eleccion_id !== inscritoToDelete.eleccion_id
        );
        
        const updatedEstadisticas = {
          total_inscritos: updatedInscritos.length,
          por_prioridad: {
            prioridad_1: updatedInscritos.filter(i => i.asignatura.prioridad === 1).length,
            prioridad_2: updatedInscritos.filter(i => i.asignatura.prioridad === 2).length,
            prioridad_3: updatedInscritos.filter(i => i.asignatura.prioridad === 3).length,
          }
        };
        
        const updatedData = {
          ...currentData,
          inscritos: updatedInscritos,
          estadisticas: updatedEstadisticas
        };
        
        
        // Los cupos se actualizan automáticamente en la base de datos
        // Solo actualizamos el estado local
        const cuposDisponibles = Math.max(0, selectedAsignaturaInscritos.cupos_totales - updatedEstadisticas.total_inscritos);
        
        // Actualizar el estado local de las asignaturas
        setAsignaturas(prev => prev.map(asignatura => 
          asignatura.asignatura_encuesta_id === selectedAsignaturaInscritos.asignatura_encuesta_id
            ? { ...asignatura, cupos_actuales: cuposDisponibles }
            : asignatura
        ));
        
        // Actualizar también el estado de selectedAsignaturaInscritos para que el botón se actualice inmediatamente
        setSelectedAsignaturaInscritos(prev => prev ? { ...prev, cupos_actuales: cuposDisponibles } : null);
        
        return {
          ...prev,
          [selectedAsignaturaInscritos.asignatura_encuesta_id]: updatedData
        };
      });
      
      toast({
        title: "Éxito",
        description: "Estudiante eliminado de la asignatura correctamente",
      });
    } catch (err) {
      console.error("Error deleting inscrito:", err);
      toast({
        title: "Error",
        description: "Error al eliminar el estudiante de la asignatura",
        variant: "destructive",
      });
    } finally {
      setDeletingInscrito(false);
      setIsDeleteInscritoDialogOpen(false);
      setInscritoToDelete(null);
    }
  };

  const openInscribirModal = async () => {
    if (!selectedAsignaturaInscritos) return;
    
    setShowInscribirModal(true);
    setLoadingEstudiantes(true);
    setCursoSeleccionado(null);
    setEstudianteSeleccionado(null);
    
    try {
      // Cargar información de cursos
      const cursosResponse = await getCursos();
      if (cursosResponse && cursosResponse.data) {
        const cursosFiltrados = cursosResponse.data
          .filter((curso: { id: number; nombre: string }) => [25, 26, 27, 28, 29, 30].includes(curso.id))
          .map((curso: { id: number; nombre: string }) => ({ id: curso.id, nombre: curso.nombre }));
        setCursos(cursosFiltrados);
      }
      
      // Cargar estudiantes de los cursos 25, 26, 27, 28, 29, 30
      const cursosIds = [25, 26, 27, 28, 29, 30];
      const estudiantesPorCursoData: Record<number, EstudianteType[]> = {};
      
      for (const cursoId of cursosIds) {
        try {
          const response = await estudiantesCurso(cursoId);
          if (response && Array.isArray(response)) {
            estudiantesPorCursoData[cursoId] = response;
          }
        } catch (err) {
          console.error(`Error cargando estudiantes del curso ${cursoId}:`, err);
        }
      }
      
      setEstudiantesPorCurso(estudiantesPorCursoData);
      
      // Inicializar elección solo para la asignatura específica
      const eleccionInicial = {
        asignatura_encuesta_id: selectedAsignaturaInscritos.asignatura_encuesta_id,
        prioridad: selectedAsignaturaInscritos.area === 'A' ? 1 : selectedAsignaturaInscritos.area === 'B' ? 2 : 3
      };
      setElecciones([eleccionInicial]);
      
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      toast({
        title: "Error",
        description: "Error al cargar los estudiantes disponibles",
        variant: "destructive",
      });
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const handleEstudianteChange = (estudiante: EstudianteType | null) => {
    setEstudianteSeleccionado(estudiante);
  };

  const handleCursoChange = (cursoId: number | null) => {
    setCursoSeleccionado(cursoId);
    setEstudianteSeleccionado(null); // Resetear estudiante cuando cambia el curso
  };

  const openSeleccionModal = async () => {
    setShowSeleccionModal(true);
    setLoadingSeleccion(true);
    setCursoSeleccionadoModal(null);
    
    try {
      // Cargar información de cursos (solo cursos 25-30)
      const cursosResponse = await getCursos();
      if (cursosResponse && cursosResponse.data) {
        const cursosFiltrados = cursosResponse.data
          .filter((curso: { id: number; nombre: string }) => [25, 26, 27, 28, 29, 30].includes(curso.id))
          .map((curso: { id: number; nombre: string }) => ({ id: curso.id, nombre: curso.nombre }));
        setCursosModal(cursosFiltrados);
      }
      
      // Cargar estudiantes de los cursos 25, 26, 27, 28, 29, 30
      const cursosIds = [25, 26, 27, 28, 29, 30];
      const estudiantesPorCursoData: Record<number, EstudianteType[]> = {};
      
      for (const cursoId of cursosIds) {
        try {
          const response = await estudiantesCurso(cursoId);
          if (response && Array.isArray(response)) {
            estudiantesPorCursoData[cursoId] = response;
          }
        } catch (err) {
          console.error(`Error cargando estudiantes del curso ${cursoId}:`, err);
        }
      }
      
      setEstudiantesPorCursoModal(estudiantesPorCursoData);
      
      // Inicializar estados de estudiantes con los valores reales del backend
      const estadosIniciales: Record<number, boolean> = {};
      Object.values(estudiantesPorCursoData).forEach(estudiantes => {
        estudiantes.forEach(estudiante => {
          const id = estudiante.estudiante_id || estudiante.id;
          // Usar el valor real del campo acceso_encuesta_fd del backend
          estadosIniciales[id] = estudiante.acceso_encuesta_fd ?? true;
        });
      });
      setEstadosEstudiantes(estadosIniciales);
      
    } catch (err) {
      console.error("Error cargando datos para selección:", err);
      toast({
        title: "Error",
        description: "Error al cargar los cursos y estudiantes disponibles",
        variant: "destructive",
      });
    } finally {
      setLoadingSeleccion(false);
    }
  };

  const handleCursoChangeModal = (cursoId: number | null) => {
    setCursoSeleccionadoModal(cursoId);
  };

  const handleCambiarEstadoEstudiante = async (estudianteId: number, nuevoEstado: boolean) => {
    try {
      setCambiandoEstado(prev => ({ ...prev, [estudianteId]: true }));
      
      if (!estudianteId || estudianteId === undefined) {
        throw new Error('ID del estudiante es undefined o inválido');
      }
      
      await visualizarEncuestaFD(estudianteId, nuevoEstado);
      
      // Actualizar el estado local
      setEstadosEstudiantes(prev => ({ ...prev, [estudianteId]: nuevoEstado }));
      
      toast({
        title: "Éxito",
        description: `Estado del estudiante actualizado correctamente`,
      });
    } catch (err) {
      console.error("Error cambiando estado del estudiante:", err);
      toast({
        title: "Error",
        description: "Error al cambiar el estado del estudiante",
        variant: "destructive",
      });
    } finally {
      setCambiandoEstado(prev => ({ ...prev, [estudianteId]: false }));
    }
  };


  const handleInscribirEstudiante = async () => {
    if (!estudianteSeleccionado) {
      toast({
        title: "Error",
        description: "Debes seleccionar un estudiante",
        variant: "destructive",
      });
      return;
    }

    // Validar que no se excedan los cupos totales
    if (selectedAsignaturaInscritos) {
      if (selectedAsignaturaInscritos.cupos_actuales <= 0) {
        toast({
          title: "Error",
          description: "No hay cupos disponibles para esta asignatura",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setInscribiendo(true);
      
      const data: InscribirEstudianteEncuestaFDType = {
        estudiante_id: estudianteSeleccionado.estudiante_id || estudianteSeleccionado.id,
        elecciones: elecciones
      };
      
      await inscribirEstudianteEncuestaFD(data);
      
      // Recargar los inscritos de la asignatura específica
      if (selectedAsignaturaInscritos) {
        await fetchInscritosAsignatura(selectedAsignaturaInscritos.asignatura_encuesta_id);
        
        // Los cupos se actualizan automáticamente en la base de datos
        // Solo actualizamos el estado local
        const inscritosActuales = inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id];
        if (inscritosActuales) {
          const cuposDisponibles = Math.max(0, selectedAsignaturaInscritos.cupos_totales - (inscritosActuales.estadisticas.total_inscritos + 1));
          
          // Actualizar el estado local de las asignaturas
          setAsignaturas(prev => prev.map(asignatura => 
            asignatura.asignatura_encuesta_id === selectedAsignaturaInscritos.asignatura_encuesta_id
              ? { ...asignatura, cupos_actuales: cuposDisponibles }
              : asignatura
          ));
          
          // Actualizar también el estado de selectedAsignaturaInscritos para que el botón se actualice inmediatamente
          setSelectedAsignaturaInscritos(prev => prev ? { ...prev, cupos_actuales: cuposDisponibles } : null);
        }
      }
      
      toast({
        title: "Éxito",
        description: "Estudiante inscrito correctamente",
      });
      
      setShowInscribirModal(false);
      setEstudianteSeleccionado(null);
      setCursoSeleccionado(null);
      setElecciones([]);
      
    } catch (err: unknown) {
      console.error("Error inscribiendo estudiante:", err);
      
      // Obtener más detalles del error si están disponibles
      let errorMessage = "Error al inscribir el estudiante";
      const axiosError = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setInscribiendo(false);
    }
  };

  useEffect(() => {
    fetchAsignaturas();
    fetchAsignaturasExistentes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: name.includes('cupos') ? parseInt(value) || 0 : 
                name === 'asignatura_id' ? (value === '' ? null : parseInt(value)) :
                name === 'horario' || name === 'dia' ? (value === '' ? null : value) : value
      };
      
      // Si se cambian los cupos totales y no estamos editando, actualizar automáticamente los cupos disponibles
      if (name === 'cupos_totales' && !editingAsignatura) {
        updatedData.cupos_actuales = parseInt(value) || 0;
      }
      
      return updatedData;
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      area: "",
      bloque: "Bloque 1",
      cupos_totales: 0,
      cupos_actuales: 0,
      estado: "visible",
      asignatura_id: null,
      horario: null,
      dia: null
    });
    setEditingAsignatura(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingAsignatura) {
        // Actualizar asignatura existente
        const dataToSend = { ...formData, asignatura_encuesta_id: editingAsignatura.asignatura_encuesta_id };
        if (dataToSend.asignatura_id === null) {
          delete dataToSend.asignatura_id;
        }
        
        await updateAsignaturaEncuestaFD(dataToSend);
        toast({
          title: "Éxito",
          description: "Asignatura actualizada correctamente",
        });
      } else {
        // Crear nueva asignatura
        const dataToSend = { ...formData };
        if (dataToSend.asignatura_id === null) {
          delete dataToSend.asignatura_id;
        }
        
        await postAsignaturaEncuestaFD(dataToSend);
        toast({
          title: "Éxito",
          description: "Asignatura creada correctamente",
        });
      }
      
      setShowModal(false);
      resetForm();
      // Recargar la lista de asignaturas y sus inscritos
      await fetchAsignaturas();
    } catch (err) {
      console.error("Error saving asignatura:", err);
      toast({
        title: "Error",
        description: editingAsignatura ? "Error al actualizar la asignatura" : "Error al crear la asignatura",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (asignatura: AsignaturaEncuestaFDType) => {
    setEditingAsignatura(asignatura);
    setFormData({
      nombre: asignatura.nombre,
      area: asignatura.area,
      bloque: asignatura.bloque,
      cupos_totales: asignatura.cupos_totales,
      cupos_actuales: asignatura.cupos_actuales,
      estado: asignatura.estado,
      asignatura_id: asignatura.asignatura_id,
      horario: asignatura.horario,
      dia: asignatura.dia
    });
    setShowModal(true);
  };

  const handleDeleteClick = (asignatura: AsignaturaEncuestaFDType) => {
    setAsignaturaToDelete(asignatura);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!asignaturaToDelete) return;

    try {
      await deleteAsignaturaEncuestaFD(asignaturaToDelete.asignatura_encuesta_id);
      await fetchAsignaturas();
      toast({
        title: "Éxito",
        description: "Asignatura eliminada correctamente",
      });
    } catch (err) {
      console.error("Error deleting asignatura:", err);
      toast({
        title: "Error",
        description: "Error al eliminar la asignatura",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAsignaturaToDelete(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Función para agrupar asignaturas por bloque
  const agruparPorBloque = (asignaturas: AsignaturaEncuestaFDType[]) => {
    const grupos = {
      "Bloque 1": [] as AsignaturaEncuestaFDType[],
      "Bloque 2": [] as AsignaturaEncuestaFDType[],
      "Bloque 3": [] as AsignaturaEncuestaFDType[],
    };

    asignaturas.forEach((asignatura) => {
      if (grupos[asignatura.bloque as keyof typeof grupos]) {
        grupos[asignatura.bloque as keyof typeof grupos].push(asignatura);
      }
    });

    return grupos;
  };

  // Función para exportar inscritos a Excel
  const handleExportExcel = () => {
    if (!selectedAsignaturaInscritos) return;

    const inscritos = inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id]?.inscritos || [];

    if (inscritos.length === 0) {
      toast({
        title: "No hay estudiantes inscritos",
        description: "No hay estudiantes inscritos para exportar",
        variant: "destructive",
      });
      return;
    }

    // Preparar los datos para el Excel
    const excelData = inscritos.map((inscrito) => ({
      "Nombre del Estudiante": inscrito.estudiante.nombre,
      "RUT": inscrito.estudiante.rut,
      "Curso": inscrito.estudiante.curso,
      "Prioridad": `Prioridad ${inscrito.asignatura.prioridad}`,
      "Fecha de Inscripción": new Date(inscrito.fecha_creacion).toLocaleDateString('es-CL'),
      "Última Actualización": new Date(inscrito.fecha_actualizacion).toLocaleDateString('es-CL'),
    }));

    // Crear el libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const colWidths = [
      { wch: 30 }, // Nombre del estudiante
      { wch: 15 }, // RUT
      { wch: 15 }, // Curso
      { wch: 15 }, // Prioridad
      { wch: 20 }, // Fecha de Inscripción
      { wch: 20 }, // Última Actualización
    ];
    ws["!cols"] = colWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Estudiantes Inscritos");

    // Generar el archivo
    XLSX.writeFile(wb, `Inscritos_${selectedAsignaturaInscritos.nombre}.xlsx`);

    toast({
      title: "Exportación exitosa",
      description: `Se han exportado ${inscritos.length} estudiantes inscritos`,
    });
  };

  const gruposAsignaturas = agruparPorBloque(asignaturas);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumbs />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando asignaturas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumbs />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex h-16 shrink-0 items-center border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center gap-2 px-4">
          <Breadcrumbs />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Asignaturas Encuesta FD
            </h1>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona las asignaturas disponibles para la encuesta FD
              </p>
              <div className="flex gap-2">
                <button
                  onClick={openSeleccionModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ver Cursos y Estudiantes
                </button>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      for (const asignatura of asignaturas) {
                        await fetchInscritosAsignatura(asignatura.asignatura_encuesta_id);
                      }
                      toast({
                        title: "Éxito",
                        description: "Cupos sincronizados correctamente",
                      });
                    } catch (error) {
                      console.error("Error sincronizando cupos:", error);
                      toast({
                        title: "Error",
                        description: "Error al sincronizar los cupos",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar Cupos
                </button>
                <button
                  onClick={openCreateModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Asignatura
                </button>
              </div>
            </div>
          </div>

     

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(gruposAsignaturas).map(([bloque, asignaturasBloque]) => (
              <div
                key={bloque}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <div className="bg-blue-600 dark:bg-blue-700 px-4 py-3">
                  <h2 className="text-lg font-semibold text-white">{bloque}</h2>
                  <div className="flex items-center justify-between">
                    <p className="text-blue-100 text-sm">
                      {asignaturasBloque.length} asignatura{asignaturasBloque.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-1">
                      {asignaturasBloque.some(a => a.area === 'A') && (
                        <span className="w-3 h-3 bg-orange-400 rounded-full" title="Área A"></span>
                      )}
                      {asignaturasBloque.some(a => a.area === 'B') && (
                        <span className="w-3 h-3 bg-blue-400 rounded-full" title="Área B"></span>
                      )}
                      {asignaturasBloque.some(a => a.area === 'C') && (
                        <span className="w-3 h-3 bg-purple-400 rounded-full" title="Área C"></span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {asignaturasBloque.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No hay asignaturas en este bloque
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {asignaturasBloque.map((asignatura) => (
                        <div
                          key={asignatura.asignatura_encuesta_id}
                          className={`border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            asignatura.area === 'A' 
                              ? 'border-orange-200 dark:border-orange-700'
                              : asignatura.area === 'B'
                              ? 'border-blue-200 dark:border-blue-700'
                              : 'border-purple-200 dark:border-purple-700'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                {asignatura.nombre}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  asignatura.area === 'A' 
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                    : asignatura.area === 'B'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                }`}>
                                  Área {asignatura.area}
                                </span>
                              </div>
                              {(asignatura.horario || asignatura.dia) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                  {asignatura.dia && <span className="mr-2">📅 {asignatura.dia}</span>}
                                  {asignatura.horario && <span>🕐 {asignatura.horario}</span>}
                                </div>
                              )}
                              {asignatura.asignatura_nombre && (
                                <div className="mb-2">
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                                    Vinculada a: {asignatura.asignatura_nombre}
                                  </p>
                                  <button
                                    onClick={() => openInscritosModal(asignatura)}
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ver inscritos anteriores
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => handleEdit(asignatura)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openInscritosActualesModal(asignatura)}
                                className="p-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                title="Ver inscritos actuales"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => fetchInscritosAsignatura(asignatura.asignatura_encuesta_id)}
                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                title="Recargar inscritos"
                                disabled={loadingInscritosPorAsignatura[asignatura.asignatura_encuesta_id]}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(asignatura)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span className={`${
                              asignatura.cupos_actuales <= 0 
                                ? 'text-red-600 dark:text-red-400 font-medium' 
                                : ''
                            }`}>
                              Cupos: {asignatura.cupos_actuales} de {asignatura.cupos_totales}
                              {asignatura.cupos_actuales <= 0 && (
                                <span className="ml-1 text-red-600 dark:text-red-400">(Lleno)</span>
                              )}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              asignatura.estado === 'visible' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {asignatura.estado}
                            </span>
                          </div>
                          
                          {/* Información de inscritos */}
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            {loadingInscritosPorAsignatura[asignatura.asignatura_encuesta_id] ? (
                              <div className="flex items-center justify-center py-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                                <span className="ml-2 text-xs text-gray-500">Cargando inscritos...</span>
                              </div>
                            ) : inscritosPorAsignatura[asignatura.asignatura_encuesta_id] ? (
                              <div className="text-center">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Inscritos: {inscritosPorAsignatura[asignatura.asignatura_encuesta_id].estadisticas.total_inscritos}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 text-center py-1">
                                Sin inscritos
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal para agregar/editar asignatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingAsignatura ? 'Editar Asignatura' : 'Agregar Nueva Asignatura'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Matemáticas Avanzadas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Área
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecciona un área</option>
                  <option value="A">Área A</option>
                  <option value="B">Área B</option>
                  <option value="C">Área C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bloque
                </label>
                <select
                  name="bloque"
                  value={formData.bloque}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Bloque 1">Bloque 1</option>
                  <option value="Bloque 2">Bloque 2</option>
                  <option value="Bloque 3">Bloque 3</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cupos Totales
                  </label>
                  <input
                    type="number"
                    name="cupos_totales"
                    value={formData.cupos_totales}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cupos Disponibles
                  </label>
                  <input
                    type="number"
                    name="cupos_actuales"
                    value={formData.cupos_actuales}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Cupos disponibles iniciales"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {editingAsignatura 
                      ? "Los cupos disponibles se actualizarán automáticamente al sincronizar"
                      : "Establece los cupos disponibles iniciales para esta asignatura"
                    }
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="visible">Visible</option>
                  <option value="oculto">Oculto</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horario (Opcional)
                  </label>
                  <input
                    type="text"
                    name="horario"
                    value={formData.horario || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: 08:00 - 09:30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Día (Opcional)
                  </label>
                  <input
                    type="text"
                    name="dia"
                    value={formData.dia || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Lunes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vincular con Asignatura Existente (Opcional)
                </label>
                <select
                  name="asignatura_id"
                  value={formData.asignatura_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sin vincular</option>
                  {asignaturasExistentes.map((asignatura) => (
                    <option key={asignatura.asignatura_id} value={asignatura.asignatura_id}>
                      {asignatura.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecciona una asignatura existente para vincular esta encuesta FD
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Guardando..." : (editingAsignatura ? "Actualizar" : "Guardar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para mostrar inscritos anteriores */}
      {showInscritosModal && selectedAsignatura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Inscritos Anteriores
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAsignatura.nombre} - Vinculada a: {selectedAsignatura.asignatura_nombre}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowInscritosModal(false);
                  setSelectedAsignatura(null);
                  setInscritosAnteriores([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingInscritos ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando inscritos...</span>
              </div>
            ) : inscritosAnteriores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estudiante</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">RUT</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Curso</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Asignatura Encuesta</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Asignatura Vinculada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritosAnteriores.map((inscrito, index) => (
                      <tr
                        key={`${inscrito.estudiante_id}-${index}`}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {inscrito.nombre_estudiante}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {inscrito.rut}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {inscrito.nombre_curso}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {inscrito.nombre_asignatura_encuesta}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {inscrito.nombre_asignatura}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Total de inscritos: {inscritosAnteriores.length}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-600 dark:text-gray-400">No hay inscritos anteriores para esta asignatura</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para mostrar inscritos actuales */}
      {showInscritosActualesModal && selectedAsignaturaInscritos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Inscritos Actuales
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAsignaturaInscritos.nombre}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={openInscribirModal}
                  disabled={selectedAsignaturaInscritos.cupos_actuales <= 0}
                  className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors ${
                    selectedAsignaturaInscritos.cupos_actuales <= 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title={selectedAsignaturaInscritos.cupos_actuales <= 0 ? "No hay cupos disponibles" : "Inscribir nuevo estudiante"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Inscribir Estudiante
                </button>
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Exportar Excel
                </button>
                <button
                  onClick={() => {
                    setShowInscritosActualesModal(false);
                    setSelectedAsignaturaInscritos(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            {inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id] && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Estadísticas</h3>
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id].estadisticas.total_inscritos}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Inscritos</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de inscritos */}
            {inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id] && inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id].inscritos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Estudiante</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">RUT</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Curso</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Prioridad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Fecha de Inscripción</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Última Actualización</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id].inscritos.map((inscrito) => (
                      <tr
                        key={inscrito.eleccion_id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {inscrito.estudiante.nombre}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {inscrito.estudiante.rut}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {inscrito.estudiante.curso}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inscrito.asignatura.prioridad === 1 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : inscrito.asignatura.prioridad === 2
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            Prioridad {inscrito.asignatura.prioridad}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(inscrito.fecha_creacion).toLocaleDateString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(inscrito.fecha_actualizacion).toLocaleDateString('es-CL')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteInscritoClick(inscrito.eleccion_id, inscrito.estudiante.nombre)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Eliminar inscripción"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {inscritosPorAsignatura[selectedAsignaturaInscritos.asignatura_encuesta_id] 
                    ? "No hay inscritos actuales para esta asignatura"
                    : "Cargando inscritos..."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para inscribir estudiantes */}
      {showInscribirModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Inscribir Estudiante en {selectedAsignaturaInscritos?.nombre}
              </h2>
              <button
                onClick={() => {
                  setShowInscribirModal(false);
                  setEstudianteSeleccionado(null);
                  setCursoSeleccionado(null);
                  setElecciones([]);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingEstudiantes ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando estudiantes...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selección de curso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seleccionar Curso
                  </label>
                  <select
                    value={cursoSeleccionado || ''}
                    onChange={(e) => {
                      const cursoId = e.target.value ? parseInt(e.target.value) : null;
                      handleCursoChange(cursoId);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Selecciona un curso</option>
                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de estudiante */}
                {cursoSeleccionado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seleccionar Estudiante
                    </label>
                    {estudiantesPorCurso[cursoSeleccionado] && estudiantesPorCurso[cursoSeleccionado].length > 0 ? (
                      <select
                        value={estudianteSeleccionado ? (estudianteSeleccionado.estudiante_id || estudianteSeleccionado.id) : ''}
                        onChange={(e) => {
                          const estudianteId = parseInt(e.target.value);
                          const estudiante = estudiantesPorCurso[cursoSeleccionado].find(est => (est.estudiante_id || est.id) === estudianteId);
                          handleEstudianteChange(estudiante || null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Selecciona un estudiante</option>
                        {estudiantesPorCurso[cursoSeleccionado].map((estudiante) => (
                          <option key={estudiante.estudiante_id || estudiante.id} value={estudiante.estudiante_id || estudiante.id}>
                            {estudiante.nombre} - {estudiante.rut}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No hay estudiantes disponibles en el curso {cursoSeleccionado}
                      </div>
                    )}
                  </div>
                )}

                {/* Información de la asignatura */}
                {estudianteSeleccionado && selectedAsignaturaInscritos && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Asignatura a Inscribir
                    </h3>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{selectedAsignaturaInscritos.nombre}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Área {selectedAsignaturaInscritos.area} - {selectedAsignaturaInscritos.bloque}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Prioridad:</span>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            elecciones[0]?.prioridad === 1 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : elecciones[0]?.prioridad === 2
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {elecciones[0]?.prioridad || 1}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Prioridad automática: Área {selectedAsignaturaInscritos.area} = Prioridad {elecciones[0]?.prioridad || 1}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                                      onClick={() => {
                    setShowInscribirModal(false);
                    setEstudianteSeleccionado(null);
                    setCursoSeleccionado(null);
                    setElecciones([]);
                  }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleInscribirEstudiante}
                    disabled={!estudianteSeleccionado || inscribiendo}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {inscribiendo ? "Inscribiendo..." : "Inscribir Estudiante"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para seleccionar cursos y estudiantes */}
      {showSeleccionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cursos y Estudiantes Disponibles
              </h2>
              <button
                onClick={() => {
                  setShowSeleccionModal(false);
                  setCursoSeleccionadoModal(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingSeleccion ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando cursos y estudiantes...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumen general de estados */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Resumen de Estados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {Object.values(estudiantesPorCursoModal).flat().length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Estudiantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Object.values(estudiantesPorCursoModal).flat().filter(est => estadosEstudiantes[est.estudiante_id || est.id] ?? true).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Con Acceso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {Object.values(estudiantesPorCursoModal).flat().filter(est => !(estadosEstudiantes[est.estudiante_id || est.id] ?? true)).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sin Acceso</div>
                    </div>
                  </div>
                </div>

                {/* Selección de curso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Seleccionar Curso
                  </label>
                  <select
                    value={cursoSeleccionadoModal || ''}
                    onChange={(e) => {
                      const cursoId = e.target.value ? parseInt(e.target.value) : null;
                      handleCursoChangeModal(cursoId);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Selecciona un curso para ver sus estudiantes</option>
                    {cursosModal.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lista de estudiantes del curso seleccionado */}
                {cursoSeleccionadoModal && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Estudiantes del Curso: {cursosModal.find(c => c.id === cursoSeleccionadoModal)?.nombre}
                    </h3>
                    {estudiantesPorCursoModal[cursoSeleccionadoModal] && estudiantesPorCursoModal[cursoSeleccionadoModal].length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Nombre</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">RUT</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Curso</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">ID Estudiante</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Acceso Encuesta FD</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {estudiantesPorCursoModal[cursoSeleccionadoModal].map((estudiante) => {
                              const estudianteId = estudiante.estudiante_id || estudiante.id;
                              const tieneAcceso = estadosEstudiantes[estudianteId] ?? true;
                              const estaCambiando = cambiandoEstado[estudianteId] ?? false;
                              
                              return (
                                <tr
                                  key={estudianteId}
                                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                    {estudiante.nombre}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {estudiante.rut}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {cursosModal.find(c => c.id === estudiante.curso_id)?.nombre || `Curso ${estudiante.curso_id}`}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                    {estudianteId}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      tieneAcceso 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                      {tieneAcceso ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      onClick={() => handleCambiarEstadoEstudiante(estudianteId, !tieneAcceso)}
                                      disabled={estaCambiando}
                                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        tieneAcceso
                                          ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                                      }`}
                                    >
                                      {estaCambiando ? (
                                        <div className="flex items-center gap-1">
                                          <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                          <span>Cambiando...</span>
                                        </div>
                                      ) : (
                                        tieneAcceso ? 'Desactivar' : 'Activar'
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                          Total de estudiantes: {estudiantesPorCursoModal[cursoSeleccionadoModal].length}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">👥</div>
                        <p className="text-gray-600 dark:text-gray-400">
                          No hay estudiantes disponibles en este curso
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resumen de todos los cursos */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Resumen de Cursos Disponibles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cursosModal.map((curso) => (
                      <div
                        key={curso.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {curso.nombre}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {curso.id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Estudiantes: {estudiantesPorCursoModal[curso.id]?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Con acceso: {estudiantesPorCursoModal[curso.id]?.filter(est => estadosEstudiantes[est.estudiante_id || est.id] ?? true).length || 0}
                        </p>
                        <button
                          onClick={() => handleCursoChangeModal(curso.id)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          Ver estudiantes
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón de cerrar */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowSeleccionModal(false);
                      setCursoSeleccionadoModal(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Dialog para confirmar eliminación de asignatura */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la asignatura{" "}
              <strong>{asignaturaToDelete?.nombre}</strong> de la encuesta FD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar eliminación de inscrito */}
      <AlertDialog open={isDeleteInscritoDialogOpen} onOpenChange={setIsDeleteInscritoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la inscripción de{" "}
              <strong>{inscritoToDelete?.estudiante_nombre}</strong> de la asignatura{" "}
              <strong>{selectedAsignaturaInscritos?.nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingInscrito}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteInscrito} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingInscrito}
            >
              {deletingInscrito ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </div>
  );
};

export default PageFD;
