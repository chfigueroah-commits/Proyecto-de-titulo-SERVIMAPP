// Funciones para gestionar solicitudes de servicio
import { post } from '../API/apiClient';
import { obtenerDatosUsuario } from '../API/storage';
import { API_ENDPOINTS } from '../API/config';
import { Alert } from 'react-native';

/**
 * Carga catálogos (categorías y comunas) desde la API
 * @returns {Promise<object>} Objeto con categorias y comunas
 */
export const cargarCatalogos = async () => {
  try {
    // Cargar categorías y comunas en paralelo usando POST (como tu backend espera)
    const [categoriasData, comunasData] = await Promise.all([
      post(API_ENDPOINTS.CATEGORIAS, {}),  // POST con body vacío
      post(API_ENDPOINTS.COMUNAS, {})      // POST con body vacío
    ]);

    // Tu backend devuelve un DataTable directamente
    // Puede venir como array o como objeto con Rows
    const categoriasArray = Array.isArray(categoriasData) 
      ? categoriasData 
      : (categoriasData.Rows || categoriasData.data || []);
    
    const comunasArray = Array.isArray(comunasData) 
      ? comunasData 
      : (comunasData.Rows || comunasData.data || []);

    // Log con recuento en lugar de datos completos
    // Catálogos cargados correctamente

    return {
      categorias: categoriasArray,
      comunas: comunasArray
    };
  } catch (error) {
    console.error('Error cargando catálogos:', error);
    throw error;
  }
};

/**
 * Carga los estados de ofertas desde la API
 * @returns {Promise<Array>} Array de estados de ofertas
 */
export const cargarEstadosOfertas = async () => {
  try {
    const estadosData = await post(API_ENDPOINTS.OFERTA_ESTADOS, {});
    
    // El backend devuelve un DataTable
    const estadosArray = Array.isArray(estadosData) 
      ? estadosData 
      : (estadosData.Rows || estadosData.data || []);

    return estadosArray;
  } catch (error) {
    console.error('Error cargando estados de ofertas:', error);
    throw error;
  }
};

/**
 * Carga los estados de solicitudes desde la API
 * @returns {Promise<Array>} Array de estados de solicitudes
 */
export const cargarEstadosSolicitudes = async () => {
  try {
    const estadosData = await post(API_ENDPOINTS.SOLICITUD_ESTADOS, {});
    
    // El backend devuelve un DataTable
    const estadosArray = Array.isArray(estadosData) 
      ? estadosData 
      : (estadosData.Rows || estadosData.data || []);

    return estadosArray;
  } catch (error) {
    console.error('Error cargando estados de solicitudes:', error);
    throw error;
  }
};

/**
 * Valida los datos del formulario de solicitud
 * @param {object} formData - Datos del formulario
 * @returns {object} { valido: boolean, mensaje: string }
 */
export const validarFormularioSolicitud = (formData) => {
  if (!formData.idCategoria) {
    return { valido: false, mensaje: 'Selecciona una categoría' };
  }
  if (!formData.idComuna) {
    return { valido: false, mensaje: 'Selecciona una comuna' };
  }
  if (!formData.titulo || formData.titulo.trim().length === 0) {
    return { valido: false, mensaje: 'Ingresa un título para el servicio' };
  }
  if (!formData.descripcion || formData.descripcion.trim().length === 0) {
    return { valido: false, mensaje: 'Ingresa una descripción del servicio' };
  }
  if (!formData.direccion || formData.direccion.trim().length === 0) {
    return { valido: false, mensaje: 'Ingresa una dirección' };
  }
  if (!formData.latitud || !formData.longitud) {
    return { valido: false, mensaje: 'Debes buscar las coordenadas de la dirección' };
  }
  if (!formData.contacto || formData.contacto.trim().length === 0) {
    return { valido: false, mensaje: 'Ingresa un teléfono de contacto' };
  }
  if (formData.contacto.replace(/\D/g, '').length !== 9) {
    return { valido: false, mensaje: 'El teléfono debe tener 9 dígitos' };
  }
  
  return { valido: true };
};

