import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Modal, ScrollView, TouchableOpacity, Alert, Linking, TextInput, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/serviciosStyles';
import { listarServicios, cargarCatalogos, cargarEstadosServicios, consultarServicioPorId, cancelarServicio, insertarComprobantePago, consultarComprobantePago, consultarImagenesComprobante, confirmarComprobantePago, consultarHistorialServicio, insertarCalificacionServicio, consultarCalificacionServicio } from '../Funciones/solicitudes';
import { obtenerDatosUsuario } from '../API/storage';
import { consultarUsuarioPorId } from '../Funciones/usuario';
import PerfilUsuarioModal from '../Componentes/Ofertas/PerfilUsuarioModal';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export default function ServiciosScreen() {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Estados para servicios
  const [servicios, setServicios] = useState({ cliente: [], proveedor: [] });
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  
  // Estado del filtro (1 = por defecto, o el Id_ServicioEstado específico)
  const [filtroEstado, setFiltroEstado] = useState(1);
  const [mostrarSelectorEstado, setMostrarSelectorEstado] = useState(false);

  // Modo de visualización (1 = Cliente, 2 = Proveedor)
  const [modo, setModo] = useState(1);

  // Estados del modal de detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [perfilParticipante, setPerfilParticipante] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  // Estados para modal de perfil
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [idUsuarioSeleccionado, setIdUsuarioSeleccionado] = useState(null);

  // Estados para modal de cancelación
  const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [cancelando, setCancelando] = useState(false);

  // Estados para modal de comprobante de pago
  const [modalComprobanteVisible, setModalComprobanteVisible] = useState(false);
  const [imagenesComprobante, setImagenesComprobante] = useState([]);
  const [comentarioComprobante, setComentarioComprobante] = useState('');
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const [comprobantePago, setComprobantePago] = useState(null);
  const [imagenesComprobanteCargadas, setImagenesComprobanteCargadas] = useState([]);
  const [cargandoComprobante, setCargandoComprobante] = useState(false);

  // Estados para modal de historial
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [historialServicio, setHistorialServicio] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [imagenesComprobanteHistorial, setImagenesComprobanteHistorial] = useState([]);
  const [cargandoImagenesHistorial, setCargandoImagenesHistorial] = useState(false);
  const [indiceImagenActual, setIndiceImagenActual] = useState(0);

  // Modal para ver imagen de comprobante en grande
  const [modalImagenVisible, setModalImagenVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const scrollViewRef = useRef(null);

  // Estados para calificaciones
  const [modalCalificacionVisible, setModalCalificacionVisible] = useState(false);
  const [puntuacionSeleccionada, setPuntuacionSeleccionada] = useState(0);
  const [comentarioCalificacion, setComentarioCalificacion] = useState('');
  const [calificando, setCalificando] = useState(false);
  const [calificacionesServicio, setCalificacionesServicio] = useState([]);
  const [yaCalifico, setYaCalifico] = useState(false);
  const [idUsuarioACalificar, setIdUsuarioACalificar] = useState(null);
  const [cargandoCalificaciones, setCargandoCalificaciones] = useState(false);

  // Estados para catálogos
  const [categorias, setCategorias] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [estadosServicios, setEstadosServicios] = useState([]);

  // ID del usuario actual
  const [idUsuarioActual, setIdUsuarioActual] = useState(null);

  // Cargar servicios y catálogos al montar el componente (solo una vez)
  useEffect(() => {
    cargarUsuarioActual();
    cargarMisServicios();
    cargarDatosCatalogos();
    cargarEstados();
  }, []);

  // Actualizar datos cada vez que la pantalla recibe foco
  useFocusEffect(
    React.useCallback(() => {
      cargarEstados();
      cargarMisServicios();
    }, [])
  );

  // Actualizar servicios filtrados cuando cambia el modo o el filtro
  useEffect(() => {
    // Solo aplicar filtro si los servicios ya están cargados
    if (servicios.cliente.length > 0 || servicios.proveedor.length > 0 || !cargandoServicios) {
      const serviciosPorModo = modo === 1 
        ? (servicios.cliente || [])
        : (servicios.proveedor || []);
      aplicarFiltro(serviciosPorModo, filtroEstado);
    }
  }, [modo, filtroEstado, servicios, cargandoServicios]);

  // Sincronizar scroll cuando cambia el índice manualmente
  useEffect(() => {
    if (scrollViewRef.current && imagenesComprobanteHistorial.length > 0) {
      scrollViewRef.current.scrollTo({
        x: indiceImagenActual * Dimensions.get('window').width,
        animated: true
      });
    }
  }, [indiceImagenActual, imagenesComprobanteHistorial.length]);

  const cargarUsuarioActual = async () => {
    try {
      const usuario = await obtenerDatosUsuario();
      if (usuario && usuario.UsuarioId) {
        setIdUsuarioActual(usuario.UsuarioId);
      }
    } catch (error) {
      console.error('Error al cargar usuario actual:', error);
    }
  };

  const cargarEstados = async () => {
    try {
      const estados = await cargarEstadosServicios();
      setEstadosServicios(estados);
    } catch (error) {
      console.error('Error cargando estados de servicios:', error);
    }
  };

  const cargarDatosCatalogos = async () => {
    try {
      const { categorias, comunas } = await cargarCatalogos();
      setCategorias(categorias);
      setComunas(comunas);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const cargarMisServicios = async () => {
    try {
      setCargandoServicios(true);
      const { serviciosCliente, serviciosProveedor } = await listarServicios();
      
      // Guardar ambos arrays por separado para poder filtrar por modo
      setServicios({
        cliente: serviciosCliente || [],
        proveedor: serviciosProveedor || []
      });
      
      // El useEffect se encargará de aplicar el filtro cuando cambien los servicios
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setCargandoServicios(false);
      setRefrescando(false);
    }
  };

  const aplicarFiltro = (serviciosData, idEstado) => {
    if (idEstado === null) {
      setServiciosFiltrados(serviciosData || []);
    } else {
      const filtradas = (serviciosData || []).filter(servicio => servicio.Id_ServicioEstado === idEstado);
      setServiciosFiltrados(filtradas);
    }
  };

  const cambiarFiltro = (estado) => {
    setFiltroEstado(estado);
    // Obtener servicios según el modo actual
    const serviciosPorModo = modo === 1 
      ? (servicios.cliente || [])
      : (servicios.proveedor || []);
    aplicarFiltro(serviciosPorModo, estado);
  };

  // Obtener información del estado por ID
  const obtenerEstadoPorId = (idEstado) => {
    return estadosServicios.find(estado => estado.Id_ServicioEstado === idEstado);
  };

  const obtenerTextoEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    return estado ? estado.SEE_Nombre : 'Desconocido';
  };

  const obtenerColorEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    const nombreEstado = estado ? estado.SEE_Nombre : '';
    
    // Colores basados en el nombre del estado
    switch(nombreEstado?.toUpperCase()) {
      case 'COMPLETADO': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'EN PROGRESO': return { bg: '#FFF3E0', text: '#F57C00' };
      case 'CANCELADO': return { bg: '#FFEBEE', text: '#C62828' };
      case 'PENDIENTE': return { bg: '#E3F2FD', text: '#1976D2' };
      default: return { bg: '#F5F5F5', text: '#757575' };
    }
  };

  const obtenerIconoEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    const nombreEstado = estado ? estado.SEE_Nombre : '';
    
    switch(nombreEstado?.toUpperCase()) {
      case 'COMPLETADO': return 'checkmark-circle';
      case 'EN PROGRESO': return 'time';
      case 'CANCELADO': return 'close-circle';
      case 'PENDIENTE': return 'hourglass';
      default: return 'help-circle';
    }
  };

  // Verificar si un servicio permite interacción basado en SEE_Modifica
  const noPermiteInteraccion = (servicio) => {
    const estado = obtenerEstadoPorId(servicio?.Id_ServicioEstado);
    // Si el estado tiene SEE_Modifica = false, no permite interacción
    return estado ? !estado.SEE_Modifica : true;
  };

  const refrescarServicios = async () => {
    setRefrescando(true);
    // Recargar estados y servicios
    await Promise.all([
      cargarEstados(),
      cargarMisServicios()
    ]);
  };

  const abrirDetalleServicio = async (servicio) => {
    try {
      // Cargar datos completos del servicio desde el endpoint
      const servicioCompleto = await consultarServicioPorId(servicio.Id_Servicio);
      
      if (servicioCompleto) {
        // Combinar los datos básicos de la card con los datos completos
        const servicioFinal = {
          ...servicio,
          ...servicioCompleto
        };
        setServicioSeleccionado(servicioFinal);
        setModalDetalleVisible(true);
        
        // Cargar perfil del otro participante automáticamente
        const idParticipante = modo === 1 
          ? servicioFinal.Id_Usuario_Proveedor 
          : servicioFinal.Id_Usuario_Cliente;
        
        if (idParticipante && idParticipante !== idUsuarioActual) {
          cargarPerfilParticipante(idParticipante);
        }

        // Cargar comprobante de pago si existe
        await cargarComprobantePago(servicioFinal.Id_Servicio);
        
        // Cargar calificaciones si el servicio está completado
        if (servicioFinal.Id_ServicioEstado === 8 && idUsuarioActual) {
          await cargarCalificaciones(servicioFinal.Id_Servicio, idUsuarioActual);
        }
      } else {
        Alert.alert('Error', 'No se pudieron cargar los detalles del servicio');
      }
    } catch (error) {
      console.error('Error al cargar detalles del servicio:', error);
      Alert.alert('Error', 'Ocurrió un error al cargar los detalles del servicio');
    }
  };

  const cargarPerfilParticipante = async (idUsuario) => {
    try {
      setCargandoPerfil(true);
      const datosUsuario = await consultarUsuarioPorId(idUsuario);
      setPerfilParticipante(datosUsuario);
    } catch (error) {
      console.error('Error al cargar perfil del participante:', error);
      setPerfilParticipante(null);
    } finally {
      setCargandoPerfil(false);
    }
  };

  const handleContactar = (telefono) => {
    if (!telefono) {
      Alert.alert('Información', 'El usuario no tiene número de teléfono registrado');
      return;
    }

    Alert.alert(
      'Contactar',
      `Teléfono: ${telefono}`,
      [
        {
          text: 'Llamar',
          onPress: () => {
            Linking.openURL(`tel:${telefono}`);
          }
        },
        {
          text: 'Mensaje',
          onPress: () => {
            Linking.openURL(`sms:${telefono}`);
          }
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const cerrarDetalleServicio = () => {
    setModalDetalleVisible(false);
    setServicioSeleccionado(null);
    setPerfilParticipante(null);
    setComprobantePago(null);
    setImagenesComprobanteCargadas([]);
    setHistorialServicio([]);
  };

  // Función para abrir modal de historial
  const abrirModalHistorial = async () => {
    if (!servicioSeleccionado) return;
    
    try {
      setCargandoHistorial(true);
      setModalHistorialVisible(true);
      const historial = await consultarHistorialServicio(servicioSeleccionado.Id_Servicio);
      setHistorialServicio(historial);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      Alert.alert('Error', 'No se pudo cargar el historial del servicio');
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Función para cerrar modal de historial
  const cerrarModalHistorial = () => {
    setModalHistorialVisible(false);
    setHistorialServicio([]);
    setImagenesComprobanteHistorial([]);
    setIndiceImagenActual(0);
  };

  // Función para cargar imágenes del comprobante del historial
  const cargarImagenesComprobanteHistorial = async (idComprobantePago) => {
    try {
      setCargandoImagenesHistorial(true);
      const imagenes = await consultarImagenesComprobante(idComprobantePago);
      if (imagenes && imagenes.length > 0) {
        setImagenesComprobanteHistorial(imagenes);
        setIndiceImagenActual(0);
        setImagenSeleccionada(null); // Limpiar imagen única si existe
        setModalImagenVisible(true);
      } else {
        Alert.alert('Información', 'No hay imágenes disponibles para este comprobante');
      }
    } catch (error) {
      console.error('Error al cargar imágenes del comprobante:', error);
      Alert.alert('Error', 'No se pudieron cargar las imágenes del comprobante');
    } finally {
      setCargandoImagenesHistorial(false);
    }
  };

  const abrirModalCancelar = () => {
    setMotivoCancelacion('');
    setModalCancelarVisible(true);
  };

  const cerrarModalCancelar = () => {
    setModalCancelarVisible(false);
    setMotivoCancelacion('');
  };

  const handleCancelarServicio = async () => {
    if (!motivoCancelacion.trim()) {
      Alert.alert('Error', 'Por favor, ingresa un motivo para cancelar el servicio');
      return;
    }

    if (!servicioSeleccionado || !idUsuarioActual) {
      Alert.alert('Error', 'No se pudo obtener la información necesaria');
      return;
    }

    try {
      setCancelando(true);
      const resultado = await cancelarServicio(
        servicioSeleccionado.Id_Servicio,
        idUsuarioActual,
        motivoCancelacion
      );

      if (resultado.exito) {
        // Recargar servicios y estados
        await Promise.all([
          cargarEstados(),
          cargarMisServicios()
        ]);
        
        // Cerrar modales
        cerrarModalCancelar();
        cerrarDetalleServicio();
        
        Alert.alert('Éxito', 'El servicio ha sido cancelado correctamente.');
      }
    } catch (error) {
      console.error('Error al cancelar servicio:', error);
      Alert.alert('Error', 'No se pudo cancelar el servicio. Por favor, intenta nuevamente.');
    } finally {
      setCancelando(false);
    }
  };

  const formatearFecha = (fechaISO) => {
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatearMonto = (monto) => {
    if (!monto && monto !== 0) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  // Función para comprimir imagen (similar a solicitudes.jsx)
  const comprimirImagen = async (uri) => {
    const maxSizeKB = 100;
    const anchoInicial = 1200;
    
    let resultado = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: anchoInicial } }],
      { 
        compress: 0.5, 
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true
      }
    );

    let base64Size = resultado.base64 ? (resultado.base64.length * 3) / 4 : 0;
    let sizeKB = base64Size / 1024;

    if (sizeKB <= maxSizeKB) {
      return resultado;
    }

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

  // Función para seleccionar imágenes del comprobante
  const seleccionarImagenComprobante = async () => {
    if (imagenesComprobante.length >= 5) {
      Alert.alert('Límite alcanzado', 'Solo puedes seleccionar hasta 5 imágenes');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a las imágenes');
      return;
    }

    const imagenesDisponibles = 5 - imagenesComprobante.length;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: imagenesDisponibles > 1,
      quality: 1,
      selectionLimit: imagenesDisponibles,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      const nuevasImagenes = [];
      
      for (const imagenOriginal of resultado.assets) {
        try {
          const imagenComprimida = await comprimirImagen(imagenOriginal.uri);
          
          if (!imagenComprimida.base64) {
            continue;
          }
          
          const nombreArchivo = `comprobante_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
          
          nuevasImagenes.push({
            uri: imagenComprimida.uri,
            base64: imagenComprimida.base64,
            nombre: nombreArchivo,
            IMG_Archivo: nombreArchivo,
            IMG_Base64: imagenComprimida.base64
          });
        } catch (error) {
          console.error('Error procesando imagen:', error);
        }
      }
      
      setImagenesComprobante(prev => [...prev, ...nuevasImagenes]);
    }
  };

  // Función para eliminar imagen del comprobante
  const eliminarImagenComprobante = (index) => {
    setImagenesComprobante(prev => prev.filter((_, i) => i !== index));
  };

  // Función para abrir modal de comprobante
  const abrirModalComprobante = () => {
    setImagenesComprobante([]);
    setComentarioComprobante('');
    setModalComprobanteVisible(true);
  };

  // Función para cerrar modal de comprobante
  const cerrarModalComprobante = () => {
    setModalComprobanteVisible(false);
    setImagenesComprobante([]);
    setComentarioComprobante('');
  };

  // Función para subir comprobante
  const handleSubirComprobante = async () => {
    if (imagenesComprobante.length === 0) {
      Alert.alert('Error', 'Debes subir al menos una imagen del comprobante');
      return;
    }

    if (!servicioSeleccionado || !idUsuarioActual) {
      Alert.alert('Error', 'No se pudo obtener la información necesaria');
      return;
    }

    try {
      setSubiendoComprobante(true);
      const resultado = await insertarComprobantePago(
        servicioSeleccionado.Id_Servicio,
        idUsuarioActual,
        comentarioComprobante,
        imagenesComprobante
      );

      if (resultado.exito) {
        await Promise.all([
          cargarEstados(),
          cargarMisServicios()
        ]);
        
        cerrarModalComprobante();
        cerrarDetalleServicio();
        
        Alert.alert('Éxito', 'El comprobante de pago ha sido subido correctamente. El proveedor será notificado.');
      }
    } catch (error) {
      console.error('Error al subir comprobante:', error);
      Alert.alert('Error', 'No se pudo subir el comprobante. Por favor, intenta nuevamente.');
    } finally {
      setSubiendoComprobante(false);
    }
  };

  // Función para cargar comprobante cuando se abre el detalle
  const cargarComprobantePago = async (idServicio) => {
    try {
      setCargandoComprobante(true);
      const comprobante = await consultarComprobantePago(idServicio);
      setComprobantePago(comprobante);
      
      if (comprobante && comprobante.Id_ComprobantePago) {
        const imagenes = await consultarImagenesComprobante(comprobante.Id_ComprobantePago);
        setImagenesComprobanteCargadas(imagenes);
      } else {
        setImagenesComprobanteCargadas([]);
      }
    } catch (error) {
      console.error('Error al cargar comprobante:', error);
      setComprobantePago(null);
      setImagenesComprobanteCargadas([]);
    } finally {
      setCargandoComprobante(false);
    }
  };

  // Función para confirmar cierre del servicio (proveedor)
  const handleConfirmarCierre = async () => {
    if (!servicioSeleccionado || !idUsuarioActual) {
      Alert.alert('Error', 'No se pudo obtener la información necesaria');
      return;
    }

    Alert.alert(
      'Confirmar Cierre',
      '¿Estás seguro de que deseas confirmar el cierre del servicio? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setSubiendoComprobante(true);
              const resultado = await confirmarComprobantePago(
                servicioSeleccionado.Id_Servicio,
                idUsuarioActual
              );

              if (resultado.exito) {
                await Promise.all([
                  cargarEstados(),
                  cargarMisServicios()
                ]);
                
                cerrarDetalleServicio();
                
                Alert.alert('Éxito', 'El servicio ha sido cerrado correctamente.');
              }
            } catch (error) {
              console.error('Error al confirmar cierre:', error);
              Alert.alert('Error', 'No se pudo confirmar el cierre. Por favor, intenta nuevamente.');
            } finally {
              setSubiendoComprobante(false);
            }
          }
        }
      ]
    );
  };

  // Función para cargar calificaciones
  const cargarCalificaciones = async (idServicio, idUsuario) => {
    try {
      setCargandoCalificaciones(true);
      const resultado = await consultarCalificacionServicio(idServicio, idUsuario);
      setCalificacionesServicio(resultado.calificaciones || []);
      setYaCalifico(resultado.yaCalifico || false);
      setIdUsuarioACalificar(resultado.idUsuarioACalificar || null);
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
      setCalificacionesServicio([]);
      setYaCalifico(false);
      setIdUsuarioACalificar(null);
    } finally {
      setCargandoCalificaciones(false);
    }
  };

  // Función para abrir modal de calificación
  const abrirModalCalificacion = () => {
    setPuntuacionSeleccionada(0);
    setComentarioCalificacion('');
    setModalCalificacionVisible(true);
  };

  // Función para cerrar modal de calificación
  const cerrarModalCalificacion = () => {
    setModalCalificacionVisible(false);
    setPuntuacionSeleccionada(0);
    setComentarioCalificacion('');
  };

  // Función para enviar calificación
  const handleEnviarCalificacion = async () => {
    if (puntuacionSeleccionada === 0) {
      Alert.alert('Error', 'Debes seleccionar una puntuación');
      return;
    }

    if (!servicioSeleccionado || !idUsuarioActual) {
      Alert.alert('Error', 'No se pudo obtener la información necesaria');
      return;
    }

    try {
      setCalificando(true);
      const resultado = await insertarCalificacionServicio(
        servicioSeleccionado.Id_Servicio,
        idUsuarioActual,
        puntuacionSeleccionada,
        comentarioCalificacion
      );

      if (resultado.exito) {
        // Recargar calificaciones
        await cargarCalificaciones(servicioSeleccionado.Id_Servicio, idUsuarioActual);
        
        cerrarModalCalificacion();
        Alert.alert('Éxito', 'Tu calificación ha sido enviada correctamente.');
      } else {
        Alert.alert('Error', 'No se pudo enviar la calificación. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar la calificación. Por favor, intenta nuevamente.');
    } finally {
      setCalificando(false);
    }
  };

  const formatearFechaISO = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(cat => cat.Id_Categoria === idCategoria);
    return categoria ? categoria.CAT_Nombre : 'Sin categoría';
  };

  const obtenerNombreComuna = (idComuna) => {
    const comuna = comunas.find(com => com.Id_Comuna === idComuna);
    return comuna ? comuna.COM_Nombre : 'Sin comuna';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Ionicons name="construct" size={24} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mis Servicios</Text>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={[styles.content, { 
        backgroundColor: theme.colors.background,
        paddingBottom: 0,
        marginBottom: -(63 + insets.bottom), // Compensar el espacio del tab bar
      }]}>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>
          Gestiona tus servicios contratados
        </Text>
        
        {/* Selector de modo (Cliente/Proveedor) */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
              backgroundColor: modo === 1 ? theme.colors.primary : theme.colors.card,
              borderWidth: 1,
              borderColor: modo === 1 ? theme.colors.primary : theme.colors.border,
            }}
            onPress={() => {
              setModo(1);
              setFiltroEstado(1);
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontWeight: '600',
              color: modo === 1 ? '#FFF' : theme.colors.text,
            }}>
              Como Cliente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 10,
              backgroundColor: modo === 2 ? theme.colors.primary : theme.colors.card,
              borderWidth: 1,
              borderColor: modo === 2 ? theme.colors.primary : theme.colors.border,
            }}
            onPress={() => {
              setModo(2);
              setFiltroEstado(1);
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontWeight: '600',
              color: modo === 2 ? '#FFF' : theme.colors.text,
            }}>
              Como Proveedor
            </Text>
          </TouchableOpacity>
        </View>
        
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
                data={[{ Id_ServicioEstado: null, SEE_Nombre: 'Todos' }, ...estadosServicios]}
                keyExtractor={(item) => item.Id_ServicioEstado?.toString() || 'todos'}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.estadoSelectorItem,
                      {
                        backgroundColor: filtroEstado === item.Id_ServicioEstado 
                          ? theme.colors.primary + '15' 
                          : 'transparent',
                        borderBottomColor: theme.colors.border,
                      }
                    ]}
                    onPress={() => {
                      cambiarFiltro(item.Id_ServicioEstado);
                      setMostrarSelectorEstado(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.estadoSelectorText,
                        {
                          color: filtroEstado === item.Id_ServicioEstado 
                            ? theme.colors.primary 
                            : theme.colors.text,
                          fontWeight: filtroEstado === item.Id_ServicioEstado ? '600' : '400',
                        }
                      ]}
                    >
                      {item.SEE_Nombre}
                    </Text>
                    {filtroEstado === item.Id_ServicioEstado && (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.estadoSelectorList}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Lista de servicios */}
        {cargandoServicios ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Cargando servicios...
            </Text>
          </View>
        ) : serviciosFiltrados.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={refrescarServicios}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          >
            <Ionicons name="construct-outline" size={64} color={isDarkMode ? '#555' : '#CCC'} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999' }]}>
              {filtroEstado === null 
                ? `No tienes servicios ${modo === 1 ? 'contratados' : 'realizados'}`
                : `No hay servicios ${obtenerTextoEstado(filtroEstado).toLowerCase()}s`
              }
            </Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#AAA' }]}>
              {filtroEstado === null 
                ? modo === 1 
                  ? 'Contrata servicios desde el mapa'
                  : 'Realiza ofertas para obtener servicios'
                : 'Intenta con otro filtro'
              }
            </Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#AAA', marginTop: 8, fontSize: 12 }]}>
              Arrastra hacia abajo para actualizar
            </Text>
          </ScrollView>
        ) : (
          <FlatList
            data={serviciosFiltrados}
            keyExtractor={(item) => item.Id_Servicio?.toString() || Math.random().toString()}
            renderItem={({ item }) => {
              const estadoColors = obtenerColorEstado(item.Id_ServicioEstado);
              const estadoTexto = obtenerTextoEstado(item.Id_ServicioEstado);
              
              return (
              <View style={[styles.servicioCard, { 
                backgroundColor: theme.colors.card, 
                borderColor: theme.colors.border 
              }]}>
                {/* Header de la tarjeta */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                      {item.SS_Titulo || `Servicio #${item.Id_Servicio}`}
                    </Text>
                  </View>
                  {/* Badge de estado */}
                  <View style={[
                    styles.estadoBadge,
                    { 
                      backgroundColor: estadoColors.bg,
                      borderColor: estadoColors.text,
                    }
                  ]}>
                    <View style={[
                      styles.estadoDot,
                      { backgroundColor: estadoColors.text }
                    ]} />
                    <Text style={[
                      styles.estadoText,
                      { color: estadoColors.text }
                    ]}>
                      {estadoTexto}
                    </Text>
                  </View>
                </View>

                {/* Monto */}
                <View style={[styles.montoContainer, { 
                  backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                  borderLeftColor: theme.colors.primary 
                }]}>
                  <Text style={[styles.montoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                    Monto acordado
                  </Text>
                  <Text style={[styles.montoValue, { color: theme.colors.primary }]}>
                    {formatearMonto(item.OF_Monto)}
                  </Text>
                </View>


                {/* Footer con fecha - Solo mostrar cuando el estado es 1 (creado) */}
                {item.Id_ServicioEstado === 1 && (
                  <View style={styles.cardFooter}>
                    <Ionicons name="calendar-outline" size={14} color={isDarkMode ? '#888' : '#999'} />
                    <Text style={[styles.fechaText, { color: isDarkMode ? '#888' : '#999' }]}>
                      Iniciado el {formatearFecha(item.SE_FechaModifica)}
                    </Text>
                  </View>
                )}

                {/* Botón de acción */}
                <View style={styles.cardActions}>
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
                        abrirDetalleServicio(item);
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
              );
            }}
            contentContainerStyle={[styles.serviciosList, { paddingBottom: 63 + insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={refrescarServicios}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>

      {/* Modal de Detalle de Servicio */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDetalleVisible}
        onRequestClose={cerrarDetalleServicio}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDetalleContent, { backgroundColor: theme.colors.card }]}>
            {/* Header del modal */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Detalle de Servicio
              </Text>
              <TouchableOpacity onPress={cerrarDetalleServicio}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {servicioSeleccionado && (
              <ScrollView style={styles.detalleContainer} showsVerticalScrollIndicator={false}>
                {/* Título Principal con Monto */}
                <View style={styles.detalleTituloContainer}>
                  <View style={styles.detalleTituloHeader}>
                    <Text style={[styles.detalleTitulo, { color: theme.colors.text }]}>
                      {servicioSeleccionado.SS_Titulo}
                    </Text>
                  </View>
                  <View style={[styles.montoContainerDetalle, { 
                    backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                    borderLeftColor: theme.colors.primary 
                  }]}>
                    <Text style={[styles.montoLabelDetalle, { color: isDarkMode ? '#AAA' : '#666' }]}>
                      Monto Acordado
                    </Text>
                    <Text style={[styles.montoValueDetalle, { color: theme.colors.primary }]}>
                      {formatearMonto(servicioSeleccionado.OF_Monto)}
                    </Text>
                  </View>
                  <View style={styles.detalleCategoriaComuna}>
                    <View style={[styles.detalleCategoriaItem, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' 
                    }]}>
                      <Ionicons name="pricetag" size={14} color={theme.colors.primary} />
                      <Text style={[styles.detalleCategoriaTexto, { color: theme.colors.text }]}>
                        {obtenerNombreCategoria(servicioSeleccionado.Id_Categoria)}
                      </Text>
                    </View>
                    <Text style={[styles.detalleSeparador, { color: isDarkMode ? '#666' : '#CCC' }]}>•</Text>
                    <View style={[styles.detalleCategoriaItem, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' 
                    }]}>
                      <Ionicons name="location" size={14} color={theme.colors.primary} />
                      <Text style={[styles.detalleCategoriaTexto, { color: theme.colors.text }]}>
                        {obtenerNombreComuna(servicioSeleccionado.Id_Comuna)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Divisor */}
                <View style={[styles.detalleDivisor, { backgroundColor: theme.colors.border }]} />

                {/* Información del otro participante */}
                {(modo === 1 && servicioSeleccionado.Id_Usuario_Proveedor && servicioSeleccionado.Id_Usuario_Proveedor !== idUsuarioActual) ||
                 (modo === 2 && servicioSeleccionado.Id_Usuario_Cliente && servicioSeleccionado.Id_Usuario_Cliente !== idUsuarioActual) ? (
                  <View style={styles.detalleSection}>
                    <View style={styles.detalleSectionHeader}>
                      <Ionicons name="person" size={22} color={theme.colors.primary} />
                      <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                        {modo === 1 ? 'Proveedor' : 'Cliente'}
                      </Text>
                    </View>
                    
                    {cargandoPerfil ? (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={[styles.detalleTexto, { color: theme.colors.text, marginTop: 10 }]}>
                          Cargando perfil...
                        </Text>
                      </View>
                    ) : perfilParticipante ? (
                      <View style={[styles.detalleParticipanteCard, { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: theme.colors.border,
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 16
                      }]}>
                        {/* Nombre y Profesión */}
                        <View style={{ marginBottom: 16 }}>
                          <Text style={[styles.detalleParticipanteNombre, { 
                            color: theme.colors.text,
                            fontSize: 18,
                            fontWeight: '600',
                            marginBottom: 4
                          }]}>
                            {perfilParticipante.Nombre} {perfilParticipante.Apellido}
                          </Text>
                          {perfilParticipante.Profesion && (
                            <View style={{ 
                              flexDirection: 'row', 
                              alignItems: 'center',
                              marginTop: 4
                            }}>
                              <Ionicons name="briefcase" size={16} color={theme.colors.primary} />
                              <Text style={[styles.detalleParticipanteTexto, { 
                                color: theme.colors.text,
                                marginLeft: 6
                              }]}>
                                {perfilParticipante.Profesion}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Calificaciones */}
                        <View style={{ 
                          flexDirection: 'row', 
                          gap: 12,
                          marginBottom: perfilParticipante.Biografia ? 16 : 0
                        }}>
                          {perfilParticipante.CalificaUsuario !== null && perfilParticipante.CalificaUsuario !== undefined && (
                            <View style={{ 
                              flex: 1,
                              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)',
                              padding: 12,
                              borderRadius: 8,
                              alignItems: 'center'
                            }}>
                              <Ionicons name="person" size={20} color="#4CAF50" />
                              <Text style={{ 
                                color: isDarkMode ? '#AAA' : '#666',
                                fontSize: 12,
                                marginTop: 4
                              }}>
                                Como Usuario
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Ionicons name="star" size={16} color="#FFB300" />
                                <Text style={{ 
                                  color: '#FFB300',
                                  fontSize: 16,
                                  fontWeight: '600',
                                  marginLeft: 4
                                }}>
                                  {Math.round(perfilParticipante.CalificaUsuario)}
                                </Text>
                              </View>
                            </View>
                          )}
                          
                          {perfilParticipante.CalificaProveedor !== null && perfilParticipante.CalificaProveedor !== undefined && (
                            <View style={{ 
                              flex: 1,
                              backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.1)',
                              padding: 12,
                              borderRadius: 8,
                              alignItems: 'center'
                            }}>
                              <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
                              <Text style={{ 
                                color: isDarkMode ? '#AAA' : '#666',
                                fontSize: 12,
                                marginTop: 4
                              }}>
                                Como Proveedor
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Ionicons name="star" size={16} color="#FFB300" />
                                <Text style={{ 
                                  color: '#FFB300',
                                  fontSize: 16,
                                  fontWeight: '600',
                                  marginLeft: 4
                                }}>
                                  {Math.round(perfilParticipante.CalificaProveedor)}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>

                        {/* Biografía */}
                        {perfilParticipante.Biografia && (
                          <View style={{ 
                            marginTop: 16,
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderTopColor: theme.colors.border
                          }}>
                            <Text style={{ 
                              color: isDarkMode ? '#AAA' : '#666',
                              fontSize: 12,
                              marginBottom: 8,
                              fontWeight: '600'
                            }}>
                              Sobre {perfilParticipante.Nombre?.split(' ')[0]}
                            </Text>
                            <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                              {perfilParticipante.Biografia}
                            </Text>
                          </View>
                        )}

                        {/* Botón Contactar (solo si el estado no es COMPLETADO) */}
                        {perfilParticipante.Telefono && servicioSeleccionado && servicioSeleccionado.Id_ServicioEstado !== 8 && (
                          <View style={{ 
                            marginTop: 16,
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderTopColor: theme.colors.border
                          }}>
                            <TouchableOpacity
                              style={[styles.detalleButton, { 
                                backgroundColor: theme.colors.primary,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8
                              }]}
                              onPress={() => handleContactar(perfilParticipante.Telefono)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="call" size={20} color="#FFF" />
                              <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                                Contactar
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <Ionicons name="person-outline" size={48} color={isDarkMode ? '#555' : '#CCC'} />
                        <Text style={[styles.detalleTexto, { color: isDarkMode ? '#888' : '#999', marginTop: 10 }]}>
                          No se pudo cargar el perfil
                        </Text>
                      </View>
                    )}
                  </View>
                ) : null}

                {/* Descripción del Servicio */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="document-text" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Descripción del Servicio
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                    {servicioSeleccionado.SS_Descripcion}
                  </Text>
                </View>

                {/* Dirección */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="location" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Dirección del Servicio
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                    {servicioSeleccionado.SS_Direccion}
                  </Text>
                </View>

                {/* Estado del Servicio */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="information-circle" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Estado del Servicio
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoBadgeDetalle,
                    { 
                      backgroundColor: obtenerColorEstado(servicioSeleccionado.Id_ServicioEstado).bg,
                      borderColor: obtenerColorEstado(servicioSeleccionado.Id_ServicioEstado).text
                    }
                  ]}>
                    <View style={[
                      styles.estadoDotDetalle,
                      { backgroundColor: obtenerColorEstado(servicioSeleccionado.Id_ServicioEstado).text }
                    ]} />
                    <Text style={[
                      styles.estadoTextDetalle,
                      { color: obtenerColorEstado(servicioSeleccionado.Id_ServicioEstado).text }
                    ]}>
                      {obtenerTextoEstado(servicioSeleccionado.Id_ServicioEstado)}
                    </Text>
                  </View>
                </View>

                {/* Fechas */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="calendar" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Fechas Importantes
                    </Text>
                  </View>
                  
                  <View style={styles.detalleFechasContainer}>
                    <View style={[styles.detalleFechaItem, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                    }]}>
                      <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Fecha del Servicio:
                      </Text>
                      <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                        {formatearFechaISO(servicioSeleccionado.SS_FechaServicio)}
                      </Text>
                    </View>

                    {/* Solo mostrar Fecha de Inicio cuando el estado es 1 (creado) */}
                    {servicioSeleccionado.Id_ServicioEstado === 1 && (
                      <View style={[styles.detalleFechaItem, { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                      }]}>
                        <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                          Fecha de Inicio:
                        </Text>
                        <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                          {formatearFechaISO(servicioSeleccionado.SE_FechaModifica)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Calificaciones (solo cuando el estado es COMPLETADO - Id 8) */}
                {servicioSeleccionado && servicioSeleccionado.Id_ServicioEstado === 8 && (
                  <View style={styles.detalleSection}>
                    <View style={styles.detalleSectionHeader}>
                      <Ionicons name="star" size={22} color={theme.colors.primary} />
                      <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                        Calificaciones
                      </Text>
                    </View>
                    
                    {cargandoCalificaciones ? (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      </View>
                    ) : !yaCalifico ? (
                      <View style={{
                        backgroundColor: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.15)',
                        borderColor: '#FFC107',
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 24,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Ionicons name="lock-closed" size={40} color="#FFC107" style={{ marginBottom: 12 }} />
                        <Text style={{ 
                          color: theme.colors.text, 
                          fontWeight: '600',
                          fontSize: 16,
                          textAlign: 'center',
                          marginBottom: 8
                        }}>
                          Calificaciones Ciegas
                        </Text>
                        <Text style={{ 
                          color: isDarkMode ? '#AAA' : '#666', 
                          textAlign: 'center',
                          fontSize: 13,
                          lineHeight: 18
                        }}>
                          Debes calificar este servicio primero para poder ver cómo te calificaron
                        </Text>
                      </View>
                    ) : calificacionesServicio.length > 0 ? (
                      <View>
                        {calificacionesServicio.map((calificacion, index) => {
                          const nombreCalificador = calificacion.NombreCalificador || calificacion.nombreCalificador || 'Usuario';
                          const puntuacion = calificacion.CAL_Puntuacion || calificacion.cal_Puntuacion || 0;
                          const comentario = calificacion.CAL_Comentario || calificacion.cal_Comentario || null;
                          const fecha = calificacion.CAL_Fecha || calificacion.cal_Fecha || null;
                          
                          return (
                            <View 
                              key={calificacion.Id_Calificacion || calificacion.id_Calificacion || index}
                              style={{ 
                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                borderColor: theme.colors.border,
                                borderWidth: 1,
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12
                              }}
                            >
                              {/* Header con nombre y estrellas */}
                              <View style={{ 
                                flexDirection: 'row', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: comentario ? 12 : 8 
                              }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                  <Ionicons 
                                    name="person-circle" 
                                    size={24} 
                                    color={theme.colors.primary} 
                                    style={{ marginRight: 8 }} 
                                  />
                                  <Text style={{ 
                                    color: theme.colors.text, 
                                    fontWeight: '600',
                                    fontSize: 15,
                                    flex: 1
                                  }}>
                                    {nombreCalificador}
                                  </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                      key={star}
                                      name={star <= puntuacion ? 'star' : 'star-outline'}
                                      size={18}
                                      color={star <= puntuacion ? '#FFD700' : '#CCC'}
                                      style={{ marginLeft: 2 }}
                                    />
                                  ))}
                                </View>
                              </View>
                              
                              {/* Comentario */}
                              {comentario && (
                                <Text style={{ 
                                  color: theme.colors.text, 
                                  marginTop: 8,
                                  fontSize: 14,
                                  lineHeight: 20
                                }}>
                                  {comentario}
                                </Text>
                              )}
                              
                              {/* Fecha */}
                              {fecha && (
                                <Text style={{ 
                                  color: isDarkMode ? '#888' : '#999', 
                                  fontSize: 12, 
                                  marginTop: 12,
                                  fontStyle: 'italic'
                                }}>
                                  {formatearFechaISO(fecha)}
                                </Text>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text style={[styles.detalleTexto, { color: isDarkMode ? '#888' : '#999', fontStyle: 'italic' }]}>
                        Aún no hay calificaciones para este servicio
                      </Text>
                    )}
                  </View>
                )}

                {/* Comprobante de Pago (solo para proveedor cuando hay comprobante pendiente) */}
                {modo === 2 && comprobantePago && comprobantePago.CP_Confirmado === false && (
                  <View style={styles.detalleSection}>
                    <View style={styles.detalleSectionHeader}>
                      <Ionicons name="receipt" size={22} color={theme.colors.primary} />
                      <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                        Comprobante de Pago
                      </Text>
                    </View>
                    
                    {cargandoComprobante ? (
                      <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                      </View>
                    ) : (
                      <View style={[styles.detalleParticipanteCard, { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: theme.colors.border,
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 16
                      }]}>
                        {comprobantePago.CP_Comentario && (
                          <View style={{ marginBottom: 16 }}>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: isDarkMode ? '#AAA' : '#666',
                                marginBottom: 4,
                              }}
                            >
                              Comentario del cliente:
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                lineHeight: 20,
                                color: theme.colors.text,
                              }}
                            >
                              {comprobantePago.CP_Comentario}
                            </Text>
                          </View>
                        )}
                        
                        {imagenesComprobanteCargadas.length > 0 && (
                          <View style={{ marginBottom: 16 }}>
                            <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666', marginBottom: 8 }]}>
                              Imágenes del comprobante:
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {imagenesComprobanteCargadas.map((img, index) => (
                                <TouchableOpacity
                                  key={index}
                                  activeOpacity={0.8}
                                  onPress={() => {
                                    setImagenSeleccionada(`data:image/jpeg;base64,${img.IMG_Imagen}`);
                                    setModalImagenVisible(true);
                                  }}
                                  style={{ marginRight: 8 }}
                                >
                                  <Image
                                    source={{ uri: `data:image/jpeg;base64,${img.IMG_Imagen}` }}
                                    style={{
                                      width: 150,
                                      height: 150,
                                      borderRadius: 8,
                                    }}
                                  />
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* Espacio para los botones fijos */}
                <View style={{ height: 0 }} />
              </ScrollView>
            )}

            {/* Botones de acción fijos */}
            <View style={[styles.detalleFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
              <View style={[styles.detalleButtonsContainer, { flexDirection: 'row', gap: 8 }]}>
                {/* Botón Subir Pago (solo para cliente cuando el estado es CREADA) */}
                {modo === 1 && servicioSeleccionado && servicioSeleccionado.Id_ServicioEstado === 1 && !comprobantePago && (
                  <TouchableOpacity
                    style={[styles.detalleButton, { 
                      backgroundColor: '#4CAF50',
                      flex: 1
                    }]}
                    onPress={abrirModalComprobante}
                    disabled={subiendoComprobante}
                  >
                    <Ionicons name="cloud-upload" size={20} color="#FFF" />
                    <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                      Subir Pago
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Botón Confirmar Cierre (solo para proveedor cuando hay comprobante pendiente) */}
                {modo === 2 && comprobantePago && comprobantePago.CP_Confirmado === false && (
                  <TouchableOpacity
                    style={[styles.detalleButton, { 
                      backgroundColor: '#4CAF50',
                      flex: 1
                    }]}
                    onPress={handleConfirmarCierre}
                    disabled={subiendoComprobante}
                  >
                    {subiendoComprobante ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                          Confirmar Cierre
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Botón Ver Historial (solo cuando el estado es COMPLETADO - Id 8) */}
                {servicioSeleccionado && servicioSeleccionado.Id_ServicioEstado === 8 && (
                  <TouchableOpacity
                    style={[styles.detalleButton, { 
                      backgroundColor: theme.colors.primary,
                      flex: 1
                    }]}
                    onPress={abrirModalHistorial}
                  >
                    <Ionicons name="time" size={20} color="#FFF" />
                    <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                      Ver Historial
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Botón Calificar (solo cuando el estado es COMPLETADO y el usuario no ha calificado) */}
                {servicioSeleccionado && servicioSeleccionado.Id_ServicioEstado === 8 && !yaCalifico && (
                  <TouchableOpacity
                    style={[styles.detalleButton, { 
                      backgroundColor: '#FF9800',
                      flex: 1
                    }]}
                    onPress={abrirModalCalificacion}
                    disabled={calificando}
                  >
                    <Ionicons name="star" size={20} color="#FFF" />
                    <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                      Calificar
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Botón Cancelar (oculto cuando el estado es COMPLETADO) */}
                {servicioSeleccionado && servicioSeleccionado.Id_ServicioEstado !== 8 && (
                  <TouchableOpacity
                    style={[styles.detalleButtonCancelar, { 
                      backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.2)' : '#F44336',
                      borderWidth: 1,
                      borderColor: '#D32F2F',
                      opacity: noPermiteInteraccion(servicioSeleccionado) ? 0.5 : 1,
                      flex: servicioSeleccionado.Id_ServicioEstado === 8 ? 0 : 1
                    }]}
                    onPress={abrirModalCancelar}
                    disabled={noPermiteInteraccion(servicioSeleccionado) || cancelando}
                  >
                    {cancelando ? (
                      <ActivityIndicator size="small" color={isDarkMode ? '#EF5350' : '#FFF'} />
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={20} color={isDarkMode ? '#EF5350' : '#FFF'} />
                        <Text style={[styles.detalleButtonText, { color: isDarkMode ? '#EF5350' : '#FFF' }]}>
                          Cancelar
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Perfil de Usuario */}
      <PerfilUsuarioModal
        visible={modalPerfilVisible}
        idUsuario={idUsuarioSeleccionado}
        onClose={() => {
          setModalPerfilVisible(false);
          setIdUsuarioSeleccionado(null);
        }}
      />

      {/* Modal de Cancelación */}
      <Modal
        visible={modalCancelarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrarModalCancelar}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="warning" size={28} color="#F44336" />
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: theme.colors.text
                }}>
                  Cancelar Servicio
                </Text>
              </View>
              <TouchableOpacity
                onPress={cerrarModalCancelar}
                disabled={cancelando}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Mensaje */}
            <Text style={{
              fontSize: 14,
              color: isDarkMode ? '#AAA' : '#666',
              marginBottom: 16,
              lineHeight: 20
            }}>
              Por favor, indica el motivo de la cancelación. Esta acción no se puede deshacer.
            </Text>

            {/* Input de motivo */}
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 12,
                padding: 16,
                minHeight: 100,
                textAlignVertical: 'top',
                color: theme.colors.text,
                fontSize: 14,
                marginBottom: 20
              }}
              placeholder="Ingresa el motivo de la cancelación..."
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              value={motivoCancelacion}
              onChangeText={setMotivoCancelacion}
              multiline
              numberOfLines={4}
              editable={!cancelando}
            />

            {/* Botones */}
            <View style={{
              flexDirection: 'row',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}
                onPress={cerrarModalCancelar}
                disabled={cancelando}
              >
                <Text style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  fontWeight: '600'
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#F44336',
                  opacity: cancelando ? 0.6 : 1
                }}
                onPress={handleCancelarServicio}
                disabled={cancelando || !motivoCancelacion.trim()}
              >
                {cancelando ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={{
                    color: '#FFF',
                    fontSize: 14,
                    fontWeight: '600'
                  }}>
                    Confirmar Cancelación
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Subir Comprobante de Pago */}
      <Modal
        visible={modalComprobanteVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cerrarModalComprobante}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            maxHeight: '90%',
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="receipt" size={28} color={theme.colors.primary} />
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: theme.colors.text
                }}>
                  Subir Comprobante de Pago
                </Text>
              </View>
              <TouchableOpacity
                onPress={cerrarModalComprobante}
                disabled={subiendoComprobante}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Mensaje */}
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#AAA' : '#666',
                marginBottom: 16,
                lineHeight: 20
              }}>
                Sube las imágenes del comprobante de transferencia bancaria. Puedes subir hasta 5 imágenes.
              </Text>

              {/* Input de comentario */}
              <TextInput
                style={{
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 12,
                  padding: 16,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  color: theme.colors.text,
                  fontSize: 14,
                  marginBottom: 20
                }}
                placeholder="Comentario opcional..."
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={comentarioComprobante}
                onChangeText={setComentarioComprobante}
                multiline
                numberOfLines={4}
                editable={!subiendoComprobante}
              />

              {/* Imágenes seleccionadas */}
              {imagenesComprobante.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.text,
                    marginBottom: 12
                  }}>
                    Imágenes seleccionadas ({imagenesComprobante.length}/5):
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {imagenesComprobante.map((img, index) => (
                      <View key={index} style={{ marginRight: 12, position: 'relative' }}>
                        <Image
                          source={{ uri: img.uri }}
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 8
                          }}
                        />
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: '#F44336',
                            borderRadius: 12,
                            width: 24,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                          onPress={() => eliminarImagenComprobante(index)}
                          disabled={subiendoComprobante}
                        >
                          <Ionicons name="close" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Botón para seleccionar imágenes */}
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 20,
                  opacity: imagenesComprobante.length >= 5 ? 0.5 : 1
                }}
                onPress={seleccionarImagenComprobante}
                disabled={imagenesComprobante.length >= 5 || subiendoComprobante}
              >
                <Ionicons name="image" size={24} color="#FFF" />
                <Text style={{
                  color: '#FFF',
                  fontSize: 16,
                  fontWeight: '600',
                  marginTop: 8
                }}>
                  {imagenesComprobante.length >= 5 ? 'Límite alcanzado' : 'Seleccionar Imágenes'}
                </Text>
              </TouchableOpacity>

              {/* Botones */}
              <View style={{
                flexDirection: 'row',
                gap: 12,
                marginTop: 20
              }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    alignItems: 'center'
                  }}
                  onPress={cerrarModalComprobante}
                  disabled={subiendoComprobante}
                >
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '600'
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: '#4CAF50',
                    opacity: (subiendoComprobante || imagenesComprobante.length === 0) ? 0.6 : 1,
                    alignItems: 'center'
                  }}
                  onPress={handleSubirComprobante}
                  disabled={subiendoComprobante || imagenesComprobante.length === 0}
                >
                  {subiendoComprobante ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{
                      color: '#FFF',
                      fontSize: 14,
                      fontWeight: '600'
                    }}>
                      Enviar Comprobante
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para ver imagen de comprobante en grande */}
      <Modal
        visible={modalImagenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalImagenVisible(false);
          setImagenSeleccionada(null);
          setImagenesComprobanteHistorial([]);
          setIndiceImagenActual(0);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 20, padding: 10, zIndex: 10 }}
            onPress={() => {
              setModalImagenVisible(false);
              setImagenSeleccionada(null);
              setImagenesComprobanteHistorial([]);
              setIndiceImagenActual(0);
            }}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>

          {/* Mostrar múltiples imágenes del historial o imagen única */}
          {imagenesComprobanteHistorial.length > 0 ? (
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              {/* Imagen principal con scroll horizontal */}
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                  setIndiceImagenActual(index);
                }}
                style={{ width: '100%', flex: 1 }}
                contentContainerStyle={{ alignItems: 'center' }}
              >
                {imagenesComprobanteHistorial.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: `data:image/jpeg;base64,${img.IMG_Imagen}` }}
                    style={{
                      width: Dimensions.get('window').width,
                      height: '100%',
                      resizeMode: 'contain',
                    }}
                  />
                ))}
              </ScrollView>

              {/* Botones de navegación */}
              {imagenesComprobanteHistorial.length > 1 && (
                <>
                  {/* Botón anterior */}
                  {indiceImagenActual > 0 && (
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        left: 20,
                        top: '50%',
                        transform: [{ translateY: -20 }],
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 25,
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      onPress={() => {
                        const nuevoIndice = indiceImagenActual - 1;
                        setIndiceImagenActual(nuevoIndice);
                      }}
                    >
                      <Ionicons name="chevron-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  {/* Botón siguiente */}
                  {indiceImagenActual < imagenesComprobanteHistorial.length - 1 && (
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        right: 20,
                        top: '50%',
                        transform: [{ translateY: -20 }],
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 25,
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      onPress={() => {
                        const nuevoIndice = indiceImagenActual + 1;
                        setIndiceImagenActual(nuevoIndice);
                      }}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  {/* Indicador de imagen actual */}
                  <View style={{
                    position: 'absolute',
                    top: 50,
                    left: 20,
                    flexDirection: 'row',
                    gap: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
                      {indiceImagenActual + 1} / {imagenesComprobanteHistorial.length}
                    </Text>
                  </View>

                  {/* Miniaturas en la parte inferior */}
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    paddingVertical: 12,
                    paddingHorizontal: 8
                  }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}
                    >
                      {imagenesComprobanteHistorial.map((img, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => setIndiceImagenActual(index)}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: index === indiceImagenActual ? '#4CAF50' : 'transparent',
                            overflow: 'hidden',
                            opacity: index === indiceImagenActual ? 1 : 0.6
                          }}
                        >
                          <Image
                            source={{ uri: `data:image/jpeg;base64,${img.IMG_Imagen}` }}
                            style={{
                              width: '100%',
                              height: '100%',
                              resizeMode: 'cover'
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>
          ) : imagenSeleccionada ? (
            <Image
              source={{ uri: imagenSeleccionada }}
              style={{
                width: '90%',
                height: '70%',
                resizeMode: 'contain',
                borderRadius: 12,
              }}
            />
          ) : null}
        </View>
      </Modal>

      {/* Modal de Historial del Servicio */}
      <Modal
        visible={modalHistorialVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cerrarModalHistorial}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
            borderWidth: 1,
            borderColor: theme.colors.border,
            flex: 1
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border
            }}>
              <Text style={{
                fontSize: 22,
                fontWeight: 'bold',
                color: theme.colors.text
              }}>
                Historial del Servicio
              </Text>
              <TouchableOpacity
                onPress={cerrarModalHistorial}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {cargandoHistorial ? (
              <View style={{ flex: 1, padding: 60, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, marginTop: 16, fontSize: 15 }}>
                  Cargando historial...
                </Text>
              </View>
            ) : historialServicio.length === 0 ? (
              <View style={{ flex: 1, padding: 60, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="document-outline" size={56} color={isDarkMode ? '#555' : '#CCC'} />
                <Text style={{ color: isDarkMode ? '#888' : '#999', marginTop: 16, textAlign: 'center', fontSize: 15 }}>
                  No hay historial disponible
                </Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={true}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
                nestedScrollEnabled={true}
              >
                {historialServicio.map((registro, index) => {
                  const estadoColor = obtenerColorEstado(registro.Id_ServicioEstado);
                  const isLast = index === historialServicio.length - 1;
                  
                  return (
                    <View key={registro.Id_Servicio} style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 24 }}>
                      {/* Timeline vertical */}
                      <View style={{ width: 40, alignItems: 'center', marginRight: 16 }}>
                        {/* Punto del timeline */}
                        <View style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: estadoColor.text,
                          borderWidth: 3,
                          borderColor: theme.colors.card,
                          zIndex: 2
                        }} />
                        {/* Línea vertical */}
                        {!isLast && (
                          <View style={{
                            width: 2,
                            flex: 1,
                            backgroundColor: theme.colors.border,
                            marginTop: 4,
                            opacity: 0.3
                          }} />
                        )}
                      </View>

                      {/* Contenido */}
                      <View style={{ flex: 1 }}>
                        {/* Tarjeta principal */}
                        <View style={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          overflow: 'hidden',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 2
                        }}>
                          {/* Header de la tarjeta */}
                          <View style={{
                            padding: 16,
                            paddingBottom: registro.Id_ComprobantePago ? 12 : 16,
                            borderBottomWidth: registro.Id_ComprobantePago ? 1 : 0,
                            borderBottomColor: theme.colors.border
                          }}>
                            <Text style={{
                              color: theme.colors.text,
                              fontSize: 17,
                              fontWeight: '700',
                              marginBottom: 8
                            }}>
                              {registro.Estado_Nombre}
                            </Text>
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6
                            }}>
                              <Ionicons name="calendar-outline" size={14} color={isDarkMode ? '#AAA' : '#666'} />
                              <Text style={{
                                color: isDarkMode ? '#AAA' : '#666',
                                fontSize: 13,
                                fontWeight: '500'
                              }}>
                                {formatearFechaISO(registro.SE_FechaModifica)}
                              </Text>
                            </View>
                          </View>

                          {/* Comprobante de pago */}
                          {registro.Id_ComprobantePago && (
                            <View style={{
                              padding: 16,
                              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.06)',
                              borderLeftWidth: 3,
                              borderLeftColor: '#4CAF50'
                            }}>
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12
                              }}>
                                <Ionicons name="receipt-outline" size={20} color="#4CAF50" />
                                <Text style={{
                                  color: theme.colors.text,
                                  fontSize: 16,
                                  fontWeight: '700'
                                }}>
                                  Comprobante de Pago
                                </Text>
                              </View>
                              
                              {registro.CP_Comentario && (
                                <View style={{
                                  marginBottom: 12,
                                  padding: 12,
                                  backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.6)',
                                  borderRadius: 8
                                }}>
                                  <Text style={{
                                    color: isDarkMode ? '#AAA' : '#666',
                                    fontSize: 12,
                                    fontWeight: '600',
                                    marginBottom: 6
                                  }}>
                                    Comentario:
                                  </Text>
                                  <Text style={{
                                    color: theme.colors.text,
                                    fontSize: 14,
                                    lineHeight: 20
                                  }}>
                                    {registro.CP_Comentario}
                                  </Text>
                                </View>
                              )}

                              {/* Botón para ver comprobante */}
                              <TouchableOpacity
                                style={{
                                  marginBottom: 12,
                                  padding: 12,
                                  backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.15)',
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: '#4CAF50',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8
                                }}
                                onPress={() => cargarImagenesComprobanteHistorial(registro.Id_ComprobantePago)}
                                disabled={cargandoImagenesHistorial}
                              >
                                {cargandoImagenesHistorial ? (
                                  <ActivityIndicator size="small" color="#4CAF50" />
                                ) : (
                                  <>
                                    <Ionicons name="image-outline" size={18} color="#4CAF50" />
                                    <Text style={{
                                      color: '#4CAF50',
                                      fontSize: 14,
                                      fontWeight: '600'
                                    }}>
                                      Ver Comprobante
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>
                              
                              <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: 8,
                                borderTopWidth: 1,
                                borderTopColor: theme.colors.border
                              }}>
                                <Text style={{
                                  color: isDarkMode ? '#AAA' : '#666',
                                  fontSize: 12
                                }}>
                                  Subido el {formatearFechaISO(registro.CP_FechaSubida)}
                                </Text>
                                {registro.CP_Confirmado && registro.CP_FechaConfirmacion && (
                                  <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 4,
                                    paddingHorizontal: 6,
                                    paddingVertical: 3,
                                    backgroundColor: 'rgba(76, 175, 80, 0.15)',
                                    borderRadius: 4
                                  }}>
                                    <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                                    <Text style={{
                                      color: '#4CAF50',
                                      fontSize: 10,
                                      fontWeight: '600'
                                    }}>
                                      Confirmado
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Calificación */}
      <Modal
        visible={modalCalificacionVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cerrarModalCalificacion}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
            borderWidth: 1,
            borderColor: theme.colors.border,
            flex: 1
          }}>
            {/* Header del Modal */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border
            }}>
              <Text style={{
                fontSize: 22,
                fontWeight: 'bold',
                color: theme.colors.text
              }}>
                Calificar Servicio
              </Text>
              <TouchableOpacity
                onPress={cerrarModalCalificacion}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Contenido del Modal */}
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <Text style={[styles.detalleTexto, { 
                color: theme.colors.text, 
                marginBottom: 20,
                textAlign: 'center'
              }]}>
                ¿Cómo calificarías este servicio?
              </Text>

              {/* Selector de Estrellas */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: 30,
                gap: 8
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setPuntuacionSeleccionada(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= puntuacionSeleccionada ? 'star' : 'star-outline'}
                      size={48}
                      color={star <= puntuacionSeleccionada ? '#FFD700' : '#CCC'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comentario */}
              <Text style={[styles.detalleTexto, { 
                color: theme.colors.text, 
                marginBottom: 8,
                fontWeight: '600'
              }]}>
                Comentario (opcional)
              </Text>
              <TextInput
                style={[{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  color: theme.colors.text,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  fontSize: 14
                }]}
                placeholder="Escribe tu comentario aquí..."
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={comentarioCalificacion}
                onChangeText={setComentarioCalificacion}
                multiline
                maxLength={250}
              />
              <Text style={[styles.detalleTexto, { 
                color: isDarkMode ? '#888' : '#999', 
                fontSize: 12,
                marginTop: 4,
                textAlign: 'right'
              }]}>
                {comentarioCalificacion.length}/250
              </Text>

              {/* Botones */}
              <View style={{ 
                flexDirection: 'row', 
                gap: 12, 
                marginTop: 30 
              }}>
                <TouchableOpacity
                  style={[styles.detalleButtonCancelar, {
                    flex: 1,
                    backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.2)' : '#F44336',
                    borderColor: '#D32F2F'
                  }]}
                  onPress={cerrarModalCalificacion}
                  disabled={calificando}
                >
                  <Text style={[styles.detalleButtonText, { 
                    color: isDarkMode ? '#EF5350' : '#FFF' 
                  }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detalleButton, {
                    flex: 1,
                    backgroundColor: '#FF9800',
                    opacity: puntuacionSeleccionada === 0 || calificando ? 0.5 : 1
                  }]}
                  onPress={handleEnviarCalificacion}
                  disabled={puntuacionSeleccionada === 0 || calificando}
                >
                  {calificando ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                        Enviar
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
