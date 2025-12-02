// Funciones para gestionar el usuario
import { post } from '../API/apiClient';
import { obtenerDatosUsuario, guardarDatosUsuario } from '../API/storage';
import { API_ENDPOINTS } from '../API/config';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Consulta los datos del usuario desde la API
 * @returns {Promise<object|null>} Datos del usuario o null si hay error
 */
export const consultarUsuario = async () => {
  try {
    // Obtener ID del usuario desde el storage
    const usuarioStorage = await obtenerDatosUsuario();
    
    if (!usuarioStorage || !usuarioStorage.UsuarioId) {
      console.error('No se pudo obtener el ID del usuario');
      return null;
    }

    // Llamar al endpoint de consulta
    const response = await post(API_ENDPOINTS.CONSULTAR_USUARIO, {
      Id_Usuario: usuarioStorage.UsuarioId,
    });

    // El controlador retorna un DataTable, puede venir como array o como objeto
    let usuarioData = null;
    
    if (Array.isArray(response) && response.length > 0) {
      usuarioData = response[0];
    } else if (response && typeof response === 'object') {
      if (response.Table && Array.isArray(response.Table) && response.Table.length > 0) {
        usuarioData = response.Table[0];
      } else if (response.Rows && Array.isArray(response.Rows) && response.Rows.length > 0) {
        usuarioData = response.Rows[0];
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        usuarioData = response.data[0];
      } else {
        // Si es un objeto directo con los campos
        usuarioData = response;
      }
    }

    if (!usuarioData) {
      console.error('No se encontraron datos del usuario');
      return null;
    }

    // Mapear los campos del DataTable a la estructura esperada
    const usuarioMapeado = {
      UsuarioId: usuarioData.Id_Usuario,
      Rut: usuarioData.US_RUN,
      Nombre: usuarioData.US_Nombre,
      Apellido: usuarioData.US_Apellido,
      Correo: usuarioData.US_Email,
      Telefono: usuarioData.US_Telefono,
      Biografia: usuarioData.US_Biografia,
      FechaNacimiento: usuarioData.US_FechaNac,
      FechaRegistro: usuarioData.US_FechaReg,
      Activo: usuarioData.US_Activo,
      Admin: usuarioData.US_Admin,
      ImagenPerfil: usuarioData.IMG_ImagenPerfil || null, // Imagen de perfil en base64
      CalificaUsuario: usuarioData.Califica_Usuario !== null && usuarioData.Califica_Usuario !== undefined ? usuarioData.Califica_Usuario : null, // Calificación como usuario
      CalificaProveedor: usuarioData.Califica_Proveedor !== null && usuarioData.Califica_Proveedor !== undefined ? usuarioData.Califica_Proveedor : null, // Calificación como proveedor
      Profesion: usuarioData.US_Profesion || null, // Profesión (nombre)
      Id_Profesion: usuarioData.Id_Profesion !== null && usuarioData.Id_Profesion !== undefined ? usuarioData.Id_Profesion : null, // ID de la profesión
      CantidadServicios: usuarioData.Cantidad_Servicios !== null && usuarioData.Cantidad_Servicios !== undefined ? usuarioData.Cantidad_Servicios : 0, // Cantidad de servicios realizados
    };

    // Actualizar el storage con los datos actualizados
    await guardarDatosUsuario(usuarioMapeado);

    return usuarioMapeado;
  } catch (error) {
    console.error('Error al consultar usuario:', error);
    return null;
  }
};

/**
 * Carga las profesiones desde la API
 * @returns {Promise<Array>} Array de profesiones
 */
export const cargarProfesiones = async () => {
  try {
    const profesionesData = await post(API_ENDPOINTS.PROFESIONES, {});
    
    // El backend devuelve un DataTable directamente
    // Puede venir como array o como objeto con Rows
    const profesionesArray = Array.isArray(profesionesData) 
      ? profesionesData 
      : (profesionesData.Rows || profesionesData.data || []);
    
    return profesionesArray;
  } catch (error) {
    console.error('Error cargando profesiones:', error);
    throw error;
  }
};

/**
 * Actualiza el perfil del usuario
 * @param {string} telefono - Teléfono del usuario (9 dígitos)
 * @param {string} biografia - Biografía del usuario
 * @param {number|null} idProfesion - ID de la profesión seleccionada (opcional)
 * @returns {Promise<object>} { exito: boolean, mensaje: string }
 */