/**
 * Crea una nueva solicitud de servicio
 * @param {object} formData - Datos del formulario
 * @returns {Promise<object>} Respuesta de la API
 */
export const crearSolicitud = async (formData) => {
  try {
    // Validar formulario
    const validacion = validarFormularioSolicitud(formData);
    if (!validacion.valido) {
      Alert.alert('Error', validacion.mensaje);
      return { exito: false };
    }

    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return { exito: false };
    }

    // Preparar datos para enviar
    // Fecha de expiración: 7 días después de la fecha del servicio
    const fechaExpira = new Date(formData.fechaServicio);
    fechaExpira.setDate(fechaExpira.getDate() + 7);

    const datosParaEnviar = {
      Id_Usuario: usuario.UsuarioId,
      Id_Categoria: parseInt(formData.idCategoria),
      Id_Comuna: parseInt(formData.idComuna),
      SS_FechaServicio: formData.fechaServicio.toISOString(),
      SS_Titulo: formData.titulo.trim(),
      SS_Descripcion: formData.descripcion.trim(),
      SS_Latitud: formData.latitud,
      SS_Longitud: formData.longitud,
      SS_Contacto: parseInt(formData.contacto.replace(/\D/g, '')),
      SS_Direccion: formData.direccion.trim(),
      SS_FechaExpira: fechaExpira.toISOString(),
    };

    // Agregar array de imágenes si existen
    if (formData.todasLasImagenes && formData.todasLasImagenes.length > 0) {
      datosParaEnviar.Imagenes = formData.todasLasImagenes.map(imagen => ({
        IMG_Archivo: imagen.nombre,
        IMG_Base64: imagen.base64
      }));
    }

    console.log('📤 Enviando solicitud de servicio:', {
      categoria: datosParaEnviar.Id_Categoria,
      comuna: datosParaEnviar.Id_Comuna,
      titulo: datosParaEnviar.SS_Titulo,
      fecha: datosParaEnviar.SS_FechaServicio
    });

    // Llamar a la API
    const response = await post(API_ENDPOINTS.CREAR_SOLICITUD, datosParaEnviar);
    
    console.log('✅ Solicitud creada exitosamente:', response?.id_solicitud || 'ID no disponible');

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    Alert.alert(
      'Error',
      'No se pudo crear la solicitud. Verifica tu conexión e intenta nuevamente.'
    );
    return { exito: false };
  }
};

/**
 * Obtiene todas las solicitudes de un usuario específico
 * @returns {Promise<Array>} Array de solicitudes del usuario
 */
export const listarSolicitudesUsuario = async () => {
  try {
    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      console.error('No se pudo obtener la información del usuario');
      return [];
    }

    // Llamar a la API
    const response = await post(API_ENDPOINTS.LISTAR_SOLICITUDES_USUARIO, {
      Id_Usuario: usuario.UsuarioId
    });

    // Procesar respuesta (puede venir como array o DataTable con Rows)
    const solicitudesArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return solicitudesArray;
  } catch (error) {
    console.error('Error al listar solicitudes del usuario:', error.message);
    return [];
  }
};

/**
 * Obtiene todas las solicitudes generales (de otros usuarios, no expiradas)
 * Para mostrar en el mapa
 * @returns {Promise<Array>} Array de solicitudes generales
 */
export const listarSolicitudesGeneral = async () => {
  try {
    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      console.error('No se pudo obtener la información del usuario');
      return [];
    }

    // Llamar a la API
    const response = await post(API_ENDPOINTS.LISTAR_SOLICITUDES_GENERAL, {
      Id_Usuario: usuario.UsuarioId
    });

    // Procesar respuesta (puede venir como array o DataTable con Rows)
    const solicitudesArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return solicitudesArray;
  } catch (error) {
    console.error('Error al listar solicitudes generales:', error.message);
    return [];
  }
};

