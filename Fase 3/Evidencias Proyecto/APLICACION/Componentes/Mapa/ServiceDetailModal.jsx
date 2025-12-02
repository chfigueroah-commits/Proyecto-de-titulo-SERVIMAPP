import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Contextos/ThemeContext';
import { styles } from '../../Estilos/mapaStyles';
import { obtenerImagenesSolicitud } from '../../Funciones/solicitudes';
import PerfilUsuarioModal from '../Ofertas/PerfilUsuarioModal';

/**
 * Modal que muestra los detalles completos de un servicio
 * @param {boolean} visible - Si el modal está visible o no
 * @param {Object} solicitud - Datos de la solicitud de servicio
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onOfertar - Función para ofertar por el servicio
 * @param {Object} ofertaExistente - Datos de la oferta existente del usuario (si existe)
 */
export default function ServiceDetailModal({ visible, solicitud, onClose, onOfertar, ofertaExistente }) {
  const { theme, isDarkMode } = useTheme();
  const [imagenes, setImagenes] = useState([]);
  const [cargandoImagenes, setCargandoImagenes] = useState(false);
  
  // Estados para modal de imagen completa
  const [modalImagenCompletaVisible, setModalImagenCompletaVisible] = useState(false);
  const [imagenCompletaUri, setImagenCompletaUri] = useState(null);

  // Estados para modal de perfil del usuario
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [idUsuarioSeleccionado, setIdUsuarioSeleccionado] = useState(null);

  // Cargar imágenes cuando se abre el modal
  useEffect(() => {
    if (visible && solicitud?.Id_SolicitudServicio) {
      cargarImagenes();
    } else {
      setImagenes([]);
    }
  }, [visible, solicitud?.Id_SolicitudServicio]);

  const cargarImagenes = async () => {
    if (!solicitud?.Id_SolicitudServicio) return;
    
    try {
      setCargandoImagenes(true);
      const imagenesData = await obtenerImagenesSolicitud(solicitud.Id_SolicitudServicio);
      setImagenes(imagenesData || []);
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
      setImagenes([]);
    } finally {
      setCargandoImagenes(false);
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
            Detalles del Servicio
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

              {/* Imágenes */}
              {imagenes.length > 0 && (
                <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="images-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Imágenes</Text>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.modalImagesContainer}
                  >
                    {imagenes.map((imagen, index) => (
                      <TouchableOpacity
                        key={imagen.Id_Imagen || index}
                        style={styles.modalImageWrapper}
                        onPress={() => {
                          setImagenCompletaUri(`data:image/png;base64,${imagen.IMG_Imagen}`);
                          setModalImagenCompletaVisible(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: `data:image/png;base64,${imagen.IMG_Imagen}` }}
                          style={styles.modalImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {cargandoImagenes && (
                <View style={[styles.modalSection, { backgroundColor: theme.colors.card, alignItems: 'center', paddingVertical: 20 }]}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.modalSectionContent, { color: isDarkMode ? '#AAA' : '#666', marginTop: 8 }]}>
                    Cargando imágenes...
                  </Text>
                </View>
              )}

              {/* Descripción */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Descripción</Text>
                </View>
                <Text style={[styles.modalSectionContent, { color: isDarkMode ? '#CCC' : '#555' }]}>
                  {solicitud.SS_Descripcion || 'Sin descripción'}
                </Text>
              </View>

              {/* Información general */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Información</Text>
                </View>
                
                <View style={styles.modalInfoRow}>
                  <Ionicons name="location" size={18} color={theme.colors.primary} />
                  <View style={styles.modalInfoContent}>
                    <Text style={[styles.modalInfoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Dirección</Text>
                    <Text style={[styles.modalInfoValue, { color: theme.colors.text }]}>
                      {solicitud.SS_Direccion || 'Sin dirección'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalInfoRow}>
                  <Ionicons name="calendar" size={18} color={theme.colors.primary} />
                  <View style={styles.modalInfoContent}>
                    <Text style={[styles.modalInfoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Fecha del Servicio</Text>
                    <Text style={[styles.modalInfoValue, { color: theme.colors.text }]}>
                      {solicitud.SS_FechaServicio ? new Date(solicitud.SS_FechaServicio).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalInfoRow}>
                  <Ionicons name="time" size={18} color={theme.colors.primary} />
                  <View style={styles.modalInfoContent}>
                    <Text style={[styles.modalInfoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Publicado</Text>
                    <Text style={[styles.modalInfoValue, { color: theme.colors.text }]}>
                      {solicitud.SS_FechaCreacion ? new Date(solicitud.SS_FechaCreacion).toLocaleDateString() : 'Sin fecha'}
                    </Text>
                  </View>
                </View>

                {/* Información del usuario que publicó */}
                {(solicitud.US_Nombre || solicitud.Id_Usuario) && (
                  <TouchableOpacity
                    style={[styles.modalInfoRow, { marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}
                    onPress={() => {
                      if (solicitud.Id_Usuario) {
                        setIdUsuarioSeleccionado(solicitud.Id_Usuario);
                        setModalPerfilVisible(true);
                      }
                    }}
                    activeOpacity={0.7}
                    disabled={!solicitud.Id_Usuario}
                  >
                    <Ionicons name="person" size={18} color={theme.colors.primary} />
                    <View style={[styles.modalInfoContent, { flex: 1 }]}>
                      <Text style={[styles.modalInfoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Publicado por</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.modalInfoValue, { color: theme.colors.text, flex: 1 }]}>
                          {solicitud.US_Nombre || 'Usuario'}
                        </Text>
                        {solicitud.Id_Usuario && (
                          <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#888' : '#666'} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Botones de acción */}
        <View style={[styles.modalActions, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: theme.colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cerrar</Text>
          </TouchableOpacity>
          {ofertaExistente ? (
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.colors.primary }]}
              onPress={() => onOfertar(ofertaExistente)}
            >
              <Text style={styles.modalButtonTextPrimary}>Ver Oferta</Text>
              <Ionicons name="eye" size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.colors.primary }]}
              onPress={() => onOfertar(null)}
            >
              <Text style={styles.modalButtonTextPrimary}>Ofertar</Text>
              <Ionicons name="pricetag" size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal de Imagen Completa */}
      <Modal
        visible={modalImagenCompletaVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalImagenCompletaVisible(false)}
      >
        <View style={styles.modalImagenCompletaOverlay}>
          <TouchableOpacity
            style={styles.modalImagenCompletaCloseButton}
            onPress={() => setModalImagenCompletaVisible(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {imagenCompletaUri && (
            <Image
              source={{ uri: imagenCompletaUri }}
              style={styles.modalImagenCompleta}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Modal de Perfil de Usuario */}
      <PerfilUsuarioModal
        visible={modalPerfilVisible}
        idUsuario={idUsuarioSeleccionado}
        onClose={() => {
          setModalPerfilVisible(false);
          setIdUsuarioSeleccionado(null);
        }}
      />
    </Modal>
  );
}

