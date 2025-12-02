import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  FlatList,
  Image,
  KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/solicitudesStyles';
import { cargarCatalogos, crearSolicitud, listarSolicitudesUsuario, obtenerImagenesSolicitud, cargarEstadosSolicitudes, cancelarSolicitud } from '../Funciones/solicitudes';
import { buscarDirecciones } from '../Funciones/geocoding';
import OfertasSolicitudModal from '../Componentes/Ofertas/OfertasSolicitudModal';

export default function SolicitudesScreen() {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Estados del modal
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Estados del modal de detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [imagenesSolicitud, setImagenesSolicitud] = useState([]);
  const [cargandoImagenesSolicitud, setCargandoImagenesSolicitud] = useState(false);
  
  // Estados para modal de imagen completa
  const [modalImagenCompletaVisible, setModalImagenCompletaVisible] = useState(false);
  const [imagenCompletaUri, setImagenCompletaUri] = useState(null);
  
  // Estados del modal de ofertas
  const [modalOfertasVisible, setModalOfertasVisible] = useState(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    idCategoria: '',
    idComuna: '',
    titulo: '',
    descripcion: '',
    direccion: '',
    latitud: null,
    longitud: null,
    contacto: '',
    fechaServicio: new Date(),
  });

  // Estados para date picker
  const [showDateServicio, setShowDateServicio] = useState(false);

  // Estados para búsqueda de direcciones
  const [busquedaDireccion, setBusquedaDireccion] = useState('');
  const [sugerenciasDireccion, setSugerenciasDireccion] = useState([]);
  const [buscandoDirecciones, setBuscandoDirecciones] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estados para datos de la API
  const [categorias, setCategorias] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [estadosSolicitudes, setEstadosSolicitudes] = useState([]);
  
  // Estados para búsqueda/filtrado
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [busquedaComuna, setBusquedaComuna] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(null); // Filtro por estado (null = todas, o Id_SolicitudServicioEstado)
  const [mostrarSelectorEstado, setMostrarSelectorEstado] = useState(false);

  // Estados para solicitudes
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [cancelandoSolicitud, setCancelandoSolicitud] = useState(null);

  // Estados para imágenes (ahora es un array para hasta 3 imágenes)
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [comprimiendoImagen, setComprimiendoImagen] = useState(false);

  // Cargar categorías, comunas y solicitudes al montar el componente
  useEffect(() => {
    cargarDatos();
    cargarMisSolicitudes();
    cargarEstados();
  }, []);

  // Actualizar datos cada vez que la pantalla recibe foco
  useFocusEffect(
    React.useCallback(() => {
      cargarEstados();
      cargarMisSolicitudes();
    }, [])
  );

  const cargarEstados = async () => {
    try {
      const estados = await cargarEstadosSolicitudes();
      setEstadosSolicitudes(estados);
    } catch (error) {
      console.error('Error cargando estados de solicitudes:', error);
    }
  };

  // Función para cargar catálogos desde la API
  const cargarDatos = async () => {
    try {
      setCargandoCatalogos(true);
      const { categorias, comunas } = await cargarCatalogos();
      setCategorias(categorias);
      setComunas(comunas);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudieron cargar las categorías y comunas. Verifica tu conexión e intenta nuevamente.',
        [
          {
            text: 'Reintentar',
            onPress: () => cargarDatos()
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setCargandoCatalogos(false);
    }
  };

  // Función para cargar las solicitudes del usuario
  const cargarMisSolicitudes = async () => {
    try {
      setCargandoSolicitudes(true);
      const solicitudesData = await listarSolicitudesUsuario();
      setSolicitudes(solicitudesData);
      // Aplicar filtro después de cargar
      aplicarFiltro(solicitudesData, filtroEstado);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setCargandoSolicitudes(false);
      setRefrescando(false);
    }
  };

  // Función para aplicar filtro a las solicitudes
  const aplicarFiltro = (solicitudesData, idEstado) => {
    if (idEstado === null) {
      setSolicitudesFiltradas(solicitudesData || []);
    } else {
      const filtradas = (solicitudesData || []).filter(solicitud => solicitud.Id_SolicitudServicioEstado === idEstado);
      setSolicitudesFiltradas(filtradas);
    }
  };

  // Función para cambiar el filtro
  const cambiarFiltro = (estado) => {
    setFiltroEstado(estado);
    aplicarFiltro(solicitudes, estado);
  };

  // Actualizar solicitudes filtradas cuando cambia el filtro o las solicitudes
  useEffect(() => {
    aplicarFiltro(solicitudes, filtroEstado);
  }, [filtroEstado, solicitudes]);

  // Función para refrescar solicitudes (pull to refresh)
  const refrescarSolicitudes = async () => {
    setRefrescando(true);
    // Recargar estados y solicitudes
    await Promise.all([
      cargarEstados(),
      cargarMisSolicitudes()
    ]);
  };

  // Función para actualizar solicitudes después de aceptar una oferta
  const actualizarSolicitudesDespuesAceptar = async () => {
    // Recargar estados y solicitudes para reflejar el nuevo estado
    await Promise.all([
      cargarEstados(),
      cargarMisSolicitudes()
    ]);
  };

  // Función para buscar direcciones con la API de geocoding
  const buscarDireccionesAsync = async (texto) => {
    if (!texto || texto.trim().length < 3) {
      setSugerenciasDireccion([]);
      setMostrarSugerencias(false);
      return;
    }

    try {
      setBuscandoDirecciones(true);
      const sugerencias = await buscarDirecciones(texto);
      setSugerenciasDireccion(sugerencias);
      setMostrarSugerencias(sugerencias.length > 0);
    } catch (error) {
      console.error('Error buscando direcciones:', error);
    } finally {
      setBuscandoDirecciones(false);
    }
  };

  // Función para seleccionar una dirección de las sugerencias
  const seleccionarDireccion = (sugerencia) => {
    // Actualizar formData con la dirección seleccionada
    setFormData(prev => ({
      ...prev,
      direccion: sugerencia.direccion,
      latitud: sugerencia.latitude,
      longitud: sugerencia.longitude,
    }));
    
    // Actualizar el campo de búsqueda
    setBusquedaDireccion(sugerencia.direccion);
    
    // Cerrar y limpiar las sugerencias inmediatamente
    setMostrarSugerencias(false);
    setSugerenciasDireccion([]);
  };

  // Función debounce para no buscar en cada tecla
  useEffect(() => {
    // Solo buscar si NO hay una dirección ya seleccionada con coordenadas
    if (formData.latitud && formData.longitud && busquedaDireccion === formData.direccion) {
      // Ya hay una dirección seleccionada, no buscar
      return;
    }

    const timer = setTimeout(() => {
      buscarDireccionesAsync(busquedaDireccion);
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => clearTimeout(timer);
  }, [busquedaDireccion]);

  // Función para manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para comprimir imagen a menos de 100KB sin recortar, optimizada para velocidad
  const comprimirImagen = async (uri) => {
    const maxSizeKB = 100;
    
    // Estrategia optimizada: redimensionar una vez a tamaño razonable, luego ajustar solo calidad
    // Esto es mucho más rápido que múltiples redimensionados
    const anchoInicial = 1200; // Tamaño inicial razonable
    
    // Primero redimensionar y comprimir con calidad media
    let resultado = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: anchoInicial } }],
      { 
        compress: 0.5, 
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true
      }
    );

    // Calcular tamaño
    let base64Size = resultado.base64 ? (resultado.base64.length * 3) / 4 : 0;
    let sizeKB = base64Size / 1024;

    // Si ya está dentro del límite, retornar
    if (sizeKB <= maxSizeKB) {
      return resultado;
    }

    // Si es muy grande, reducir calidad progresivamente (máximo 3 intentos)
    const calidades = [0.4, 0.3, 0.2];
    for (const calidad of calidades) {
      resultado = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: anchoInicial } }],
        { 
          compress: calidad, 
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true
        }
      );

      base64Size = resultado.base64 ? (resultado.base64.length * 3) / 4 : 0;
      sizeKB = base64Size / 1024;

      if (sizeKB <= maxSizeKB) {
        return resultado;
      }
    }

    // Si aún es grande, reducir tamaño y usar calidad baja
    resultado = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { 
        compress: 0.2, 
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true
      }
    );

    return resultado;
  };

  // Función para seleccionar imágenes (hasta 3)
  const seleccionarImagen = async () => {
    try {
      // Verificar si ya hay 3 imágenes
      if (imagenesSeleccionadas.length >= 3) {
        Alert.alert('Límite alcanzado', 'Solo puedes seleccionar hasta 3 imágenes');
        return;
      }

      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a las imágenes');
        return;
      }

      // Calcular cuántas imágenes se pueden seleccionar
      const imagenesDisponibles = 3 - imagenesSeleccionadas.length;

      // Abrir selector de imágenes (sin recortar, permitir múltiples)
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Array de strings según la documentación
        allowsEditing: false, // No recortar
        allowsMultipleSelection: imagenesDisponibles > 1, // Permitir múltiples si hay espacio
        quality: 1,
        selectionLimit: imagenesDisponibles, // Máximo de imágenes a seleccionar
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        setComprimiendoImagen(true);
        
        const nuevasImagenes = [];
        
        // Procesar cada imagen seleccionada
        for (const imagenOriginal of resultado.assets) {
          let imagenComprimidaUri = null;
          try {
            // Comprimir imagen (ya incluye base64)
            const imagenComprimida = await comprimirImagen(imagenOriginal.uri);
            
            if (!imagenComprimida.base64) {
              console.error('No se pudo procesar una imagen');
              continue;
            }
            
            // Guardar la URI del archivo temporal para limpiarlo después
            imagenComprimidaUri = imagenComprimida.uri;
            
            const nombreArchivo = `imagen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
            
            nuevasImagenes.push({
              uri: imagenComprimida.uri, // URI para preview (se mantiene hasta eliminar o enviar)
              base64: imagenComprimida.base64,
              nombre: nombreArchivo,
              tempUri: imagenComprimidaUri !== imagenOriginal.uri ? imagenComprimidaUri : null, // Guardar URI temporal solo si es diferente a la original
            });
            
            // NO eliminar el archivo aquí - se necesita para el preview
            // Se eliminará cuando se elimine la imagen del estado o cuando se envíe exitosamente
          } catch (error) {
            console.error('Error procesando imagen:', error);
            // Intentar limpiar el archivo temporal en caso de error
            if (imagenComprimidaUri) {
              try {
                await FileSystem.deleteAsync(imagenComprimidaUri, { idempotent: true });
              } catch (deleteError) {
                // Ignorar
              }
            }
          }
        }
        
        // Agregar las nuevas imágenes a las existentes
        setImagenesSeleccionadas(prev => [...prev, ...nuevasImagenes]);
        setComprimiendoImagen(false);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      setComprimiendoImagen(false);
    }
  };

  // Función para eliminar imagen seleccionada
  const eliminarImagen = async (index) => {
    const imagenAEliminar = imagenesSeleccionadas[index];
    
    // Limpiar archivo temporal si existe
    if (imagenAEliminar?.tempUri) {
      try {
        await FileSystem.deleteAsync(imagenAEliminar.tempUri, { idempotent: true });
      } catch (error) {
        // Ignorar errores (puede que ya no exista)
        console.log('Archivo temporal ya eliminado');
      }
    }
    
    setImagenesSeleccionadas(prev => prev.filter((_, i) => i !== index));
  };

  // Función para crear la solicitud
  const handleCrearSolicitud = async () => {
    try {
      setLoading(true);
      // Agregar todas las imágenes seleccionadas
      const datosConImagen = {
        ...formData,
        todasLasImagenes: imagenesSeleccionadas, // Array con todas las imágenes
      };
      const resultado = await crearSolicitud(datosConImagen);
      
      if (resultado.exito) {
        // Limpiar archivos temporales después de enviar exitosamente
        for (const imagen of imagenesSeleccionadas) {
          if (imagen?.tempUri) {
            try {
              await FileSystem.deleteAsync(imagen.tempUri, { idempotent: true });
            } catch (error) {
              // Ignorar errores
            }
          }
        }
        
        Alert.alert(
          'Éxito',
          'Solicitud de servicio creada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                limpiarFormulario();
                // Recargar las solicitudes
                cargarMisSolicitudes();
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar el formulario
  const limpiarFormulario = async () => {
    // Limpiar archivos temporales de imágenes antes de limpiar el estado
    for (const imagen of imagenesSeleccionadas) {
      if (imagen?.tempUri) {
        try {
          await FileSystem.deleteAsync(imagen.tempUri, { idempotent: true });
        } catch (error) {
          // Ignorar errores
        }
      }
    }
    
    setFormData({
      idCategoria: '',
      idComuna: '',
      titulo: '',
      descripcion: '',
      direccion: '',
      latitud: null,
      longitud: null,
      contacto: '',
      fechaServicio: new Date(),
    });
    setBusquedaDireccion('');
    setSugerenciasDireccion([]);
    setMostrarSugerencias(false);
    setImagenesSeleccionadas([]);
    // Limpiar filtros de búsqueda
    setBusquedaCategoria('');
    setBusquedaComuna('');
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Función para formatear fecha desde string ISO
  const formatearFechaISO = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Función para obtener el nombre de la categoría por ID
  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(cat => cat.Id_Categoria === idCategoria);
    return categoria ? categoria.CAT_Nombre : 'Sin categoría';
  };

  // Función para obtener el nombre de la comuna por ID
  const obtenerNombreComuna = (idComuna) => {
    const comuna = comunas.find(com => com.Id_Comuna === idComuna);
    return comuna ? comuna.COM_Nombre : 'Sin comuna';
  };

  // Obtener información del estado por ID
  const obtenerEstadoPorId = (idEstado) => {
    return estadosSolicitudes.find(estado => estado.Id_SolicitudEstado === idEstado);
  };

  const obtenerTextoEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    return estado ? estado.SE_Nombre : 'Desconocido';
  };

  const obtenerColorEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    const nombreEstado = estado ? estado.SE_Nombre : '';
    
    // Colores basados en el nombre del estado
    switch(nombreEstado?.toUpperCase()) {
      case 'ABIERTA': return { bg: '#E3F2FD', text: '#1976D2' };
      case 'EN SERVICIO': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'CANCELADA': return { bg: '#FFEBEE', text: '#C62828' };
      case 'VENCIDA': return { bg: '#FFF3E0', text: '#F57C00' };
      default: return { bg: '#F5F5F5', text: '#757575' };
    }
  };

  // Verificar si una solicitud está cancelada
  const estaCancelada = (solicitud) => {
    const estado = obtenerEstadoPorId(solicitud?.Id_SolicitudServicioEstado);
    return estado?.SE_Nombre?.toUpperCase() === 'CANCELADA';
  };

  // Verificar si una solicitud permite interacción basado en SE_Modifica
  const noPermiteInteraccion = (solicitud) => {
    const estado = obtenerEstadoPorId(solicitud?.Id_SolicitudServicioEstado);
    // Si el estado tiene SE_Modifica = false, no permite interacción
    return estado ? !estado.SE_Modifica : true;
  };

  // Manejar cancelación de solicitud
  const handleCancelarSolicitud = async (solicitud) => {
    Alert.alert(
      'Cancelar Solicitud',
      `¿Estás seguro de que deseas cancelar esta solicitud?\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelandoSolicitud(solicitud.Id_SolicitudServicio);
              const resultado = await cancelarSolicitud(solicitud.Id_SolicitudServicio);
              
              if (resultado.exito) {
                // Recargar estados y solicitudes
                await Promise.all([
                  cargarEstados(),
                  cargarMisSolicitudes()
                ]);
                // Cerrar el modal de detalle
                cerrarDetalleSolicitud();
                Alert.alert('Éxito', 'La solicitud ha sido cancelada correctamente.');
              }
            } catch (error) {
              console.error('Error al cancelar solicitud:', error);
            } finally {
              setCancelandoSolicitud(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Función para abrir el modal de detalle
  const abrirDetalleSolicitud = async (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalDetalleVisible(true);
    // Cargar imágenes cuando se abre el modal
    if (solicitud?.Id_SolicitudServicio) {
      cargarImagenesSolicitud(solicitud.Id_SolicitudServicio);
    }
  };

  // Función para cargar imágenes de la solicitud
  const cargarImagenesSolicitud = async (idSolicitudServicio) => {
    if (!idSolicitudServicio) return;
    
    try {
      setCargandoImagenesSolicitud(true);
      const imagenesData = await obtenerImagenesSolicitud(idSolicitudServicio);
      setImagenesSolicitud(imagenesData || []);
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      setImagenesSolicitud([]);
    } finally {
      setCargandoImagenesSolicitud(false);
    }
  };

  // Función para cerrar el modal de detalle
  const cerrarDetalleSolicitud = () => {
    setModalDetalleVisible(false);
    setSolicitudSeleccionada(null);
    setImagenesSolicitud([]); // Limpiar imágenes al cerrar
  };

  // Función para abrir el modal de ofertas
  const abrirModalOfertas = () => {
    setModalOfertasVisible(true);
  };

  // Función para cerrar el modal de ofertas
  const cerrarModalOfertas = () => {
    setModalOfertasVisible(false);
  };

  // Filtrar categorías según búsqueda
  const categoriasFiltradas = categorias.filter(cat =>
    cat.CAT_Nombre.toLowerCase().includes(busquedaCategoria.toLowerCase())
  );

  // Filtrar comunas según búsqueda
  const comunasFiltradas = comunas.filter(com =>
    com.COM_Nombre.toLowerCase().includes(busquedaComuna.toLowerCase())
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Ionicons name="document-text" size={24} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mis Solicitudes</Text>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={[styles.content, { 
        backgroundColor: theme.colors.background,
        paddingBottom: 0,
        marginBottom: -(63 + insets.bottom), // Compensar el espacio del tab bar
      }]}>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>
          Gestiona tus solicitudes de servicio
        </Text>
        
        {/* Filtro por estado - Combo Box */}
        <View style={styles.filtrosContainer}>
          <TouchableOpacity
            style={[
              styles.filtroSelector,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setMostrarSelectorEstado(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filtroSelectorContent}>
              <Ionicons name="filter" size={18} color={theme.colors.primary} />
              <Text style={[styles.filtroSelectorText, { color: theme.colors.text }]}>
                {filtroEstado === null 
                  ? 'Todos los estados' 
                  : obtenerTextoEstado(filtroEstado)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#888' : '#666'} />
          </TouchableOpacity>
        </View>

        {/* Modal selector de estado */}
        <Modal
          visible={mostrarSelectorEstado}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMostrarSelectorEstado(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMostrarSelectorEstado(false)}
          >
            <View style={[styles.modalSelectorContent, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalSelectorHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.modalSelectorTitle, { color: theme.colors.text }]}>
                  Filtrar por estado
                </Text>
                <TouchableOpacity onPress={() => setMostrarSelectorEstado(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={[{ Id_SolicitudEstado: null, SE_Nombre: 'Todos' }, ...estadosSolicitudes]}
                keyExtractor={(item) => item.Id_SolicitudEstado?.toString() || 'todos'}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.estadoSelectorItem,
                      {
                        backgroundColor: filtroEstado === item.Id_SolicitudEstado 
                          ? theme.colors.primary + '15' 
                          : 'transparent',
                        borderBottomColor: theme.colors.border,
                      }
                    ]}
                    onPress={() => {
                      cambiarFiltro(item.Id_SolicitudEstado);
                      setMostrarSelectorEstado(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.estadoSelectorText,
                        {
                          color: filtroEstado === item.Id_SolicitudEstado 
                            ? theme.colors.primary 
                            : theme.colors.text,
                          fontWeight: filtroEstado === item.Id_SolicitudEstado ? '600' : '400',
                        }
                      ]}
                    >
                      {item.SE_Nombre}
                    </Text>
                    {filtroEstado === item.Id_SolicitudEstado && (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.estadoSelectorList}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Lista de solicitudes */}
        {cargandoSolicitudes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Cargando solicitudes...
            </Text>
          </View>
        ) : solicitudesFiltradas.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={refrescarSolicitudes}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          >
            <Ionicons name="clipboard-outline" size={64} color={isDarkMode ? '#555' : '#CCC'} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999' }]}>
              {filtroEstado === null 
                ? 'No tienes solicitudes activas'
                : `No hay solicitudes ${obtenerTextoEstado(filtroEstado).toLowerCase()}s`
              }
            </Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#AAA' }]}>
              {filtroEstado === null 
                ? 'Crea tu primera solicitud usando el botón +'
                : 'Intenta con otro filtro'
              }
            </Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#AAA', marginTop: 8, fontSize: 12 }]}>
              Arrastra hacia abajo para actualizar
            </Text>
          </ScrollView>
        ) : (
          <FlatList
            data={solicitudesFiltradas}
            keyExtractor={(item) => item.Id_SolicitudServicio?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <View style={[styles.solicitudCard, { 
                backgroundColor: theme.colors.card, 
                borderColor: theme.colors.border 
              }]}>
                {/* Header con título y estado */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={2}>
                      {item.SS_Titulo}
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoBadge,
                    { 
                      backgroundColor: obtenerColorEstado(item.Id_SolicitudServicioEstado).bg,
                      borderColor: obtenerColorEstado(item.Id_SolicitudServicioEstado).text
                    }
                  ]}>
                    <View style={[
                      styles.estadoDot,
                      { backgroundColor: obtenerColorEstado(item.Id_SolicitudServicioEstado).text }
                    ]} />
                    <Text style={[
                      styles.estadoText,
                      { color: obtenerColorEstado(item.Id_SolicitudServicioEstado).text }
                    ]}>
                      {obtenerTextoEstado(item.Id_SolicitudServicioEstado)}
                    </Text>
                  </View>
                </View>

                {/* Tags de categoría y comuna */}
                <View style={styles.cardTagsContainer}>
                  <View style={[styles.cardTag, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                    <Ionicons name="pricetag" size={12} color={isDarkMode ? '#AAA' : '#666'} />
                    <Text style={[styles.cardTagText, { color: isDarkMode ? '#CCC' : '#555' }]}>
                      {obtenerNombreCategoria(item.Id_Categoria)}
                    </Text>
                  </View>
                  <View style={[styles.cardTag, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                    <Ionicons name="location" size={12} color={isDarkMode ? '#AAA' : '#666'} />
                    <Text style={[styles.cardTagText, { color: isDarkMode ? '#CCC' : '#555' }]}>
                      {obtenerNombreComuna(item.Id_Comuna)}
                    </Text>
                  </View>
                </View>

                {/* Descripción */}
                <View style={styles.cardDescriptionSection}>
                  <Text style={[styles.cardDescription, { color: isDarkMode ? '#DDD' : '#444' }]} numberOfLines={3}>
                    {item.SS_Descripcion}
                  </Text>
                </View>

                {/* Información de ubicación y fecha */}
                <View style={[styles.cardInfoSection, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }]}>
                  <View style={styles.cardInfoRow}>
                    <View style={[styles.cardInfoIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Ionicons name="navigate" size={14} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.cardInfoText, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.SS_Direccion}
                    </Text>
                  </View>
                  <View style={styles.cardInfoRow}>
                    <View style={[styles.cardInfoIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Ionicons name="calendar" size={14} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.cardInfoText, { color: theme.colors.text }]}>
                      {formatearFechaISO(item.SS_FechaServicio)}
                    </Text>
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[
                      styles.verOfertasButtonCard, 
                      { 
                        borderTopColor: theme.colors.border, 
                        borderRightColor: theme.colors.border, 
                        borderRightWidth: 1,
                        opacity: noPermiteInteraccion(item) ? 0.5 : 1
                      }
                    ]}
                    onPress={() => {
                      if (!noPermiteInteraccion(item)) {
                        setSolicitudSeleccionada(item);
                        abrirModalOfertas();
                      }
                    }}
                    disabled={noPermiteInteraccion(item)}
                  >
                    <Ionicons 
                      name="pricetag" 
                      size={18} 
                      color={noPermiteInteraccion(item) ? '#999' : theme.colors.primary} 
                    />
                    <Text style={[
                      styles.verOfertasTextCard, 
                      { color: noPermiteInteraccion(item) ? '#999' : theme.colors.primary }
                    ]}>
                      Ver Ofertas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.verDetalleButton, 
                      { 
                        borderTopColor: theme.colors.border,
                        opacity: noPermiteInteraccion(item) ? 0.5 : 1
                      }
                    ]}
                    onPress={() => {
                      if (!noPermiteInteraccion(item)) {
                        abrirDetalleSolicitud(item);
                      }
                    }}
                    disabled={noPermiteInteraccion(item)}
                  >
                    <Text style={[
                      styles.verDetalleText, 
                      { color: noPermiteInteraccion(item) ? '#999' : theme.colors.primary }
                    ]}>
                      Ver detalles
                    </Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={18} 
                      color={noPermiteInteraccion(item) ? '#999' : theme.colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={[styles.solicitudesList, { paddingBottom: 63 + insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={refrescarSolicitudes}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>

      {/* Botón flotante para crear solicitud */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Modal del formulario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          limpiarFormulario();
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              {/* Header del modal */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Nueva Solicitud de Servicio
                </Text>
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  limpiarFormulario();
                }}>
                  <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Formulario */}
              <ScrollView 
                style={styles.formContainer} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
              
              {/* Loading de catálogos */}
              {cargandoCatalogos ? (
                <View style={styles.loadingCatalogos}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    Cargando datos...
                  </Text>
                </View>
              ) : (
                <>
                  {/* Categoría */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Categoría *</Text>
                    {categorias.length === 0 ? (
                      <View style={[styles.emptyChips, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                        <Ionicons name="alert-circle-outline" size={20} color={isDarkMode ? '#888' : '#999'} />
                        <Text style={[styles.emptyChipsText, { color: isDarkMode ? '#888' : '#999' }]}>
                          No hay categorías disponibles
                        </Text>
                      </View>
                    ) : (
                      <>
                        {/* Campo de búsqueda de categoría */}
                        <View style={styles.searchInputWrapper}>
                          <Ionicons name="search" size={18} color={isDarkMode ? '#888' : '#999'} style={styles.searchIconSmall} />
                          <TextInput
                            style={[styles.searchInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Buscar categoría..."
                            placeholderTextColor={isDarkMode ? '#888' : '#999'}
                            value={busquedaCategoria}
                            onChangeText={setBusquedaCategoria}
                          />
                          {busquedaCategoria.length > 0 && (
                            <TouchableOpacity onPress={() => setBusquedaCategoria('')} style={styles.clearButton}>
                              <Ionicons name="close-circle" size={18} color={isDarkMode ? '#888' : '#999'} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Chips de categorías filtradas */}
                        {categoriasFiltradas.length === 0 ? (
                          <View style={[styles.emptyChips, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                            <Ionicons name="alert-circle-outline" size={20} color={isDarkMode ? '#888' : '#999'} />
                            <Text style={[styles.emptyChipsText, { color: isDarkMode ? '#888' : '#999' }]}>
                              No se encontraron categorías con "{busquedaCategoria}"
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {categoriasFiltradas.map((cat) => (
                                <TouchableOpacity
                                  key={cat.Id_Categoria}
                                  style={[
                                    styles.categoryChip,
                                    formData.idCategoria === cat.Id_Categoria.toString() && { backgroundColor: theme.colors.primary }
                                  ]}
                                  onPress={() => handleInputChange('idCategoria', cat.Id_Categoria.toString())}
                                >
                                  <Text style={[
                                    styles.categoryChipText,
                                    formData.idCategoria === cat.Id_Categoria.toString() && { color: '#FFF' }
                                  ]}>
                                    {cat.CAT_Nombre}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </>
                    )}
                  </View>

                  {/* Comuna */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Comuna *</Text>
                    {comunas.length === 0 ? (
                      <View style={[styles.emptyChips, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                        <Ionicons name="alert-circle-outline" size={20} color={isDarkMode ? '#888' : '#999'} />
                        <Text style={[styles.emptyChipsText, { color: isDarkMode ? '#888' : '#999' }]}>
                          No hay comunas disponibles
                        </Text>
                      </View>
                    ) : (
                      <>
                        {/* Campo de búsqueda de comuna */}
                        <View style={styles.searchInputWrapper}>
                          <Ionicons name="search" size={18} color={isDarkMode ? '#888' : '#999'} style={styles.searchIconSmall} />
                          <TextInput
                            style={[styles.searchInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Buscar comuna..."
                            placeholderTextColor={isDarkMode ? '#888' : '#999'}
                            value={busquedaComuna}
                            onChangeText={setBusquedaComuna}
                          />
                          {busquedaComuna.length > 0 && (
                            <TouchableOpacity onPress={() => setBusquedaComuna('')} style={styles.clearButton}>
                              <Ionicons name="close-circle" size={18} color={isDarkMode ? '#888' : '#999'} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Chips de comunas filtradas */}
                        {comunasFiltradas.length === 0 ? (
                          <View style={[styles.emptyChips, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                            <Ionicons name="alert-circle-outline" size={20} color={isDarkMode ? '#888' : '#999'} />
                            <Text style={[styles.emptyChipsText, { color: isDarkMode ? '#888' : '#999' }]}>
                              No se encontraron comunas con "{busquedaComuna}"
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {comunasFiltradas.map((com) => (
                                <TouchableOpacity
                                  key={com.Id_Comuna}
                                  style={[
                                    styles.categoryChip,
                                    formData.idComuna === com.Id_Comuna.toString() && { backgroundColor: theme.colors.primary }
                                  ]}
                                  onPress={() => handleInputChange('idComuna', com.Id_Comuna.toString())}
                                >
                                  <Text style={[
                                    styles.categoryChipText,
                                    formData.idComuna === com.Id_Comuna.toString() && { color: '#FFF' }
                                  ]}>
                                    {com.COM_Nombre}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </>
              )}

              {/* Título */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Título del servicio *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Ej: Reparación de cañería"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  value={formData.titulo}
                  onChangeText={(text) => handleInputChange('titulo', text)}
                  maxLength={250}
                />
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Descripción del servicio *</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="Describe detalladamente el servicio que necesitas..."
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  value={formData.descripcion}
                  onChangeText={(text) => handleInputChange('descripcion', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Selección de imágenes */}
              <View style={styles.inputGroup}>
                <View style={styles.imageLabelContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>
                    {imagenesSeleccionadas.length > 0 ? 'Imágenes' : 'Imágenes (opcional)'}
                  </Text>
                  {imagenesSeleccionadas.length > 0 && (
                    <View style={[styles.imageCountBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Text style={[styles.imageCountText, { color: theme.colors.primary }]}>
                        {imagenesSeleccionadas.length}/3
                      </Text>
                    </View>
                  )}
                </View>
                {comprimiendoImagen ? (
                  <View style={[styles.imageContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={[styles.imageLoadingText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                      Cargando imagen...
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Lista de imágenes seleccionadas */}
                    {imagenesSeleccionadas.length > 0 && (
                      <View style={styles.imagesListContainer}>
                        {imagenesSeleccionadas.map((imagen, index) => (
                          <View key={index} style={styles.imagePreviewContainer}>
                            <Image 
                              source={{ uri: imagen.uri }} 
                              style={styles.imagePreview}
                              resizeMode="cover"
                            />
                            <TouchableOpacity 
                              style={styles.removeImageButton}
                              onPress={() => eliminarImagen(index)}
                            >
                              <Ionicons name="close-circle" size={24} color="#C62828" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {/* Botón para agregar más imágenes */}
                    {imagenesSeleccionadas.length < 3 && (
                      <TouchableOpacity 
                        style={[styles.imagePickerButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                        onPress={seleccionarImagen}
                      >
                        <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
                        <Text style={[styles.imagePickerText, { color: theme.colors.text }]}>
                          {imagenesSeleccionadas.length === 0 ? 'Seleccionar imagen' : 'Agregar otra imagen'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                {imagenesSeleccionadas.length === 0 && (
                  <Text style={[styles.imageHelperText, { color: isDarkMode ? '#888' : '#999' }]}>
                    Puedes seleccionar hasta 3 imágenes
                  </Text>
                )}
              </View>

              {/* Dirección con autocompletado */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Dirección *</Text>
                <View style={styles.busquedaContainer}>
                  <View style={styles.busquedaInputWrapper}>
                    <Ionicons name="location-outline" size={20} color={isDarkMode ? '#888' : '#999'} style={styles.searchIcon} />
                    <TextInput
                      style={[styles.inputBusqueda, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                      placeholder="Buscar dirección..."
                      placeholderTextColor={isDarkMode ? '#888' : '#999'}
                      value={busquedaDireccion}
                      onChangeText={(text) => {
                        setBusquedaDireccion(text);
                        // Limpiar coordenadas y dirección si el usuario empieza a escribir algo diferente
                        if (formData.direccion && text !== formData.direccion) {
                          setFormData(prev => ({
                            ...prev,
                            direccion: '',
                            latitud: null,
                            longitud: null,
                          }));
                        }
                      }}
                      onFocus={() => {
                        // No mostrar sugerencias si ya hay una dirección seleccionada
                        if (!formData.latitud && !formData.longitud && sugerenciasDireccion.length > 0) {
                          setMostrarSugerencias(true);
                        }
                      }}
                    />
                    {buscandoDirecciones && (
                      <ActivityIndicator size="small" color={theme.colors.primary} style={styles.searchLoader} />
                    )}
                  </View>

                  {/* Sugerencias de direcciones */}
                  {mostrarSugerencias && sugerenciasDireccion.length > 0 && (
                    <View style={[styles.sugerenciasContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                      <ScrollView style={styles.sugerenciasList} nestedScrollEnabled={true}>
                        {sugerenciasDireccion.map((sugerencia, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[styles.sugerenciaItem, { borderBottomColor: theme.colors.border }]}
                            onPress={() => seleccionarDireccion(sugerencia)}
                          >
                            <Ionicons name="location" size={20} color={theme.colors.primary} />
                            <Text style={[styles.sugerenciaDireccion, { color: theme.colors.text }]}>
                              {sugerencia.direccion}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Teléfono de contacto */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Teléfono de contacto *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="912345678"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  value={formData.contacto}
                  onChangeText={(text) => handleInputChange('contacto', text)}
                  keyboardType="phone-pad"
                  maxLength={9}
                />
              </View>

              {/* Fecha del servicio */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Fecha del servicio *</Text>
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                  onPress={() => setShowDateServicio(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                    {formatearFecha(formData.fechaServicio)}
                  </Text>
                </TouchableOpacity>
                {showDateServicio && (
                  <DateTimePicker
                    value={formData.fechaServicio}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDateServicio(Platform.OS === 'ios');
                      if (selectedDate) {
                        handleInputChange('fechaServicio', selectedDate);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              {/* Botones */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    setModalVisible(false);
                    limpiarFormulario();
                  }}
                  disabled={loading}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.submitButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleCrearSolicitud}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Crear Solicitud</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Espacio al final para scroll */}
              <View style={{ height: 40 }} />
            </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal de Detalle de Solicitud */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDetalleVisible}
        onRequestClose={cerrarDetalleSolicitud}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDetalleContent, { backgroundColor: theme.colors.card }]}>
            {/* Header del modal */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Detalle de Solicitud
              </Text>
              <TouchableOpacity onPress={cerrarDetalleSolicitud}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {solicitudSeleccionada && (
              <ScrollView style={styles.detalleContainer} showsVerticalScrollIndicator={false}>
                {/* Título Principal con Badge de Estado */}
                <View style={styles.detalleTituloContainer}>
                  <View style={styles.detalleTituloHeader}>
                    <Text style={[styles.detalleTitulo, { color: theme.colors.text }]}>
                      {solicitudSeleccionada.SS_Titulo}
                    </Text>
                    <View style={[
                      styles.detalleEstadoBadgeCompact,
                      { 
                        backgroundColor: obtenerColorEstado(solicitudSeleccionada.Id_SolicitudServicioEstado).bg,
                        borderColor: obtenerColorEstado(solicitudSeleccionada.Id_SolicitudServicioEstado).text
                      }
                    ]}>
                      <View style={[
                        styles.estadoDot,
                        { backgroundColor: obtenerColorEstado(solicitudSeleccionada.Id_SolicitudServicioEstado).text }
                      ]} />
                      <Text style={[
                        styles.detalleEstadoTextCompact,
                        { color: obtenerColorEstado(solicitudSeleccionada.Id_SolicitudServicioEstado).text }
                      ]}>
                        {obtenerTextoEstado(solicitudSeleccionada.Id_SolicitudServicioEstado)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detalleCategoriaComuna}>
                    <View style={styles.detalleCategoriaItem}>
                      <Ionicons name="pricetag-outline" size={14} color={isDarkMode ? '#888' : '#666'} />
                      <Text style={[styles.detalleCategoriaTexto, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        {obtenerNombreCategoria(solicitudSeleccionada.Id_Categoria)}
                      </Text>
                    </View>
                    <Text style={[styles.detalleSeparador, { color: isDarkMode ? '#666' : '#CCC' }]}>•</Text>
                    <View style={styles.detalleCategoriaItem}>
                      <Ionicons name="location-outline" size={14} color={isDarkMode ? '#888' : '#666'} />
                      <Text style={[styles.detalleCategoriaTexto, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        {obtenerNombreComuna(solicitudSeleccionada.Id_Comuna)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Divisor */}
                <View style={[styles.detalleDivisor, { backgroundColor: theme.colors.border }]} />

                {/* Imágenes */}
                {cargandoImagenesSolicitud ? (
                  <View style={[styles.detalleSection, { alignItems: 'center', paddingVertical: 20 }]}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={[styles.detalleTexto, { color: isDarkMode ? '#AAA' : '#666', marginTop: 8 }]}>
                      Cargando imágenes...
                    </Text>
                  </View>
                ) : imagenesSolicitud.length > 0 && (
                  <View style={styles.detalleSection}>
                    <View style={styles.detalleSectionHeader}>
                      <Ionicons name="images-outline" size={20} color={theme.colors.primary} />
                      <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                        Imágenes
                      </Text>
                    </View>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.detalleImagesContainer}
                    >
                      {imagenesSolicitud.map((imagen, index) => (
                        <TouchableOpacity
                          key={imagen.Id_Imagen || index}
                          style={styles.detalleImageWrapper}
                          onPress={() => {
                            setImagenCompletaUri(`data:image/png;base64,${imagen.IMG_Imagen}`);
                            setModalImagenCompletaVisible(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{ uri: `data:image/png;base64,${imagen.IMG_Imagen}` }}
                            style={styles.detalleImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Descripción */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Descripción del Servicio
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                    {solicitudSeleccionada.SS_Descripcion}
                  </Text>
                </View>

                {/* Dirección */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="navigate" size={20} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Dirección
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                    {solicitudSeleccionada.SS_Direccion}
                  </Text>
                </View>

                {/* Contacto */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="call" size={20} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Teléfono de Contacto
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                    +56 {solicitudSeleccionada.SS_Contacto?.toString() || 'No disponible'}
                  </Text>
                </View>

                {/* Fechas */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Fechas Importantes
                    </Text>
                  </View>
                  
                  <View style={styles.detalleFechasContainer}>
                    <View style={styles.detalleFechaItem}>
                      <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Fecha de Creación:
                      </Text>
                      <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                        {formatearFechaISO(solicitudSeleccionada.SS_FechaCreacion)}
                      </Text>
                    </View>

                    <View style={styles.detalleFechaItem}>
                      <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Fecha del Servicio:
                      </Text>
                      <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                        {formatearFechaISO(solicitudSeleccionada.SS_FechaServicio)}
                      </Text>
                    </View>

                    {solicitudSeleccionada.SS_FechaLimiteOF && (
                      <View style={styles.detalleFechaItem}>
                        <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                          Fecha Límite para Ofertas:
                        </Text>
                        <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                          {formatearFechaISO(solicitudSeleccionada.SS_FechaLimiteOF)}
                        </Text>
                      </View>
                    )}

                    {solicitudSeleccionada.SS_FechaExpira && (
                      <View style={styles.detalleFechaItem}>
                        <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                          Fecha de Expiración:
                        </Text>
                        <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                          {formatearFechaISO(solicitudSeleccionada.SS_FechaExpira)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Espacio para los botones fijos */}
                <View style={{ height: 100 }} />
              </ScrollView>
            )}

            {/* Botones de acción fijos */}
            <View style={[styles.detalleFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={[
                  styles.detalleButton, 
                  styles.verOfertasButton, 
                  { 
                    backgroundColor: noPermiteInteraccion(solicitudSeleccionada) ? '#CCC' : theme.colors.primary, 
                    flex: 1, 
                    marginRight: 8,
                    opacity: noPermiteInteraccion(solicitudSeleccionada) ? 0.6 : 1
                  }
                ]}
                onPress={() => {
                  if (!noPermiteInteraccion(solicitudSeleccionada)) {
                    abrirModalOfertas();
                  }
                }}
                disabled={noPermiteInteraccion(solicitudSeleccionada)}
              >
                <Ionicons name="pricetag" size={20} color="#FFF" />
                <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                  Ver Ofertas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.detalleButton, 
                  styles.cancelarButton, 
                  { 
                    backgroundColor: noPermiteInteraccion(solicitudSeleccionada) ? '#F5F5F5' : '#FFEBEE', 
                    flex: 1, 
                    marginRight: 8,
                    opacity: noPermiteInteraccion(solicitudSeleccionada) || cancelandoSolicitud === solicitudSeleccionada?.Id_SolicitudServicio ? 0.5 : 1
                  }
                ]}
                onPress={() => {
                  if (!noPermiteInteraccion(solicitudSeleccionada)) {
                    handleCancelarSolicitud(solicitudSeleccionada);
                  }
                }}
                disabled={noPermiteInteraccion(solicitudSeleccionada) || cancelandoSolicitud === solicitudSeleccionada?.Id_SolicitudServicio}
              >
                {cancelandoSolicitud === solicitudSeleccionada?.Id_SolicitudServicio ? (
                  <ActivityIndicator size="small" color="#C62828" />
                ) : (
                  <>
                    <Ionicons 
                      name="close-circle" 
                      size={20} 
                      color={noPermiteInteraccion(solicitudSeleccionada) ? '#999' : '#C62828'} 
                    />
                    <Text style={[
                      styles.detalleButtonText, 
                      { color: noPermiteInteraccion(solicitudSeleccionada) ? '#999' : '#C62828' }
                    ]}>
                      {noPermiteInteraccion(solicitudSeleccionada) ? obtenerTextoEstado(solicitudSeleccionada?.Id_SolicitudServicioEstado) : 'Cancelar'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.detalleButton, 
                  styles.renovarButton, 
                  { 
                    backgroundColor: noPermiteInteraccion(solicitudSeleccionada) ? '#F5F5F5' : '#E8F5E9', 
                    flex: 1,
                    opacity: noPermiteInteraccion(solicitudSeleccionada) ? 0.6 : 1
                  }
                ]}
                onPress={() => {
                  if (!noPermiteInteraccion(solicitudSeleccionada)) {
                    // TODO: Implementar funcionalidad de renovar
                    Alert.alert('Renovar Solicitud', 'Esta funcionalidad se implementará próximamente');
                  }
                }}
                disabled={noPermiteInteraccion(solicitudSeleccionada)}
              >
                <Ionicons 
                  name="refresh-circle" 
                  size={20} 
                  color={noPermiteInteraccion(solicitudSeleccionada) ? '#999' : '#2E7D32'} 
                />
                <Text style={[
                  styles.detalleButtonText, 
                  { color: noPermiteInteraccion(solicitudSeleccionada) ? '#999' : '#2E7D32' }
                ]}>
                  Renovar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Ofertas de la Solicitud */}
      <OfertasSolicitudModal
        visible={modalOfertasVisible}
        solicitud={solicitudSeleccionada}
        onClose={cerrarModalOfertas}
        onOfertaAceptada={actualizarSolicitudesDespuesAceptar}
      />

      {/* Modal de Imagen Completa */}
      <Modal
        visible={modalImagenCompletaVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalImagenCompletaVisible(false)}
      >
        <View style={styles.modalImagenCompletaOverlay}>
          <TouchableOpacity
            style={styles.modalImagenCompletaCloseButton}
            onPress={() => setModalImagenCompletaVisible(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {imagenCompletaUri && (
            <Image
              source={{ uri: imagenCompletaUri }}
              style={styles.modalImagenCompleta}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