/**
 * Crea una nueva oferta para una solicitud de servicio
 * @param {number} idSolicitudServicio - ID de la solicitud de servicio
 * @param {number} monto - Monto de la oferta
 * @param {string} comentario - Comentario de la oferta
 * @returns {Promise<object>} Respuesta de la API
 */
export const crearOferta = async (idSolicitudServicio, monto, comentario) => {
  try {
    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return { exito: false };
    }

    // Preparar datos para enviar
    const datosParaEnviar = {
      Id_SolicitudServicio: idSolicitudServicio,
      Id_Usuario: usuario.UsuarioId,
      Monto: monto,
      Comentario: comentario || ''
    };

    console.log('📤 Enviando oferta:', {
      solicitud: datosParaEnviar.Id_SolicitudServicio,
      monto: datosParaEnviar.Monto,
      comentario: datosParaEnviar.Comentario ? 'Sí' : 'No'
    });

    // Llamar a la API
    const response = await post(API_ENDPOINTS.CREAR_OFERTA, datosParaEnviar);
    
    console.log('✅ Oferta creada exitosamente');

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al crear oferta:', error);
    Alert.alert(
      'Error',
      'No se pudo crear la oferta. Verifica tu conexión e intenta nuevamente.'
    );
    return { exito: false };
  }
};

/**
 * Elimina una oferta
 * @param {number} idOferta - ID de la oferta a eliminar
 * @returns {Promise<object>} { exito: boolean }
 */
export const eliminarOferta = async (idOferta) => {
  try {
    if (!idOferta || idOferta <= 0) {
      Alert.alert('Error', 'ID de oferta inválido');
      return { exito: false };
    }

    console.log('🗑️ Eliminando oferta:', idOferta);

    // Preparar datos para enviar (solo el Id_Oferta como indica el endpoint)
    const datosParaEnviar = {
      Id_Oferta: idOferta
    };

    // Llamar a la API
    const response = await post(API_ENDPOINTS.ELIMINAR_OFERTA, datosParaEnviar);
    
    console.log('✅ Oferta eliminada exitosamente');

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    const mensajeError = error.message || 'No se pudo eliminar la oferta. Verifica tu conexión e intenta nuevamente.';
    Alert.alert('Error', mensajeError);
    return { exito: false };
  }
};

/**
 * Cancela una solicitud de servicio
 * @param {number} idSolicitudServicio - ID de la solicitud a cancelar
 * @returns {Promise<object>} { exito: boolean }
 */
export const cancelarSolicitud = async (idSolicitudServicio) => {
  try {
    if (!idSolicitudServicio || idSolicitudServicio <= 0) {
      Alert.alert('Error', 'ID de solicitud inválido');
      return { exito: false };
    }

    console.log('🚫 Cancelando solicitud:', idSolicitudServicio);

    // Preparar datos para enviar
    const datosParaEnviar = {
      Id_SolicitudServicio: idSolicitudServicio
    };

    // Llamar a la API
    const response = await post(API_ENDPOINTS.CANCELAR_SOLICITUD, datosParaEnviar);
    
    console.log('✅ Solicitud cancelada exitosamente');

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    const mensajeError = error.message || 'No se pudo cancelar la solicitud. Verifica tu conexión e intenta nuevamente.';
    Alert.alert('Error', mensajeError);
    return { exito: false };
  }
};

/**
 * Rechaza una oferta
 * @param {number} idOferta - ID de la oferta a rechazar
 * @returns {Promise<object>} { exito: boolean }
 */
