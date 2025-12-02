import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Contextos/ThemeContext';
import { styles } from '../../Estilos/mapaStyles';

/**
 * Modal que muestra los detalles de una oferta existente del usuario
 * @param {boolean} visible - Si el modal está visible o no
 * @param {Object} oferta - Datos de la oferta
 * @param {Object} solicitud - Datos de la solicitud de servicio relacionada
 * @param {Function} onClose - Función para cerrar el modal
 */
export default function VerOfertaModal({ visible, oferta, solicitud, onClose }) {
  const { theme, isDarkMode } = useTheme();

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha';
    try {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch(estado) {
      case 1: return 'Aceptada';
      case 2: return 'Pendiente';
      case 3: return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const obtenerColorEstado = (estado) => {
    switch(estado) {
      case 1: return { bg: '#E8F5E9', text: '#2E7D32' }; // Verde para aceptada
      case 2: return { bg: '#FFF3E0', text: '#F57C00' }; // Naranja para pendiente
      case 3: return { bg: '#FFEBEE', text: '#C62828' }; // Rojo para cancelada
      default: return { bg: '#F5F5F5', text: '#757575' };
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch(estado) {
      case 1: return 'checkmark-circle';
      case 2: return 'time';
      case 3: return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (!oferta) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        
        {/* Header del modal */}
        <View style={[styles.modalHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.modalHeaderTitle, { color: theme.colors.text }]}>
            Mi Oferta
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Contenido del modal */}
        <ScrollView style={styles.modalContent}>
          {solicitud && (
            <>
              {/* Encabezado del servicio */}
              <View style={[styles.modalServiceHeader, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.modalServiceIcon, { backgroundColor: solicitud.CAT_Color || theme.colors.primary }]}>
                  <Ionicons name={solicitud.CAT_Icono || 'business'} size={32} color="#FFF" />
                </View>
                <Text style={[styles.modalServiceTitle, { color: theme.colors.text }]}>
                  {solicitud.SS_Titulo}
                </Text>
                <Text style={[styles.modalServiceCategory, { color: isDarkMode ? '#AAA' : '#666' }]}>
                  {solicitud.CAT_Nombre}
                </Text>
              </View>

              {/* Información de la oferta */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="pricetag" size={20} color={theme.colors.primary} />
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Monto de la Oferta</Text>
                </View>
                <Text style={[styles.modalSectionContent, { color: theme.colors.primary, fontSize: 24, fontWeight: 'bold', marginTop: 8 }]}>
                  {formatearMonto(oferta.OF_Monto)}
                </Text>
              </View>

              {/* Comentario de la oferta */}
              {oferta.OF_Comentario && (
                <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Comentario</Text>
                  </View>
                  <Text style={[styles.modalSectionContent, { color: isDarkMode ? '#CCC' : '#555' }]}>
                    {oferta.OF_Comentario}
                  </Text>
                </View>
              )}

              {/* Fecha de la oferta */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Fecha de la Oferta</Text>
                </View>
                <Text style={[styles.modalSectionContent, { color: isDarkMode ? '#CCC' : '#555' }]}>
                  {formatearFecha(oferta.OF_Fecha)}
                </Text>
              </View>

              {/* Información de estado */}
              {oferta.Estado && (
                <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Estado</Text>
                  </View>
                  <View style={[
                    styles.estadoBadgeDetalle,
                    { backgroundColor: obtenerColorEstado(oferta.Estado).bg }
                  ]}>
                    <Ionicons 
                      name={obtenerIconoEstado(oferta.Estado)} 
                      size={18} 
                      color={obtenerColorEstado(oferta.Estado).text}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[
                      styles.estadoTextDetalle,
                      { color: obtenerColorEstado(oferta.Estado).text }
                    ]}>
                      {obtenerTextoEstado(oferta.Estado)}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Botones de acción */}
        <View style={[styles.modalActions, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.colors.primary, flex: 1 }]}
            onPress={onClose}
          >
            <Text style={styles.modalButtonTextPrimary}>Cerrar</Text>
            <Ionicons name="checkmark-circle" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