export const actualizarPerfil = async (telefono, biografia, idProfesion = null) => {
  try {
    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return { exito: false, mensaje: 'No se pudo obtener la información del usuario' };
    }

    // Limpiar el teléfono (solo números)
    const telefonoLimpio = telefono.replace(/\D/g, '');
    
    if (telefonoLimpio.length !== 9) {
      Alert.alert('Error', 'El teléfono debe tener 9 dígitos');
      return { exito: false, mensaje: 'El teléfono debe tener 9 dígitos' };
    }

    // Preparar datos para enviar (teléfono como VARCHAR según el controlador)
    const datosParaEnviar = {
      Id_Usuario: usuario.UsuarioId,
      US_Telefono: telefonoLimpio, // Enviar como string (VARCHAR)
      US_Biografia: biografia.trim(),
      Id_Profesion: idProfesion || null, // ID de la profesión (puede ser null)
    };

    // Llamar a la API
    const response = await post(API_ENDPOINTS.ACTUALIZAR_PERFIL, datosParaEnviar);

    // El controlador ahora retorna { exito = true, mensaje = "Usuario actualizado" }
    if (response && response.exito) {
      return { exito: true, mensaje: response.mensaje || 'Perfil actualizado correctamente' };
    } else {
      Alert.alert('Error', response?.mensaje || 'No se pudo actualizar el perfil');
      return { exito: false, mensaje: response?.mensaje || 'No se pudo actualizar el perfil' };
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    const mensajeError = error.message || 'Error al actualizar el perfil. Intenta nuevamente.';
    Alert.alert('Error', mensajeError);
    return { exito: false, mensaje: mensajeError };
  }
};

/**
 * Guarda la foto de perfil del usuario
 * @param {string} fotoUri - URI de la imagen seleccionada
 * @returns {Promise<object>} { exito: boolean, mensaje: string }
 */