export const rechazarOferta = async (idOferta) => {
  try {
    if (!idOferta || idOferta <= 0) {
      Alert.alert('Error', 'ID de oferta inválido');
      return { exito: false };
    }

    console.log('❌ Rechazando oferta:', idOferta);

    // Preparar datos para enviar (solo el Id_Oferta como indica el endpoint)
    const datosParaEnviar = {
      Id_Oferta: idOferta
    };

    // Llamar a la API
    const response = await post(API_ENDPOINTS.RECHAZAR_OFERTA, datosParaEnviar);
    
    console.log('✅ Oferta rechazada exitosamente');

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al rechazar oferta:', error);
    const mensajeError = error.message || 'No se pudo rechazar la oferta. Verifica tu conexión e intenta nuevamente.';
    Alert.alert('Error', mensajeError);
    return { exito: false };
  }
};

/**
 * Acepta una oferta creando un servicio
 * @param {number} idSolicitudServicio - ID de la solicitud de servicio
 * @param {number} idOferta - ID de la oferta a aceptar
 * @returns {Promise<object>} { exito: boolean }
 */
export const aceptarOferta = async (idSolicitudServicio, idOferta) => {
  try {
    if (!idSolicitudServicio || idSolicitudServicio <= 0) {
      Alert.alert('Error', 'ID de solicitud inválido');
      return { exito: false };
    }

    if (!idOferta || idOferta <= 0) {
      Alert.alert('Error', 'ID de oferta inválido');
      return { exito: false };
    }

    // Obtener datos del usuario (el que acepta la oferta, dueño de la solicitud)
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return { exito: false };
    }

    console.log('✅ Aceptando oferta:', {
      solicitud: idSolicitudServicio,
      oferta: idOferta,
      usuario: usuario.UsuarioId
    });

    // Preparar datos para enviar
    const datosParaEnviar = {
      Id_SolicitudServicio: idSolicitudServicio,
      Id_Oferta: idOferta,
      Id_Usuario: usuario.UsuarioId,
      SE_FechaModifica: new Date().toISOString()
    };

    // Llamar a la API
    const response = await post(API_ENDPOINTS.CREAR_SERVICIO, datosParaEnviar);
    
    console.log('✅ Oferta aceptada exitosamente, servicio creado');

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al aceptar oferta:', error);
    const mensajeError = error.message || 'No se pudo aceptar la oferta. Verifica tu conexión e intenta nuevamente.';
    Alert.alert('Error', mensajeError);
    return { exito: false };
  }
};

/**
 * Obtiene todas las ofertas de un usuario específico
 * @returns {Promise<Array>} Array de ofertas del usuario
 */
export const listarOfertasUsuario = async () => {
  try {
    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      console.error('No se pudo obtener la información del usuario');
      return [];
    }

    // Llamar a la API
    const response = await post(API_ENDPOINTS.LISTAR_OFERTAS_USUARIO, {
      Id_Usuario: usuario.UsuarioId
    });

    // Procesar respuesta (puede venir como array o DataTable con Rows)
    const ofertasArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return ofertasArray;
  } catch (error) {
    console.error('Error al listar ofertas del usuario:', error.message);
    return [];
  }
};

/**
 * Obtiene todas las ofertas de una solicitud de servicio específica
 * @param {number} idSolicitudServicio - ID de la solicitud de servicio
 * @returns {Promise<Array>} Array de ofertas de la solicitud
 */
export const listarOfertasSolicitud = async (idSolicitudServicio) => {
  try {
    if (!idSolicitudServicio) {
      console.error('ID de solicitud de servicio requerido');
      return [];
    }

    // Llamar a la API
    const response = await post(API_ENDPOINTS.LISTAR_OFERTAS_SOLICITUD, {
      Id_SolicitudServicio: idSolicitudServicio
    });

    // Procesar respuesta (puede venir como array o DataTable con Rows)
    const ofertasArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return ofertasArray;
  } catch (error) {
    console.error('Error al listar ofertas de la solicitud:', error.message);
    return [];
  }
};

/**
 * Obtiene las imágenes de una solicitud de servicio
 * @param {number} idSolicitudServicio - ID de la solicitud de servicio
 * @returns {Promise<Array>} Array de imágenes de la solicitud
 */
