// Funciones para almacenamiento seguro de datos
import * as SecureStore from 'expo-secure-store';

/**
 * Claves para almacenar datos en SecureStore
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  TOKEN_TYPE: 'token_type',
};

/**
 * Guarda el token de acceso de forma segura
 * @param {string} token - Token de acceso
 */
export const guardarToken = async (token) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
    throw error;
  }
};

/**
 * Obtiene el token de acceso almacenado
 * @returns {Promise<string|null>} Token de acceso o null si no existe
 */
export const obtenerToken = async () => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

/**
 * Guarda el tipo de token
 * @param {string} tokenType - Tipo de token (ej: "Bearer")
 */
export const guardarTokenType = async (tokenType) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_TYPE, tokenType);
  } catch (error) {
    console.error('Error al guardar el tipo de token:', error);
    throw error;
  }
};

/**
 * Obtiene el tipo de token almacenado
 * @returns {Promise<string|null>} Tipo de token o null si no existe
 */
export const obtenerTokenType = async () => {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_TYPE);
  } catch (error) {
    console.error('Error al obtener el tipo de token:', error);
    return null;
  }
};

/**
 * Guarda los datos del usuario de forma segura
 * @param {object} userData - Datos del usuario
 */
export const guardarDatosUsuario = async (userData) => {
  try {
    // Excluir ImagenPerfil del guardado en SecureStore (es muy grande para SecureStore)
    // La imagen se obtendrá directamente de la API cuando sea necesario
    const userDataSinImagen = { ...userData };
    delete userDataSinImagen.ImagenPerfil;
    
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(userDataSinImagen));
  } catch (error) {
    console.error('Error al guardar los datos del usuario:', error);
    throw error;
  }
};

/**
 * Obtiene los datos del usuario almacenados
 * @returns {Promise<object|null>} Datos del usuario o null si no existen
 */
export const obtenerDatosUsuario = async () => {
  try {
    const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    return null;
  }
};

/**
 * Elimina todos los datos almacenados (útil para logout)
 */
export const limpiarDatos = async () => {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_TYPE);
  } catch (error) {
    console.error('Error al limpiar los datos:', error);
    throw error;
  }
};

/**
 * Verifica si el usuario está autenticado (tiene token)
 * @returns {Promise<boolean>} true si está autenticado
 */
export const estaAutenticado = async () => {
  try {
    const token = await obtenerToken();
    return token !== null;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

