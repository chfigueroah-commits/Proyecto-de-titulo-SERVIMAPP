// Funciones de autenticación y registro
import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from '../API/config';
import { guardarToken, guardarTokenType, guardarDatosUsuario, limpiarDatos } from '../API/storage';
import { convertirFechaParaAPI, formatearRUTParaAPI } from './formateadores';

/**
 * Maneja el inicio de sesión del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {object} navigation - Objeto de navegación de React Navigation
 * @returns {Promise<object>} Resultado del login con success y mensaje
 */
export const handleLogin = async (email, password, navigation) => {
  try {
    // Validación básica
    if (!email || !password) {
      return {
        success: false,
        message: 'Por favor completa todos los campos'
      };
    }

    // Validar formato de email
    if (!validarEmail(email)) {
      return {
        success: false,
        message: 'El formato del email no es válido'
      };
    }

    console.log('Iniciando sesión...');
    console.log('URL:', `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`);

    // Llamar a la API de autenticación con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify({
        Email: email,
        Password: password
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Respuesta recibida. Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.log('Error de API:', errorData);
      return {
        success: false,
        message: errorData?.message || `Error ${response.status}: Credenciales incorrectas. Verifica tu email y contraseña.`
      };
    }

    const data = await response.json();
    console.log('Login exitoso. Usuario:', data.usuario?.Nombre);

    // Guardar el token y datos del usuario de forma segura
    await guardarToken(data.access_token);
    await guardarTokenType(data.token_type);
    await guardarDatosUsuario(data.usuario);

    console.log('Datos guardados. Navegando a Home...');

    // Navegar a la pantalla principal
    if (navigation) {
      navigation.navigate('Home');
    }

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: data
    };
    
  } catch (error) {
    console.error('Error en login:', error);
    
    // Detectar tipo de error
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Tiempo de espera agotado. Verifica tu conexión y que la API esté corriendo.'
      };
    }
    
    if (error.message.includes('Network request failed')) {
      return {
        success: false,
        message: 'No se pudo conectar al servidor. Verifica:\n1. Que la API esté corriendo\n2. Que estés en la misma red WiFi\n3. La URL de la API en config.js'
      };
    }

    return {
      success: false,
      message: `Error de conexión: ${error.message}`
    };
  }
};

/**
 * Maneja el cierre de sesión del usuario
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
export const handleLogout = async (navigation) => {
  try {
    // Limpiar todos los datos almacenados
    await limpiarDatos();
    
    console.log('Sesión cerrada exitosamente');
    
    // Resetear el stack de navegación y navegar al login
    // Esto previene que el usuario pueda volver atrás después del logout
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    
    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return {
      success: false,
      message: 'Error al cerrar sesión'
    };
  }
};

/**
 * Maneja el registro de un nuevo usuario
 * @param {object} datosUsuario - Objeto con los datos del usuario
 * @param {object} navigation - Objeto de navegación de React Navigation
 * @returns {Promise<object>} Resultado del registro con success y mensaje
 */
