import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';

/**
 * Componente de marcador para el mapa
 * @param {Object} marcador - Datos del marcador
 * @param {Function} onPress - Función a ejecutar al presionar el marcador
 */
export default function MarcadorMapa({ marcador, onPress }) {
  return (
    <Marker
      coordinate={marcador.coordinate}
      pinColor={marcador.color || 'red'}
      onPress={() => onPress(marcador.data)}
    >
      {/* Callout vacío para deshabilitar el callout nativo */}
      <View style={{ width: 0, height: 0 }} />
    </Marker>
  );
}