export const obtenerImagenesSolicitud = async (idSolicitudServicio) => {
  try {
    if (!idSolicitudServicio) {
      console.error('ID de solicitud de servicio requerido');
      return [];
    }

    // Llamar a la API
    const response = await post(API_ENDPOINTS.CONSULTAR_IMAGENES_SOLICITUD, {
      Id_SolicitudServicio: idSolicitudServicio
    });

    // Procesar respuesta (puede venir como array o DataTable con Rows)
    const imagenesArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return imagenesArray;
  } catch (error) {
    console.error('Error al obtener imágenes de la solicitud:', error.message);
    return [];
  }
};

/**
 * Consulta un servicio por su ID y devuelve todos sus datos
 * @param {number} idServicio - ID del servicio
 * @returns {Promise<Object|null>} Datos completos del servicio o null si no se encuentra
 */
export const consultarServicioPorId = async (idServicio) => {
  try {
    if (!idServicio || idServicio <= 0) {
      return null;
    }

    const response = await post(API_ENDPOINTS.CONSULTAR_SERVICIO_POR_ID, {
      Id_Servicio: idServicio
    });

    // Procesar respuesta (puede venir como array o DataTable con Rows)
    const serviciosArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    // Devolver el primer servicio (debería ser único)
    return serviciosArray && serviciosArray.length > 0 ? serviciosArray[0] : null;
  } catch (error) {
    console.error('Error al consultar servicio por ID:', error.message);
    return null;
  }
};

/**
 * Cancela un servicio
 * @param {number} idServicio - ID del servicio a cancelar
 * @param {number} idUsuario - ID del usuario que cancela
 * @param {string} motivo - Motivo de la cancelación
 * @returns {Promise<Object>} Objeto con exito y mensaje
 */
export const cancelarServicio = async (idServicio, idUsuario, motivo) => {
  try {
    if (!idServicio || idServicio <= 0) {
      Alert.alert('Error', 'ID de servicio inválido');
      return { exito: false };
    }

    if (!idUsuario || idUsuario <= 0) {
      Alert.alert('Error', 'ID de usuario inválido');
      return { exito: false };
    }

    if (!motivo || motivo.trim() === '') {
      Alert.alert('Error', 'El motivo de cancelación es requerido');
      return { exito: false };
    }

    const datosParaEnviar = {
      Id_Servicio: idServicio,
      Id_Usuario: idUsuario,
      SE_Comentario: motivo.trim()
    };

    const response = await post(API_ENDPOINTS.CANCELAR_SERVICIO, datosParaEnviar);

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al cancelar servicio:', error);
    Alert.alert('Error', error.message || 'No se pudo cancelar el servicio');
    return { exito: false };
  }
};

/**
 * Carga los estados de servicios desde la API
 * @returns {Promise<Array>} Array de estados de servicios
 */
export const cargarEstadosServicios = async () => {
  try {
    const estadosData = await post(API_ENDPOINTS.SERVICIO_ESTADOS, {});
    
    // El backend devuelve un DataTable
    const estadosArray = Array.isArray(estadosData) 
      ? estadosData 
      : (estadosData.Rows || estadosData.data || []);

    return estadosArray;
  } catch (error) {
    console.error('Error cargando estados de servicios:', error);
    throw error;
  }
};

/**
 * Lista los servicios de un usuario (tanto como cliente como proveedor)
 * @returns {Promise<Object>} Objeto con serviciosCliente y serviciosProveedor
 */
