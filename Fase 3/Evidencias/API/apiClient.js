// Cliente HTTP para hacer peticiones a la API
import { API_BASE_URL, getDefaultHeaders, getAuthHeaders } from './config';
import { obtenerToken, obtenerTokenType, limpiarDatos } from './storage';
import { navigationRef } from '../Navegacion/navigationRef';

/**
 * Realiza una petición GET autenticada
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<object>} Respuesta de la API
 */
export const get = async (endpoint) => {
  try {
    const token = await obtenerToken();
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      // Si el error es de autenticación (401 o 403), limpiar datos y redirigir al login
      if (response.status === 401 || response.status === 403) {
        await manejarErrorAutenticacion();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en petición GET:', error);
    throw error;
  }
};

/**
 * Realiza una petición POST autenticada
 * @param {string} endpoint - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise<object>} Respuesta de la API
 */
export const post = async (endpoint, data) => {
  try {
    const token = await obtenerToken();
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Si el error es de autenticación (401 o 403), limpiar datos y redirigir al login
      if (response.status === 401 || response.status === 403) {
        await manejarErrorAutenticacion();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en petición POST:', error);
    throw error;
  }
};

/**
 * Realiza una petición PUT autenticada
 * @param {string} endpoint - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise<object>} Respuesta de la API
 */
export const put = async (endpoint, data) => {
  try {
    const token = await obtenerToken();
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Si el error es de autenticación (401 o 403), limpiar datos y redirigir al login
      if (response.status === 401 || response.status === 403) {
        await manejarErrorAutenticacion();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en petición PUT:', error);
    throw error;
  }
};

/**
 * Realiza una petición DELETE autenticada
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<object>} Respuesta de la API
 */
export const del = async (endpoint) => {
  try {
    const token = await obtenerToken();
    
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      // Si el error es de autenticación (401 o 403), limpiar datos y redirigir al login
      if (response.status === 401 || response.status === 403) {
        await manejarErrorAutenticacion();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en petición DELETE:', error);
    throw error;
  }
};

/**
 * Realiza una petición sin autenticación
 * @param {string} endpoint - Endpoint de la API
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {object} data - Datos a enviar (opcional)
 * @returns {Promise<object>} Respuesta de la API
 */
export const publicRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const options = {
      method,
      headers: getDefaultHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en petición pública:', error);
    throw error;
  }
};

/**
 * Maneja errores de autenticación (token expirado o inválido)
 * Limpia los datos del usuario y redirige al login
 */
const manejarErrorAutenticacion = async () => {
  try {
    console.log('Token expirado o inválido. Limpiando sesión...');
    
    // Limpiar todos los datos almacenados
    await limpiarDatos();
    
    // Redirigir al login usando la referencia de navegación
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  } catch (error) {
    console.error('Error al manejar error de autenticación:', error);
  }
};

