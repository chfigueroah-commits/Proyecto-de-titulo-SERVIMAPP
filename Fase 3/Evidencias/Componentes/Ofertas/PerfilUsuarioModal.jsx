import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Contextos/ThemeContext';
import { consultarUsuarioPorId } from '../../Funciones/usuario';
import { styles } from '../../Estilos/solicitudesStyles';

/**
 * Modal que muestra el perfil de un usuario (proveedor que hizo la oferta)
 * @param {boolean} visible - Si el modal está visible o no
 * @param {number} idUsuario - ID del usuario a mostrar
 * @param {Function} onClose - Función para cerrar el modal
 */
export default function PerfilUsuarioModal({ visible, idUsuario, onClose }) {
  const { theme, isDarkMode } = useTheme();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (visible && idUsuario) {
      cargarPerfilUsuario();
    } else {
      setUsuario(null);
    }
  }, [visible, idUsuario]);

  const cargarPerfilUsuario = async () => {
    if (!idUsuario) return;
    
    try {
      setCargando(true);
      const datosUsuario = await consultarUsuarioPorId(idUsuario);
      setUsuario(datosUsuario);
    } catch (error) {
      console.error('Error al cargar perfil del usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalDetalleContent, { backgroundColor: theme.colors.card }]}>
          {/* Header del modal */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Perfil del Proveedor
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          {cargando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Cargando perfil...
              </Text>
            </View>
          ) : usuario ? (
            <ScrollView style={styles.detalleContainer} showsVerticalScrollIndicator={false}>
              {/* Avatar y nombre - Header mejorado */}
              <View style={[styles.perfilUsuarioHeaderCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                {usuario.ImagenPerfil ? (
                  <Image 
                    source={{ uri: `data:image/png;base64,${usuario.ImagenPerfil}` }} 
                    style={styles.perfilUsuarioAvatar}
                  />
                ) : (
                  <View style={[styles.perfilUsuarioAvatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.perfilUsuarioAvatarText}>
                      {usuario.Nombre?.charAt(0)}{usuario.Apellido?.charAt(0)}
                    </Text>
                  </View>
                )}
                <Text style={[styles.perfilUsuarioNombre, { color: theme.colors.text }]}>
                  {usuario.Nombre} {usuario.Apellido}
                </Text>
                {usuario.Profesion && (
                  <View style={[styles.profesionBadge, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
                    <Ionicons name="school" size={14} color={theme.colors.primary} />
                    <Text style={[styles.profesionBadgeText, { color: theme.colors.primary }]}>
                      {usuario.Profesion}
                    </Text>
                  </View>
                )}
              </View>

              {/* Estadísticas - Cantidad de Servicios */}
              {usuario.CantidadServicios !== null && usuario.CantidadServicios !== undefined && usuario.CantidadServicios > 0 && (
                <View style={styles.detalleSection}>
                  <View style={[styles.perfilEstadisticaCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <View style={[styles.perfilEstadisticaIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} />
                    </View>
                    <View style={styles.perfilEstadisticaContent}>
                      <Text style={[styles.perfilEstadisticaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Servicios Completados
                      </Text>
                      <Text style={[styles.perfilEstadisticaValor, { color: theme.colors.text }]}>
                        {usuario.CantidadServicios}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Calificaciones - Cards individuales */}
              <View style={styles.detalleSection}>
                <Text style={[styles.perfilSeccionTitulo, { color: theme.colors.text }]}>
                  Calificaciones
                </Text>
                
                <View style={styles.perfilCalificacionesGrid}>
                  {/* Calificación como Usuario */}
                  {usuario.CalificaUsuario !== null && usuario.CalificaUsuario !== undefined && (
                    <View style={[styles.perfilCalificacionCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                      <View style={[styles.perfilCalificacionIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                        <Ionicons name="person" size={24} color="#4CAF50" />
                      </View>
                      <Text style={[styles.perfilCalificacionLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Como Usuario
                      </Text>
                      <View style={styles.perfilCalificacionValor}>
                        <Ionicons name="star" size={20} color="#FFB300" />
                        <Text style={[styles.perfilCalificacionNumero, { color: '#FFB300' }]}>
                          {Math.round(usuario.CalificaUsuario)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Calificación como Proveedor */}
                  {usuario.CalificaProveedor !== null && usuario.CalificaProveedor !== undefined && (
                    <View style={[styles.perfilCalificacionCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                      <View style={[styles.perfilCalificacionIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name="briefcase" size={24} color={theme.colors.primary} />
                      </View>
                      <Text style={[styles.perfilCalificacionLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Como Proveedor
                      </Text>
                      <View style={styles.perfilCalificacionValor}>
                        <Ionicons name="star" size={20} color="#FFB300" />
                        <Text style={[styles.perfilCalificacionNumero, { color: '#FFB300' }]}>
                          {Math.round(usuario.CalificaProveedor)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Biografía */}
              {usuario.Biografia && (
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Sobre {usuario.Nombre?.split(' ')[0]}
                    </Text>
                  </View>
                  <View style={[styles.perfilBiografiaCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                      {usuario.Biografia}
                    </Text>
                  </View>
                </View>
              )}

              {/* Espacio para el botón fijo */}
              <View style={{ height: 100 }} />
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <Ionicons name="person-outline" size={64} color={isDarkMode ? '#555' : '#CCC'} />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999' }]}>
                No se pudo cargar el perfil del usuario
              </Text>
            </View>
          )}

          {/* Botón de cerrar fijo */}
          <View style={[styles.detalleFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={[styles.detalleButton, { backgroundColor: theme.colors.primary }]}
              onPress={onClose}
            >
              <Ionicons name="close-circle" size={20} color="#FFF" />
              <Text style={[styles.detalleButtonText, { color: '#FFF' }]}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

