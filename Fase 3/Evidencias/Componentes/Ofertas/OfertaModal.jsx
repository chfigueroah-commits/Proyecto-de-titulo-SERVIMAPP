import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Contextos/ThemeContext';
import { styles } from '../../Estilos/mapaStyles';

/**
 * Modal para enviar una oferta por un servicio
 * @param {boolean} visible - Si el modal está visible o no
 * @param {Object} solicitud - Datos de la solicitud de servicio
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onEnviar - Función para enviar la oferta
 */
export default function OfertaModal({ visible, solicitud, onClose, onEnviar }) {
  const { theme, isDarkMode } = useTheme();
  const [monto, setMonto] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    // Validar monto
    if (!monto || monto.trim() === '') {
      Alert.alert('Error', 'Ingresa un monto para tu oferta');
      return;
    }

    // Validar que el monto sea un número válido
    const montoNumero = parseFloat(monto.replace(/[^0-9,.-]/g, '').replace(',', '.'));
    if (isNaN(montoNumero) || montoNumero <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    setEnviando(true);

    // Aquí se llamará a onEnviar con los datos
    try {
      await onEnviar({
        monto: montoNumero,
        comentario: comentario.trim(),
      });
      
      // Limpiar formulario
      setMonto('');
      setComentario('');
    } catch (error) {
      console.error('Error al enviar oferta:', error);
    } finally {
      setEnviando(false);
    }
  };

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
            Hacer Oferta
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Contenido del modal */}
        {solicitud && (
          <View style={[styles.modalOfertaContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalOfertaServiceInfo, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalOfertaServiceIcon, { backgroundColor: solicitud.CAT_Color || theme.colors.primary }]}>
                <Ionicons name={solicitud.CAT_Icono || 'business'} size={24} color="#FFF" />
              </View>
              <View style={styles.modalOfertaServiceDetails}>
                <Text style={[styles.modalOfertaServiceTitle, { color: theme.colors.text }]} numberOfLines={2}>
                  {solicitud.SS_Titulo}
                </Text>
                <Text style={[styles.modalOfertaServiceCategory, { color: isDarkMode ? '#AAA' : '#666' }]}>
                  {solicitud.CAT_Nombre}
                </Text>
              </View>
            </View>

            <View style={[styles.modalOfertaForm, { backgroundColor: theme.colors.card }]}>
              <View style={styles.modalOfertaInputGroup}>
                <Text style={[styles.modalOfertaLabel, { color: theme.colors.text }]}>Monto ($)</Text>
                <View style={[styles.modalOfertaInputWrapper, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                  <Text style={{ fontSize: 18, color: theme.colors.text, marginRight: 4 }}>$</Text>
                  <TextInput
                    style={[styles.modalOfertaInput, { color: theme.colors.text }]}
                    placeholder="0"
                    placeholderTextColor={isDarkMode ? '#888' : '#CCC'}
                    value={monto}
                    onChangeText={setMonto}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.modalOfertaInputGroup}>
                <Text style={[styles.modalOfertaLabel, { color: theme.colors.text }]}>Comentario (Opcional)</Text>
                <TextInput
                  style={[styles.modalOfertaTextArea, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
                  placeholder="Agrega un comentario sobre tu oferta..."
                  placeholderTextColor={isDarkMode ? '#888' : '#CCC'}
                  value={comentario}
                  onChangeText={setComentario}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        )}

        {/* Botones de acción */}
        <View style={[styles.modalActions, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: theme.colors.border }]}
            onPress={onClose}
            disabled={enviando}
          >
            <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.colors.primary }]}
            onPress={handleEnviar}
            disabled={enviando}
          >
            {enviando ? (
              <Text style={styles.modalButtonTextPrimary}>Enviando...</Text>
            ) : (
              <>
                <Text style={styles.modalButtonTextPrimary}>Enviar Oferta</Text>
                <Ionicons name="send" size={18} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