export const listarServicios = async () => {
  try {
    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      console.error('No se pudo obtener la información del usuario');
      return { serviciosCliente: [], serviciosProveedor: [] };
    }

    // Llamar a ambos endpoints en paralelo
    const [responseCliente, responseProveedor] = await Promise.all([
      post(API_ENDPOINTS.LISTAR_SERVICIOS_CLIENTE, {
        Id_Usuario: usuario.UsuarioId
      }),
      post(API_ENDPOINTS.LISTAR_SERVICIOS_PROVEEDOR, {
        Id_Usuario: usuario.UsuarioId
      })
    ]);

    // Procesar respuestas (pueden venir como array o DataTable con Rows)
    const serviciosCliente = Array.isArray(responseCliente) 
      ? responseCliente 
      : (responseCliente.Rows || responseCliente.data || []);

    const serviciosProveedor = Array.isArray(responseProveedor) 
      ? responseProveedor 
      : (responseProveedor.Rows || responseProveedor.data || []);

    return {
      serviciosCliente: serviciosCliente || [],
      serviciosProveedor: serviciosProveedor || []
    };
  } catch (error) {
    console.error('Error al listar servicios:', error.message);
    return { serviciosCliente: [], serviciosProveedor: [] };
  }
};

/**
 * Inserta un comprobante de pago para un servicio
 * @param {number} idServicio - ID del servicio
 * @param {number} idUsuario - ID del usuario (cliente)
 * @param {string} comentario - Comentario opcional
 * @param {Array} imagenes - Array de objetos con IMG_Archivo e IMG_Base64
 * @returns {Promise<Object>} Objeto con exito y Id_ComprobantePago
 */
export const insertarComprobantePago = async (idServicio, idUsuario, comentario, imagenes) => {
  try {
    if (!idServicio || idServicio <= 0) {
      Alert.alert('Error', 'ID de servicio inválido');
      return { exito: false };
    }

    if (!idUsuario || idUsuario <= 0) {
      Alert.alert('Error', 'ID de usuario inválido');
      return { exito: false };
    }

    if (!imagenes || imagenes.length === 0) {
      Alert.alert('Error', 'Debes subir al menos una imagen del comprobante');
      return { exito: false };
    }

    const datosParaEnviar = {
      Id_Servicio: idServicio,
      Id_Usuario: idUsuario,
      CP_Comentario: comentario || null,
      Imagenes: imagenes.map(img => ({
        IMG_Archivo: img.IMG_Archivo,
        IMG_Base64: img.IMG_Base64
      }))
    };

    const response = await post(API_ENDPOINTS.INSERTAR_COMPROBANTE_PAGO, datosParaEnviar);

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al insertar comprobante de pago:', error);
    Alert.alert('Error', error.message || 'No se pudo subir el comprobante de pago');
    return { exito: false };
  }
};

/**
 * Consulta el comprobante de pago de un servicio
 * @param {number} idServicio - ID del servicio
 * @returns {Promise<Object|null>} Datos del comprobante o null
 */
export const consultarComprobantePago = async (idServicio) => {
  try {
    if (!idServicio || idServicio <= 0) {
      return null;
    }

    const response = await post(API_ENDPOINTS.CONSULTAR_COMPROBANTE_PAGO, {
      Id_Servicio: idServicio
    });

    const comprobantesArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return comprobantesArray && comprobantesArray.length > 0 ? comprobantesArray[0] : null;
  } catch (error) {
    console.error('Error al consultar comprobante de pago:', error);
    return null;
  }
};

/**
 * Consulta las imágenes de un comprobante de pago
 * @param {number} idComprobantePago - ID del comprobante
 * @returns {Promise<Array>} Array de imágenes
 */
export const consultarImagenesComprobante = async (idComprobantePago) => {
  try {
    if (!idComprobantePago || idComprobantePago <= 0) {
      return [];
    }

    const response = await post(API_ENDPOINTS.CONSULTAR_IMAGENES_COMPROBANTE, {
      Id_ComprobantePago: idComprobantePago
    });

    const imagenesArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return imagenesArray || [];
  } catch (error) {
    console.error('Error al consultar imágenes del comprobante:', error);
    return [];
  }
};

/**
 * Confirma el cierre del servicio por parte del proveedor
 * @param {number} idServicio - ID del servicio
 * @param {number} idUsuario - ID del usuario (proveedor)
 * @returns {Promise<Object>} Objeto con exito
 */