export const guardarFotoPerfil = async (fotoUri) => {
  try {
    if (!fotoUri) {
      return { exito: false, mensaje: 'No hay foto para guardar' };
    }

    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return { exito: false, mensaje: 'No se pudo obtener la información del usuario' };
    }

    // Procesar la imagen: convertir a base64 y optimizar
    let imagenBase64 = null;
    let nombreArchivo = 'foto_perfil.jpg';

    try {
      // Redimensionar y comprimir la imagen para optimizar el tamaño
      const imagenProcesada = await ImageManipulator.manipulateAsync(
        fotoUri,
        [
          {
            resize: {
              width: 400,
              height: 400,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!imagenProcesada.base64) {
        throw new Error('No se pudo procesar la imagen');
      }

      imagenBase64 = imagenProcesada.base64;
      nombreArchivo = `foto_perfil_${usuario.UsuarioId}_${Date.now()}.jpg`;
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen. Intenta con otra foto.');
      return { exito: false, mensaje: 'Error al procesar la imagen' };
    }

    // Preparar datos para enviar al endpoint
    const datosParaEnviar = {
      Id_Usuario: usuario.UsuarioId,
      IMG_Archivo: nombreArchivo,
      IMG_Base64: imagenBase64,
      // No enviar Id_SolicitudServicio ni Id_Servicio (null/undefined)
      Id_SolicitudServicio: null,
      Id_Servicio: null,
    };

    console.log('📤 Enviando foto de perfil:', {
      usuario: datosParaEnviar.Id_Usuario,
      archivo: datosParaEnviar.IMG_Archivo,
      base64Length: imagenBase64?.length || 0,
    });

    // Llamar a la API
    const response = await post(API_ENDPOINTS.INSERTAR_IMAGEN, datosParaEnviar);

    // El controlador retorna { Exito = true }
    if (response && response.Exito) {
      console.log('✅ Foto de perfil guardada exitosamente');
      return { exito: true, mensaje: 'Foto de perfil guardada correctamente' };
    } else {
      Alert.alert('Error', 'No se pudo guardar la foto de perfil');
      return { exito: false, mensaje: 'No se pudo guardar la foto de perfil' };
    }
  } catch (error) {
    console.error('Error al guardar foto de perfil:', error);
    const mensajeError = error.message || 'Error al guardar la foto de perfil. Intenta nuevamente.';
    Alert.alert('Error', mensajeError);
    return { exito: false, mensaje: mensajeError };
  }
};

/**
 * Borra la foto de perfil del usuario
 * @returns {Promise<object>} { exito: boolean, mensaje: string }
 */
export const borrarFotoPerfil = async () => {
  try {
    // Obtener datos del usuario
    const usuario = await obtenerDatosUsuario();
    
    if (!usuario || !usuario.UsuarioId) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return { exito: false, mensaje: 'No se pudo obtener la información del usuario' };
    }

    // Preparar datos para enviar al endpoint
    const datosParaEnviar = {
      Id_Usuario: usuario.UsuarioId,
    };

    console.log('📤 Borrando foto de perfil:', {
      usuario: datosParaEnviar.Id_Usuario,
    });

    // Llamar a la API
    const response = await post(API_ENDPOINTS.BORRAR_IMAGEN_PERFIL, datosParaEnviar);

    // El controlador retorna { Exito = true/false, Mensaje = string }
    if (response && response.Exito) {
      console.log('✅ Foto de perfil borrada exitosamente');
      return { exito: true, mensaje: response.Mensaje || 'Foto de perfil borrada correctamente' };
    } else {
      Alert.alert('Error', response?.Mensaje || 'No se pudo borrar la foto de perfil');
      return { exito: false, mensaje: response?.Mensaje || 'No se pudo borrar la foto de perfil' };
    }
  } catch (error) {
    console.error('Error al borrar foto de perfil:', error);
    const mensajeError = error.message || 'Error al borrar la foto de perfil. Intenta nuevamente.';
    Alert.alert('Error', mensajeError);
    return { exito: false, mensaje: mensajeError };
  }
};

/**
 * Consulta los datos de un usuario específico por su ID
 * @param {number} idUsuario - ID del usuario a consultar
 * @returns {Promise<object|null>} Datos del usuario o null si hay error
 */
export const consultarUsuarioPorId = async (idUsuario) => {
  try {
    if (!idUsuario) {
      console.error('ID de usuario requerido');
      return null;
    }

    // Llamar al endpoint de consulta con el ID del usuario
    const response = await post(API_ENDPOINTS.CONSULTAR_USUARIO, {
      Id_Usuario: idUsuario,
    });

    // El controlador retorna un DataTable, puede venir como array o como objeto
    let usuarioData = null;
    
    if (Array.isArray(response) && response.length > 0) {
      usuarioData = response[0];
    } else if (response && typeof response === 'object') {
      if (response.Table && Array.isArray(response.Table) && response.Table.length > 0) {
        usuarioData = response.Table[0];
      } else if (response.Rows && Array.isArray(response.Rows) && response.Rows.length > 0) {
        usuarioData = response.Rows[0];
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        usuarioData = response.data[0];
      } else {
        // Si es un objeto directo con los campos
        usuarioData = response;
      }
    }

    if (!usuarioData) {
      console.error('No se encontraron datos del usuario');
      return null;
    }

    // Mapear los campos del DataTable a la estructura esperada
    const usuarioMapeado = {
      UsuarioId: usuarioData.Id_Usuario,
      Rut: usuarioData.US_RUN,
      Nombre: usuarioData.US_Nombre,
      Apellido: usuarioData.US_Apellido,
      Correo: usuarioData.US_Email,
      Telefono: usuarioData.US_Telefono,
      Biografia: usuarioData.US_Biografia,
      FechaNacimiento: usuarioData.US_FechaNac,
      FechaRegistro: usuarioData.US_FechaReg,
      Activo: usuarioData.US_Activo,
      Admin: usuarioData.US_Admin,
      ImagenPerfil: usuarioData.IMG_ImagenPerfil || null, // Imagen de perfil en base64
      CalificaUsuario: usuarioData.Califica_Usuario !== null && usuarioData.Califica_Usuario !== undefined ? usuarioData.Califica_Usuario : null, // Calificación como usuario
      CalificaProveedor: usuarioData.Califica_Proveedor !== null && usuarioData.Califica_Proveedor !== undefined ? usuarioData.Califica_Proveedor : null, // Calificación como proveedor
      Profesion: usuarioData.US_Profesion || null, // Profesión (nombre)
      Id_Profesion: usuarioData.Id_Profesion !== null && usuarioData.Id_Profesion !== undefined ? usuarioData.Id_Profesion : null, // ID de la profesión
      CantidadServicios: usuarioData.Cantidad_Servicios !== null && usuarioData.Cantidad_Servicios !== undefined ? usuarioData.Cantidad_Servicios : 0, // Cantidad de servicios realizados
    };

    return usuarioMapeado;
  } catch (error) {
    console.error('Error al consultar usuario por ID:', error);
    return null;
  }
};

