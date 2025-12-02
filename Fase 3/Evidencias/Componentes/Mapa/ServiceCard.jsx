import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Contextos/ThemeContext';
import { styles } from '../../Estilos/mapaStyles';

/**
 * Card que muestra la información resumida de un servicio seleccionado
 * @param {Object} solicitud - Datos de la solicitud de servicio
 * @param {Function} onClose - Función para cerrar el card
 * @param {Function} onViewDetails - Función para ver los detalles completos
 */
export default function ServiceCard({ solicitud, onClose, onViewDetails }) {
  const { theme, isDarkMode } = useTheme();

  if (!solicitud) return null;

  return (
    <View style={[styles.serviceCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <TouchableOpacity 
        style={styles.closeCardButton}
        onPress={onClose}
      >
        <Ionicons name="close" size={18} color={isDarkMode ? '#888' : '#999'} />
      </TouchableOpacity>
      
      <View style={styles.serviceCardHeader}>
        <View style={[styles.serviceCardIcon, { backgroundColor: solicitud.CAT_Color || theme.colors.primary }]}>
          <Ionicons name={solicitud.CAT_Icono || 'business'} size={20} color="#FFF" />
        </View>
        <View style={styles.serviceCardInfo}>
          <Text style={[styles.serviceCardTitle, { color: theme.colors.text }]} numberOfLines={2}>
            {solicitud.SS_Titulo}
          </Text>
          <Text style={[styles.serviceCardCategory, { color: isDarkMode ? '#AAA' : '#666' }]}>
            {solicitud.CAT_Nombre}
          </Text>
        </View>
      </View>

      <View style={styles.serviceCardDetails}>
        <View style={styles.serviceCardDetailRow}>
          <Ionicons name="location-outline" size={14} color={theme.colors.primary} />
          <Text style={[styles.serviceCardDetailText, { color: isDarkMode ? '#CCC' : '#555' }]} numberOfLines={1}>
            {solicitud.SS_Direccion || 'Sin dirección'}
          </Text>
        </View>
        <View style={styles.serviceCardDetailRow}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
          <Text style={[styles.serviceCardDetailText, { color: isDarkMode ? '#CCC' : '#555' }]}>
            {solicitud.SS_FechaServicio ? new Date(solicitud.SS_FechaServicio).toLocaleDateString() : 'Sin fecha'}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.detailsButton, { backgroundColor: theme.colors.primary }]}
        onPress={onViewDetails}
      >
        <Text style={styles.detailsButtonText}>Ver Detalles</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

