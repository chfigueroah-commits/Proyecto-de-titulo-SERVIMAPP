// Funciones para formatear campos de entrada

/**
 * Formatea un RUT chileno con guión
 * @param {string} texto - Texto ingresado por el usuario
 * @param {function} setRut - Función para actualizar el estado del RUT
 */
export const formatearRUT = (texto, setRut) => {
  // Eliminar caracteres no permitidos (solo números, k y K)
  let rut = texto.replace(/[^0-9kK]/g, '');
  
  // Limitar a 9 caracteres
  if (rut.length > 9) rut = rut.slice(0, 9);
  
  // Formatear con guión
  if (rut.length > 1) {
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    setRut(`${cuerpo}-${dv}`);
  } else {
    setRut(rut);
  }
};

/**
 * Formatea una fecha en formato DD/MM/AAAA
 * @param {string} texto - Texto ingresado por el usuario
 * @param {function} setFecha - Función para actualizar el estado de la fecha
 */
export const formatearFecha = (texto, setFecha) => {
  // Eliminar caracteres no numéricos
  let fecha = texto.replace(/\D/g, '');
  
  // Limitar a 8 caracteres (DDMMAAAA)
  if (fecha.length > 8) fecha = fecha.slice(0, 8);
  
  // Formatear como DD/MM/AAAA
  if (fecha.length >= 5) {
    setFecha(`${fecha.slice(0, 2)}/${fecha.slice(2, 4)}/${fecha.slice(4)}`);
  } else if (fecha.length >= 3) {
    setFecha(`${fecha.slice(0, 2)}/${fecha.slice(2)}`);
  } else {
    setFecha(fecha);
  }
};

/**
 * Formatea un número de teléfono (solo números, máx 9 dígitos)
 * @param {string} texto - Texto ingresado por el usuario
 * @param {function} setTelefono - Función para actualizar el estado del teléfono
 */
export const formatearTelefono = (texto, setTelefono) => {
  // Eliminar caracteres no numéricos
  let tel = texto.replace(/\D/g, '');
  
  // Limitar a 9 caracteres
  if (tel.length > 9) tel = tel.slice(0, 9);
  
  setTelefono(tel);
};

/**
 * Convierte una fecha de formato DD/MM/AAAA a YYYY-MM-DD para la API
 * @param {string} fechaFormateada - Fecha en formato DD/MM/AAAA
 * @returns {string} Fecha en formato YYYY-MM-DD o string vacío si es inválida
 */
export const convertirFechaParaAPI = (fechaFormateada) => {
  if (!fechaFormateada || fechaFormateada.length !== 10) {
    return '';
  }
  
  const partes = fechaFormateada.split('/');
  if (partes.length !== 3) {
    return '';
  }
  
  const [dia, mes, anio] = partes;
  
  // Validar que sean números válidos
  if (!dia || !mes || !anio || anio.length !== 4) {
    return '';
  }
  
  // Formato YYYY-MM-DD
  return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

/**
 * Formatea el RUT solo con guión para enviar a la API
 * @param {string} rut - RUT sin formato o con formato parcial
 * @returns {string} RUT formateado como 12345678-9 (solo con guión)
 */
export const formatearRUTParaAPI = (rut) => {
  // Limpiar el RUT (eliminar todo excepto números y K)
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  if (rutLimpio.length < 2) {
    return rut;
  }
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Solo agregar el guión, sin puntos
  return `${cuerpo}-${dv}`;
};

