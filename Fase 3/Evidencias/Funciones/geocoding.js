// Funciones para geocodificación de direcciones
import * as Location from 'expo-location';

/**
 * Busca direcciones y obtiene coordenadas usando geocoding
 * @param {string} texto - Texto de la dirección a buscar
 * @returns {Promise<Array>} Array de sugerencias con dirección y coordenadas
 */
export const buscarDirecciones = async (texto) => {
  if (!texto || texto.trim().length < 3) {
    return [];
  }

  try {
    // Buscar variaciones de la dirección en Chile
    const variaciones = [
      `${texto}, Santiago, Chile`,
      `${texto}, Chile`,
      `${texto}, Región Metropolitana, Chile`,
    ];

    const promesas = variaciones.map(async (direccion) => {
      try {
        const resultado = await Location.geocodeAsync(direccion);
        if (resultado && resultado.length > 0) {
          return {
            direccion: direccion.replace(', Chile', ''),
            latitude: resultado[0].latitude,
            longitude: resultado[0].longitude,
          };
        }
      } catch (error) {
        return null;
      }
      return null;
    });

    const resultados = await Promise.all(promesas);
    const sugerencias = resultados.filter(r => r !== null);
    
    // Eliminar duplicados basados en coordenadas similares
    const sugerenciasUnicas = [];
    sugerencias.forEach(sug => {
      const yaExiste = sugerenciasUnicas.some(
        s => Math.abs(s.latitude - sug.latitude) < 0.001 && 
             Math.abs(s.longitude - sug.longitude) < 0.001
      );
      if (!yaExiste) {
        sugerenciasUnicas.push(sug);
      }
    });

    console.log(`🔍 Búsqueda de direcciones: "${texto}" - ${sugerenciasUnicas.length} resultados encontrados`);
    return sugerenciasUnicas;
  } catch (error) {
    console.error('❌ Error buscando direcciones:', error.message);
    return [];
  }
};

/**
 * Obtiene las coordenadas de una dirección específica
 * @param {string} direccion - Dirección a geocodificar
 * @returns {Promise<object>} Objeto con latitude y longitude, o null si no encuentra
 */
export const obtenerCoordenadas = async (direccion) => {
  try {
    const direccionCompleta = `${direccion}, Chile`;
    const resultado = await Location.geocodeAsync(direccionCompleta);
    
    if (resultado && resultado.length > 0) {
      return {
        latitude: resultado[0].latitude,
        longitude: resultado[0].longitude,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo coordenadas:', error);
    return null;
  }
};

/**
 * Obtiene la dirección desde coordenadas (geocoding inverso)
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<string>} Dirección formateada o null si no encuentra
 */
export const obtenerDireccionDesdeCoordenadas = async (latitude, longitude) => {
  try {
    const resultado = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (resultado && resultado.length > 0) {
      const { street, streetNumber, city, region, country } = resultado[0];
      
      // Formatear la dirección
      const partes = [
        street && streetNumber ? `${street} ${streetNumber}` : street,
        city,
        region,
        country
      ].filter(Boolean);
      
      return partes.join(', ');
    }
    
    return null;
  } catch (error) {
    console.error('Error en geocoding inverso:', error);
    return null;
  }
};