export const handleRegistro = async (datosUsuario, navigation) => {
  // PASO 1: VALIDACIONES - Se ejecutan TODAS antes de hacer el POST
  const { nombre, apellido, rut, correo, contrasena, telefono, fechaNacimiento } = datosUsuario;
  
  // Validación 1: Campos obligatorios no vacíos
  if (!nombre || !apellido || !rut || !correo || !contrasena) {
    console.log('Validación fallida: Campos obligatorios vacíos');
    return {
      success: false,
      message: 'Por favor completa todos los campos obligatorios'
    };
  }

  // Validación 2: Nombre y apellido no solo espacios
  if (nombre.trim().length === 0 || apellido.trim().length === 0) {
    console.log('Validación fallida: Nombre o apellido solo espacios');
    return {
      success: false,
      message: 'El nombre y apellido no pueden estar vacíos'
    };
  }

  // Validación 3: Formato de email
  if (!validarEmail(correo)) {
    console.log('Validación fallida: Email inválido');
    return {
      success: false,
      message: 'El formato del email no es válido'
    };
  }

  // Validación 4: RUT válido
  if (!validarRUT(rut)) {
    console.log('Validación fallida: RUT inválido');
    return {
      success: false,
      message: 'El RUT ingresado no es válido'
    };
  }
  
  // Validación 5: Contraseña mínimo 8 caracteres
  if (!contrasena || contrasena.length < 8) {
    console.log('Validación fallida: Contraseña muy corta');
    return {
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres'
    };
  }

  // Validación 6: Teléfono 9 dígitos (si se proporciona)
  if (telefono && telefono.replace(/\D/g, '').length !== 9) {
    console.log('Validación fallida: Teléfono inválido');
    return {
      success: false,
      message: 'El teléfono debe tener 9 dígitos'
    };
  }

  // Validación 7: Fecha completa (si se proporciona)
  if (fechaNacimiento && fechaNacimiento.length > 0 && fechaNacimiento.length !== 10) {
    console.log('Validación fallida: Fecha incompleta');
    return {
      success: false,
      message: 'La fecha de nacimiento debe estar completa (DD/MM/AAAA)'
    };
  }

  console.log('Todas las validaciones pasaron');
  
  // PASO 2: FORMATEAR DATOS
  const rutFormateado = formatearRUTParaAPI(rut);
  const fechaFormateada = convertirFechaParaAPI(fechaNacimiento);
  
  // Validación 8: Fecha formateada correctamente
  if (!fechaFormateada && fechaNacimiento) {
    console.log('Validación fallida: Error al formatear fecha');
    return {
      success: false,
      message: 'Formato de fecha inválido. Usa DD/MM/AAAA'
    };
  }
  
  const datosParaEnviar = {
    Nombre: nombre.trim(),
    Apellido: apellido.trim(),
    Rut: rutFormateado,
    Correo: correo.trim(),
    Contrasena: contrasena,
    Telefono: telefono || '',
    FechaNacimiento: fechaFormateada || ''
  };
  
  console.log('Datos preparados para enviar:', datosParaEnviar);
  console.log('URL:', `${API_BASE_URL}${API_ENDPOINTS.REGISTRO}`);
  
  // PASO 3: HACER EL POST A LA API
  try {
    console.log('Iniciando petición POST...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTRO}`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(datosParaEnviar),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('Respuesta recibida. Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.log('Error de API:', errorData);
      return {
        success: false,
        message: errorData?.message || `Error ${response.status}: Error al registrar usuario.`
      };
    }

    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    
    // La API devuelve { "exito": true } o { "exito": false }
    if (data.exito === true) {
      console.log('Registro exitoso - Navegando al Login');
      
      // Navegar al login
      if (navigation) {
        navigation.navigate('Login');
      }
      
      return {
        success: true,
        message: 'Registro exitoso. Ya puedes iniciar sesión.',
        data: data
      };
    } else {
      console.log('Usuario ya existe en la base de datos');
      return {
        success: false,
        message: 'El correo o RUT ya está registrado. Intenta con otro.'
      };
    }
    
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Detectar tipo de error
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Tiempo de espera agotado. Verifica tu conexión y que la API esté corriendo.'
      };
    }
    
    if (error.message.includes('Network request failed')) {
      return {
        success: false,
        message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
      };
    }
    
    return {
      success: false,
      message: `Error de conexión: ${error.message}`
    };
  }
};

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si el email es válido
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar (con o sin formato)
 * @returns {boolean} - true si el RUT es válido
 */
export const validarRUT = (rut) => {
  // Limpiar el RUT
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  if (rutLimpio.length < 2) return false;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toLowerCase();
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvCalculado = 11 - (suma % 11);
  const dvFinal = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'k' : dvCalculado.toString();
  
  return dv === dvFinal;
};

