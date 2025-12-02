// Configuración de la API

/**
 * URL base de la API
 * Cambia esta URL según tu entorno (desarrollo, producción, etc.)
 */
// Para desarrollo local - usa la IP de tu PC en la red local
export const API_BASE_URL = '?';

/**
 * API Key para autenticación
 */
export const API_KEY = '?'; 

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/usuario/autenticar/login',
  LOGOUT: '/usuario/autenticar/logout',
  
  // Registro
  REGISTRO: '/usuario/registro/register',
  
  // Usuario
  PERFIL: '/api/usuario/perfil',
  ACTUALIZAR_PERFIL: '/usuario/actualiza',
  CONSULTAR_USUARIO: '/usuario/consulta',

  // Solicitudes
  CREAR_SOLICITUD: '/api/solicitudes/crear',
  LISTAR_SOLICITUDES_USUARIO: '/api/solicitudes/listar/usuario',
  LISTAR_SOLICITUDES_GENERAL: '/api/solicitudes/listar/general',
  CANCELAR_SOLICITUD: '/api/solicitudes/cancelar',

  // Ofertas
  CREAR_OFERTA: '/oferta/crear',
  LISTAR_OFERTAS_USUARIO: '/oferta/consulta',
  LISTAR_OFERTAS_SOLICITUD: '/oferta/ofertasolicitud',
  ELIMINAR_OFERTA: '/oferta/eliminar',
  RECHAZAR_OFERTA: '/oferta/rechazar',

  // Servicios
  CREAR_SERVICIO: '/servicio/crear',
  LISTAR_SERVICIOS_CLIENTE: '/servicio/listar/cliente',
  LISTAR_SERVICIOS_PROVEEDOR: '/servicio/listar/proveedor',
  CONSULTAR_SERVICIO_POR_ID: '/servicio/consulta/id',
  CANCELAR_SERVICIO: '/servicio/cancelar',
  SERVICIO_ESTADOS: '/consulta/servicioestados',
  
  // Comprobantes de Pago
  INSERTAR_COMPROBANTE_PAGO: '/servicio/comprobante/insertar',
  CONSULTAR_COMPROBANTE_PAGO: '/servicio/comprobante/consultar',
  CONSULTAR_IMAGENES_COMPROBANTE: '/servicio/comprobante/imagenes/consultar',
  CONFIRMAR_COMPROBANTE_PAGO: '/servicio/comprobante/confirmar',
  
  // Historial de Servicio
  CONSULTAR_HISTORIAL_SERVICIO: '/servicio/historial/consultar',
  
  // Calificaciones de Servicio
  INSERTAR_CALIFICACION_SERVICIO: '/servicio/calificacion/insertar',
  CONSULTAR_CALIFICACION_SERVICIO: '/servicio/calificacion/consultar',

  // Catálogos (consultas)
  CATEGORIAS: '/consulta/categoria',
  COMUNAS: '/consulta/comuna',
  PROFESIONES: '/consulta/profesion',
  OFERTA_ESTADOS: '/consulta/ofertaestados',
  SOLICITUD_ESTADOS: '/consulta/solicitudestados',

  // Imágenes
  CONSULTAR_IMAGENES_SOLICITUD: '/api/imagen/consulta/solicitudservicio',
  INSERTAR_IMAGEN: '/api/imagen/insertar',
  BORRAR_IMAGEN_PERFIL: '/api/imagen/borrar',
};

/**
 * Headers por defecto para las peticiones
 */
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY,
});

/**
 * Headers con autenticación (incluye token)
 */
export const getAuthHeaders = (token) => ({
  ...getDefaultHeaders(),
  'Authorization': `Bearer ${token}`,
});

/**
 * Configuración de timeout para las peticiones
 */
export const REQUEST_TIMEOUT = 10000; // 10 segundos


