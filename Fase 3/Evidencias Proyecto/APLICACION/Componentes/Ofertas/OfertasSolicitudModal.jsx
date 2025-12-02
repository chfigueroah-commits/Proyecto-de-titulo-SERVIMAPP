import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Contextos/ThemeContext';
import { styles } from '../../Estilos/solicitudesStyles';
import { listarOfertasSolicitud, rechazarOferta, aceptarOferta } from '../../Funciones/solicitudes';
import PerfilUsuarioModal from './PerfilUsuarioModal';

/**
 * Modal que muestra las ofertas recibidas para una solicitud de servicio
 * @param {boolean} visible - Si el modal está visible o no
 * @param {Object} solicitud - Datos de la solicitud de servicio
 * @param {Function} onClose - Función para cerrar el modal
 * @param {Function} onOfertaAceptada - Función callback que se ejecuta cuando se acepta una oferta exitosamente
 */
export default function OfertasSolicitudModal({ visible, solicitud, onClose, onOfertaAceptada }) {
  const { theme, isDarkMode } = useTheme();
  const [ofertas, setOfertas] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(false);
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [idUsuarioSeleccionado, setIdUsuarioSeleccionado] = useState(null);
  const [rechazandoOferta, setRechazandoOferta] = useState(null);
  const [aceptandoOferta, setAceptandoOferta] = useState(null);

  useEffect(() => {
    if (visible && solicitud?.Id_SolicitudServicio) {
      cargarOfertas();
    } else {
      setOfertas([]);
    }
  }, [visible, solicitud?.Id_SolicitudServicio]);

  const cargarOfertas = async () => {
    if (!solicitud?.Id_SolicitudServicio) return;
    
    try {
      setCargandoOfertas(true);
      const ofertasData = await listarOfertasSolicitud(solicitud.Id_SolicitudServicio);
      setOfertas(ofertasData);
    } catch (error) {
      console.error('Error al cargar ofertas:', error);
    } finally {
      setCargandoOfertas(false);
    }
  };

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
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleRechazarOferta = async (oferta) => {
    Alert.alert(
      'Rechazar Oferta',
      `¿Estás seguro de que deseas rechazar esta oferta?\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              setRechazandoOferta(oferta.Id_Oferta);
              const resultado = await rechazarOferta(oferta.Id_Oferta);
              
              if (resultado.exito) {
                // Recargar las ofertas
                await cargarOfertas();
                Alert.alert('Éxito', 'La oferta ha sido rechazada correctamente.');
              }
            } catch (error) {
              console.error('Error al rechazar oferta:', error);
            } finally {
              setRechazandoOferta(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleAceptarOferta = async (oferta) => {
    Alert.alert(
      'Aceptar Oferta',
      `¿Estás seguro de que deseas aceptar esta oferta por ${formatearMonto(oferta.OF_Monto)}?\n\nAl aceptar, se creará el servicio y no podrás aceptar otras ofertas para esta solicitud.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, aceptar',
          onPress: async () => {
            try {
              setAceptandoOferta(oferta.Id_Oferta);
              const resultado = await aceptarOferta(solicitud.Id_SolicitudServicio, oferta.Id_Oferta);
              
              if (resultado.exito) {
                // Ejecutar callback si existe (para actualizar solicitudes)
                if (onOfertaAceptada) {
                  await onOfertaAceptada();
                }
                
                Alert.alert(
                  '¡Oferta Aceptada!',
                  'La oferta ha sido aceptada correctamente. El servicio ha sido creado.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Cerrar el modal
                        onClose();
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Error al aceptar oferta:', error);
            } finally {
              setAceptandoOferta(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
              Ofertas Recibidas
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>


          {/* Contenido del modal */}
          {cargandoOfertas ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                Cargando ofertas...
              </Text>
            </View>
          ) : ofertas.length === 0 ? (
            <View style={[styles.emptyContainer, { paddingHorizontal: 20, paddingVertical: 40 }]}>
              <Ionicons name="pricetag-outline" size={64} color={isDarkMode ? '#555' : '#CCC'} />
              <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999', textAlign: 'center', paddingHorizontal: 20 }]}>
                No hay ofertas recibidas
              </Text>
              <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#AAA', textAlign: 'center', paddingHorizontal: 20 }]}>
                Las ofertas aparecerán aquí cuando los proveedores oferten por tu servicio
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <FlatList
                data={ofertas}
                keyExtractor={(item) => item.Id_Oferta?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                <View style={[styles.ofertaCardSolicitud, { 
                  backgroundColor: theme.colors.card, 
                  borderColor: theme.colors.border 
                }]}>
                  {/* Header de la oferta */}
                  <View style={[styles.ofertaCardHeader, { borderBottomColor: theme.colors.border }]}>
                    <View style={styles.ofertaCardHeaderLeft}>
                      <View style={[
                        styles.ofertaBadge,
                        { backgroundColor: theme.colors.primary }
                      ]}>
                        <Ionicons name="pricetag" size={13} color="#FFF" />
                        <Text style={styles.ofertaBadgeText}>
                          #{item.Id_Oferta}
                        </Text>
                      </View>
                      <View style={[styles.ofertaFechaContainer, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }]}>
                        <Ionicons name="calendar-outline" size={13} color={isDarkMode ? '#AAA' : '#666'} />
                        <Text style={[styles.ofertaFechaText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                          {formatearFecha(item.OF_Fecha)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Información del proveedor */}
                  {item.OF_Usuario && (
                    <TouchableOpacity
                      style={[
                        styles.proveedorContainer,
                        {
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                        }
                      ]}
                      onPress={() => {
                        if (item.Id_Usuario_OF) {
                          setIdUsuarioSeleccionado(item.Id_Usuario_OF);
                          setModalPerfilVisible(true);
                        }
                      }}
                      activeOpacity={0.7}
                      disabled={!item.Id_Usuario_OF}
                    >
                      <View style={styles.proveedorInfo}>
                        <Ionicons name="person" size={18} color={theme.colors.primary} />
                        <Text style={[styles.proveedorNombre, { color: theme.colors.text }]}>
                          {item.OF_Usuario}
                        </Text>
                        {item.Id_Usuario_OF && (
                          <>
                            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#888' : '#666'} style={{ marginLeft: 8 }} />
                            <Text style={[styles.verPerfilText, { color: isDarkMode ? '#888' : '#666', marginLeft: 4 }]}>
                              Ver perfil
                            </Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Monto */}
                  <View style={[styles.montoContainer, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }]}>
                    <Text style={[styles.montoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                      Monto
                    </Text>
                    <Text style={[styles.montoValue, { color: theme.colors.primary }]}>
                      {formatearMonto(item.OF_Monto)}
                    </Text>
                  </View>

                  {/* Comentario */}
                  {item.OF_Comentario && (
                    <View style={[styles.comentarioContainer, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }]}>
                      <Ionicons name="chatbubble-outline" size={16} color={isDarkMode ? '#888' : '#666'} />
                      <Text style={[styles.comentarioText, { color: theme.colors.text }]}>
                        {item.OF_Comentario}
                      </Text>
                    </View>
                  )}

                  {/* Botones de acción */}
                  <View style={[styles.ofertaCardActions, { borderTopColor: theme.colors.border, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)' }]}>
                    <TouchableOpacity 
                      style={[
                        styles.rechazarButton,
                        {
                          opacity: rechazandoOferta === item.Id_Oferta ? 0.5 : 1
                        }
                      ]}
                      onPress={() => handleRechazarOferta(item)}
                      disabled={rechazandoOferta === item.Id_Oferta}
                      activeOpacity={0.8}
                    >
                      {rechazandoOferta === item.Id_Oferta ? (
                        <ActivityIndicator size="small" color="#C62828" />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={20} color="#C62828" />
                          <Text style={styles.rechazarButtonText}>Rechazar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.aceptarButton, 
                        { 
                          backgroundColor: theme.colors.primary,
                          opacity: aceptandoOferta === item.Id_Oferta ? 0.5 : 1
                        }
                      ]}
                      onPress={() => handleAceptarOferta(item)}
                      disabled={aceptandoOferta === item.Id_Oferta}
                      activeOpacity={0.8}
                    >
                      {aceptandoOferta === item.Id_Oferta ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                          <Text style={styles.aceptarButtonText}>Aceptar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.ofertasList}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            />
            </View>
          )}

          {/* Botón de acción fijo */}
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