export const confirmarComprobantePago = async (idServicio, idUsuario) => {
  try {
    if (!idServicio || idServicio <= 0) {
      Alert.alert('Error', 'ID de servicio inválido');
      return { exito: false };
    }

    if (!idUsuario || idUsuario <= 0) {
      Alert.alert('Error', 'ID de usuario inválido');
      return { exito: false };
    }

    const datosParaEnviar = {
      Id_Servicio: idServicio,
      Id_Usuario: idUsuario
    };

    const response = await post(API_ENDPOINTS.CONFIRMAR_COMPROBANTE_PAGO, datosParaEnviar);

    return { exito: true, data: response };
  } catch (error) {
    console.error('Error al confirmar comprobante de pago:', error);
    Alert.alert('Error', error.message || 'No se pudo confirmar el cierre del servicio');
    return { exito: false };
  }
};

/**
 * Consulta el historial completo de un servicio
 * @param {number} idServicio - ID del servicio
 * @returns {Promise<Array>} Array con todos los registros históricos del servicio
 */
export const consultarHistorialServicio = async (idServicio) => {
  try {
    if (!idServicio || idServicio <= 0) {
      return [];
    }

    const response = await post(API_ENDPOINTS.CONSULTAR_HISTORIAL_SERVICIO, {
      Id_Servicio: idServicio
    });

    const historialArray = Array.isArray(response) 
      ? response 
      : (response.Rows || response.data || []);

    return historialArray || [];
  } catch (error) {
    console.error('Error al consultar historial del servicio:', error);
    return [];
  }
};

/**
 * Inserta una calificación para un servicio
 * @param {number} idServicio - ID del servicio
 * @param {number} idUsuario - ID del usuario que califica
 * @param {number} puntuacion - Puntuación (1-5)
 * @param {string} comentario - Comentario opcional
 * @returns {Promise<Object>} Objeto con exito
 */
export const insertarCalificacionServicio = async (idServicio, idUsuario, puntuacion, comentario = null) => {
  try {
    if (!idServicio || idServicio <= 0) {
      throw new Error('ID de servicio inválido');
    }

    if (!idUsuario || idUsuario <= 0) {
      throw new Error('ID de usuario inválido');
    }

    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      throw new Error('La puntuación debe estar entre 1 y 5');
    }

    const response = await post(API_ENDPOINTS.INSERTAR_CALIFICACION_SERVICIO, {
      Id_Servicio: idServicio,
      Id_Usuario: idUsuario,
      CAL_Puntuacion: puntuacion,
      CAL_Comentario: comentario || null
    });

    return { exito: response.exito || false };
  } catch (error) {
    console.error('Error al insertar calificación:', error);
    throw error;
  }
};

/**
 * Consulta las calificaciones de un servicio
 * @param {number} idServicio - ID del servicio
 * @param {number} idUsuario - ID del usuario que consulta (opcional, para verificar si ya calificó)
 * @returns {Promise<Object>} Objeto con calificaciones, yaCalifico e idUsuarioACalificar
 */
export const consultarCalificacionServicio = async (idServicio, idUsuario = null) => {
  try {
    if (!idServicio || idServicio <= 0) {
      return { calificaciones: [], yaCalifico: false, idUsuarioACalificar: null };
    }

    const response = await post(API_ENDPOINTS.CONSULTAR_CALIFICACION_SERVICIO, {
      Id_Servicio: idServicio,
      Id_Usuario: idUsuario || null
    });

    const calificacionesArray = Array.isArray(response.calificaciones) 
      ? response.calificaciones 
      : (response.calificaciones?.Rows || response.calificaciones?.data || []);

    return {
      calificaciones: calificacionesArray || [],
      yaCalifico: response.yaCalifico || false,
      idUsuarioACalificar: response.idUsuarioACalificar || null
    };
  } catch (error) {
    console.error('Error al consultar calificación:', error);
    return { calificaciones: [], yaCalifico: false, idUsuarioACalificar: null };
  }
};


