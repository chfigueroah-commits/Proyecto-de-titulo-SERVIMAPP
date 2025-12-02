import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/ofertasStyles';
import { listarOfertasUsuario, cargarCatalogos, eliminarOferta, cargarEstadosOfertas } from '../Funciones/solicitudes';

export default function OfertasScreen({ route }) {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Estados para ofertas
  const [ofertas, setOfertas] = useState([]);
  const [ofertasFiltradas, setOfertasFiltradas] = useState([]);
  const [cargandoOfertas, setCargandoOfertas] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [eliminandoOferta, setEliminandoOferta] = useState(null);
  
  // Estado del filtro (null = todas, o el Id_OfertaEstado específico)
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [mostrarSelectorEstado, setMostrarSelectorEstado] = useState(false);

  // Estados del modal de detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);

  // Estados para catálogos
  const [categorias, setCategorias] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [estadosOfertas, setEstadosOfertas] = useState([]);

  // Cargar ofertas y catálogos al montar el componente
  useEffect(() => {
    cargarMisOfertas();
    cargarDatosCatalogos();
    cargarEstados();
  }, []);

  // Actualizar datos cada vez que la pantalla recibe foco
  useFocusEffect(
    React.useCallback(() => {
      cargarEstados();
      cargarMisOfertas();
    }, [])
  );

  const cargarEstados = async () => {
    try {
      const estados = await cargarEstadosOfertas();
      setEstadosOfertas(estados);
    } catch (error) {
      console.error('Error cargando estados de ofertas:', error);
    }
  };

  const abrirDetalleOferta = (oferta) => {
    setOfertaSeleccionada(oferta);
    setModalDetalleVisible(true);
  };

  // Manejar navegación desde el mapa con ofertaId
  useEffect(() => {
    if (route?.params?.ofertaId && ofertas.length > 0) {
      const oferta = ofertas.find(o => o.Id_Oferta === route.params.ofertaId);
      if (oferta) {
        abrirDetalleOferta(oferta);
        // Limpiar el parámetro para evitar que se abra cada vez que se monte
        route.params.ofertaId = null;
      }
    }
  }, [route?.params?.ofertaId, ofertas]);

  const cargarDatosCatalogos = async () => {
    try {
      const { categorias, comunas } = await cargarCatalogos();
      setCategorias(categorias);
      setComunas(comunas);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const cargarMisOfertas = async () => {
    try {
      setCargandoOfertas(true);
      const ofertasData = await listarOfertasUsuario();
      setOfertas(ofertasData);
      console.log(`✓ Ofertas encontradas: ${ofertasData.length}`);
      aplicarFiltro(ofertasData, filtroEstado);
    } catch (error) {
      console.error('Error al cargar ofertas:', error);
    } finally {
      setCargandoOfertas(false);
      setRefrescando(false);
    }
  };

  const aplicarFiltro = (ofertasData, idEstado) => {
    if (idEstado === null) {
      setOfertasFiltradas(ofertasData);
    } else {
      const filtradas = ofertasData.filter(oferta => oferta.Id_OfertaEstado === idEstado);
      setOfertasFiltradas(filtradas);
    }
  };

  const cambiarFiltro = (estado) => {
    setFiltroEstado(estado);
    aplicarFiltro(ofertas, estado);
  };

  // Obtener información del estado por ID
  const obtenerEstadoPorId = (idEstado) => {
    return estadosOfertas.find(estado => estado.Id_OfertaEstado === idEstado);
  };

  const obtenerTextoEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    return estado ? estado.OE_Nombre : 'Desconocido';
  };

  const obtenerColorEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    const nombreEstado = estado ? estado.OE_Nombre : '';
    
    // Colores basados en el nombre del estado
    switch(nombreEstado?.toUpperCase()) {
      case 'ACEPTADA': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'ABIERTA': return { bg: '#E3F2FD', text: '#1976D2' };
      case 'RECHAZADA': return { bg: '#FFEBEE', text: '#C62828' };
      case 'CANCELADA': return { bg: '#FFEBEE', text: '#C62828' };
      case 'SOLICITUD CANCELADA': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#F5F5F5', text: '#757575' };
    }
  };

  const obtenerIconoEstado = (idEstado) => {
    const estado = obtenerEstadoPorId(idEstado);
    const nombreEstado = estado ? estado.OE_Nombre : '';
    
    switch(nombreEstado?.toUpperCase()) {
      case 'ACEPTADA': return 'checkmark-circle';
      case 'ABIERTA': return 'time';
      case 'RECHAZADA': return 'close-circle';
      case 'CANCELADA': return 'close-circle';
      case 'SOLICITUD CANCELADA': return 'close-circle';
      default: return 'help-circle';
    }
  };

  // Verificar si una oferta permite interacción basado en OE_Modifica
  const noPermiteInteraccion = (oferta) => {
    const estado = obtenerEstadoPorId(oferta?.Id_OfertaEstado);
    // Si el estado tiene OE_Modifica = false, no permite interacción
    return estado ? !estado.OE_Modifica : true;
  };

  const refrescarOfertas = async () => {
    setRefrescando(true);
    // Recargar estados y ofertas
    await Promise.all([
      cargarEstados(),
      cargarMisOfertas()
    ]);
  };

  const handleCancelarOferta = async (oferta) => {
    Alert.alert(
      'Cancelar Oferta',
      `¿Estás seguro de que deseas cancelar esta oferta?\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setEliminandoOferta(oferta.Id_Oferta);
              const resultado = await eliminarOferta(oferta.Id_Oferta);
              
              if (resultado.exito) {
                // Actualizar la lista de ofertas
                await cargarMisOfertas();
                Alert.alert('Éxito', 'La oferta ha sido cancelada correctamente.');
              }
            } catch (error) {
              console.error('Error al cancelar oferta:', error);
            } finally {
              setEliminandoOferta(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatearFecha = (fechaISO) => {
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

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(monto);
  };

  const formatearFechaISO = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(cat => cat.Id_Categoria === idCategoria);
    return categoria ? categoria.CAT_Nombre : 'Sin categoría';
  };

  const obtenerNombreComuna = (idComuna) => {
    const comuna = comunas.find(com => com.Id_Comuna === idComuna);
    return comuna ? comuna.COM_Nombre : 'Sin comuna';
  };

  const cerrarDetalleOferta = () => {
    setModalDetalleVisible(false);
    setOfertaSeleccionada(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Ionicons name="pricetag" size={24} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mis Ofertas</Text>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={[styles.content, { 
        backgroundColor: theme.colors.background,
        paddingBottom: 0,
        marginBottom: -(63 + insets.bottom), // Compensar el espacio del tab bar
      }]}>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#B0B0B0' : '#666' }]}>
          Gestiona tus ofertas de servicio
        </Text>
        
        {/* Filtro por estado - Combo Box */}
        <View style={styles.filtrosContainer}>
          <TouchableOpacity
            style={[
              styles.filtroSelector,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }
            ]}
            onPress={() => setMostrarSelectorEstado(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filtroSelectorContent}>
              <Ionicons name="filter" size={18} color={theme.colors.primary} />
              <Text style={[styles.filtroSelectorText, { color: theme.colors.text }]}>
                {filtroEstado === null 
                  ? 'Todos los estados' 
                  : obtenerTextoEstado(filtroEstado)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#888' : '#666'} />
          </TouchableOpacity>
        </View>

        {/* Modal selector de estado */}
        <Modal
          visible={mostrarSelectorEstado}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMostrarSelectorEstado(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMostrarSelectorEstado(false)}
          >
            <View style={[styles.modalSelectorContent, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalSelectorHeader, { borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.modalSelectorTitle, { color: theme.colors.text }]}>
                  Filtrar por estado
                </Text>
                <TouchableOpacity onPress={() => setMostrarSelectorEstado(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={[{ Id_OfertaEstado: null, OE_Nombre: 'Todos' }, ...estadosOfertas]}
                keyExtractor={(item) => item.Id_OfertaEstado?.toString() || 'todos'}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.estadoSelectorItem,
                      {
                        backgroundColor: filtroEstado === item.Id_OfertaEstado 
                          ? theme.colors.primary + '15' 
                          : 'transparent',
                        borderBottomColor: theme.colors.border,
                      }
                    ]}
                    onPress={() => {
                      cambiarFiltro(item.Id_OfertaEstado);
                      setMostrarSelectorEstado(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.estadoSelectorText,
                        {
                          color: filtroEstado === item.Id_OfertaEstado 
                            ? theme.colors.primary 
                            : theme.colors.text,
                          fontWeight: filtroEstado === item.Id_OfertaEstado ? '600' : '400',
                        }
                      ]}
                    >
                      {item.OE_Nombre}
                    </Text>
                    {filtroEstado === item.Id_OfertaEstado && (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.estadoSelectorList}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Lista de ofertas */}
        {cargandoOfertas ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Cargando ofertas...
            </Text>
          </View>
        ) : ofertasFiltradas.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={refrescarOfertas}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          >
            <Ionicons name="pricetag-outline" size={64} color={isDarkMode ? '#555' : '#CCC'} />
            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999' }]}>
              {filtroEstado === null 
                ? 'No tienes ofertas realizadas'
                : `No hay ofertas ${obtenerTextoEstado(filtroEstado).toLowerCase()}s`
              }
            </Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#AAA' }]}>
              {filtroEstado === null 
                ? 'Realiza ofertas desde el mapa'
                : 'Intenta con otro filtro'
              }
            </Text>
            <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#AAA', marginTop: 8, fontSize: 12 }]}>
              Arrastra hacia abajo para actualizar
            </Text>
          </ScrollView>
        ) : (
          <FlatList
            data={ofertasFiltradas}
            keyExtractor={(item) => item.Id_Oferta?.toString() || Math.random().toString()}
            renderItem={({ item }) => {
              const estadoColors = obtenerColorEstado(item.Id_OfertaEstado);
              const estadoTexto = obtenerTextoEstado(item.Id_OfertaEstado);
              const estadoIcono = obtenerIconoEstado(item.Id_OfertaEstado);
              
              return (
              <View style={[styles.ofertaCard, { 
                backgroundColor: theme.colors.card, 
                borderColor: theme.colors.border 
              }]}>
                {/* Header de la tarjeta */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                      {item.SS_Titulo || `Oferta #${item.Id_Oferta}`}
                    </Text>
                  </View>
                  {/* Badge de estado */}
                  <View style={[
                    styles.estadoBadge,
                    { 
                      backgroundColor: estadoColors.bg,
                      borderColor: estadoColors.text,
                    }
                  ]}>
                    <View style={[
                      styles.estadoDot,
                      { backgroundColor: estadoColors.text }
                    ]} />
                    <Text style={[
                      styles.estadoText,
                      { color: estadoColors.text }
                    ]}>
                      {estadoTexto}
                    </Text>
                  </View>
                </View>

                {/* Monto */}
                <View style={[styles.montoContainer, { 
                  backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                  borderLeftColor: theme.colors.primary 
                }]}>
                  <Text style={[styles.montoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                    Monto ofertado
                  </Text>
                  <Text style={[styles.montoValue, { color: theme.colors.primary }]}>
                    {formatearMonto(item.OF_Monto)}
                  </Text>
                </View>

                {/* Comentario */}
                {item.OF_Comentario && (
                  <View style={styles.comentarioContainer}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={isDarkMode ? '#888' : '#666'} />
                    <Text style={[styles.comentarioText, { color: theme.colors.text }]}>
                      {item.OF_Comentario}
                    </Text>
                  </View>
                )}

                {/* Footer con fecha */}
                <View style={styles.cardFooter}>
                  <Ionicons name="calendar-outline" size={14} color={isDarkMode ? '#888' : '#999'} />
                  <Text style={[styles.fechaText, { color: isDarkMode ? '#888' : '#999' }]}>
                    Enviada el {formatearFecha(item.OF_Fecha)}
                  </Text>
                </View>

                {/* Botones de acción */}
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[
                      styles.cancelarOfertaButton, 
                      { 
                        borderTopColor: theme.colors.border, 
                        borderRightColor: theme.colors.border, 
                        borderRightWidth: 1,
                        opacity: noPermiteInteraccion(item) || eliminandoOferta === item.Id_Oferta ? 0.5 : 1
                      }
                    ]}
                    onPress={() => {
                      if (!noPermiteInteraccion(item)) {
                        handleCancelarOferta(item);
                      }
                    }}
                    disabled={noPermiteInteraccion(item) || eliminandoOferta === item.Id_Oferta}
                  >
                    {eliminandoOferta === item.Id_Oferta ? (
                      <ActivityIndicator size="small" color="#C62828" />
                    ) : (
                      <>
                        <Ionicons 
                          name="close-circle" 
                          size={18} 
                          color={noPermiteInteraccion(item) ? '#999' : '#C62828'} 
                        />
                        <Text style={[
                          styles.cancelarOfertaText,
                          { color: noPermiteInteraccion(item) ? '#999' : '#C62828' }
                        ]}>
                          {noPermiteInteraccion(item) ? 'No disponible' : 'Cancelar'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.verDetalleButton, 
                      { 
                        borderTopColor: theme.colors.border,
                        opacity: noPermiteInteraccion(item) ? 0.5 : 1
                      }
                    ]}
                    onPress={() => {
                      if (!noPermiteInteraccion(item)) {
                        abrirDetalleOferta(item);
                      }
                    }}
                    disabled={noPermiteInteraccion(item)}
                  >
                    <Text style={[
                      styles.verDetalleText, 
                      { color: noPermiteInteraccion(item) ? '#999' : theme.colors.primary }
                    ]}>
                      Ver detalles
                    </Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={18} 
                      color={noPermiteInteraccion(item) ? '#999' : theme.colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              );
            }}
            contentContainerStyle={[styles.ofertasList, { paddingBottom: 63 + insets.bottom + 20 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={refrescarOfertas}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>

      {/* Modal de Detalle de Oferta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalDetalleVisible}
        onRequestClose={cerrarDetalleOferta}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDetalleContent, { backgroundColor: theme.colors.card }]}>
            {/* Header del modal */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Detalle de Oferta
              </Text>
              <TouchableOpacity onPress={cerrarDetalleOferta}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {ofertaSeleccionada && (
              <ScrollView style={styles.detalleContainer} showsVerticalScrollIndicator={false}>
                {/* Título Principal con Monto */}
                <View style={styles.detalleTituloContainer}>
                  <View style={styles.detalleTituloHeader}>
                    <Text style={[styles.detalleTitulo, { color: theme.colors.text }]}>
                      {ofertaSeleccionada.SS_Titulo}
                    </Text>
                  </View>
                  <View style={[styles.montoContainerDetalle, { 
                    backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                    borderLeftColor: theme.colors.primary 
                  }]}>
                    <Text style={[styles.montoLabelDetalle, { color: isDarkMode ? '#AAA' : '#666' }]}>
                      Monto de la Oferta
                    </Text>
                    <Text style={[styles.montoValueDetalle, { color: theme.colors.primary }]}>
                      {formatearMonto(ofertaSeleccionada.OF_Monto)}
                    </Text>
                  </View>
                  <View style={styles.detalleCategoriaComuna}>
                    <View style={[styles.detalleCategoriaItem, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' 
                    }]}>
                      <Ionicons name="pricetag" size={14} color={theme.colors.primary} />
                      <Text style={[styles.detalleCategoriaTexto, { color: theme.colors.text }]}>
                        {obtenerNombreCategoria(ofertaSeleccionada.Id_Categoria)}
                      </Text>
                    </View>
                    <Text style={[styles.detalleSeparador, { color: isDarkMode ? '#666' : '#CCC' }]}>•</Text>
                    <View style={[styles.detalleCategoriaItem, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' 
                    }]}>
                      <Ionicons name="location" size={14} color={theme.colors.primary} />
                      <Text style={[styles.detalleCategoriaTexto, { color: theme.colors.text }]}>
                        {obtenerNombreComuna(ofertaSeleccionada.Id_Comuna)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Divisor */}
                <View style={[styles.detalleDivisor, { backgroundColor: theme.colors.border }]} />

                {/* Comentario de la Oferta */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Tu Comentario
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { 
                    color: theme.colors.text,
                    fontStyle: ofertaSeleccionada.OF_Comentario ? 'normal' : 'italic',
                    opacity: ofertaSeleccionada.OF_Comentario ? 0.9 : 0.5
                  }]}>
                    {ofertaSeleccionada.OF_Comentario || 'Sin comentario'}
                  </Text>
                </View>

                {/* Descripción del Servicio */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="document-text" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Descripción del Servicio
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                    {ofertaSeleccionada.SS_Descripcion}
                  </Text>
                </View>

                {/* Dirección */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="location" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Dirección del Servicio
                    </Text>
                  </View>
                  <Text style={[styles.detalleTexto, { color: theme.colors.text }]}>
                    {ofertaSeleccionada.SS_Direccion}
                  </Text>
                </View>

                {/* Estado de la Oferta */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="information-circle" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Estado de la Oferta
                    </Text>
                  </View>
                  <View style={[
                    styles.estadoBadgeDetalle,
                    { 
                      backgroundColor: obtenerColorEstado(ofertaSeleccionada.Id_OfertaEstado).bg,
                      borderColor: obtenerColorEstado(ofertaSeleccionada.Id_OfertaEstado).text
                    }
                  ]}>
                    <View style={[
                      styles.estadoDotDetalle,
                      { backgroundColor: obtenerColorEstado(ofertaSeleccionada.Id_OfertaEstado).text }
                    ]} />
                    <Text style={[
                      styles.estadoTextDetalle,
                      { color: obtenerColorEstado(ofertaSeleccionada.Id_OfertaEstado).text }
                    ]}>
                      {obtenerTextoEstado(ofertaSeleccionada.Id_OfertaEstado)}
                    </Text>
                  </View>
                </View>

                {/* Fechas */}
                <View style={styles.detalleSection}>
                  <View style={styles.detalleSectionHeader}>
                    <Ionicons name="calendar" size={22} color={theme.colors.primary} />
                    <Text style={[styles.detalleSectionTitle, { color: theme.colors.text }]}>
                      Fechas Importantes
                    </Text>
                  </View>
                  
                  <View style={styles.detalleFechasContainer}>
                    <View style={[styles.detalleFechaItem, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                    }]}>
                      <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Fecha del Servicio:
                      </Text>
                      <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                        {formatearFechaISO(ofertaSeleccionada.SS_FechaServicio)}
                      </Text>
                    </View>

                    <View style={[styles.detalleFechaItem, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                    }]}>
                      <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                        Fecha de la Oferta:
                      </Text>
                      <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                        {formatearFechaISO(ofertaSeleccionada.OF_Fecha)}
                      </Text>
                    </View>

                    {ofertaSeleccionada.SS_FechaLimiteOF && (
                      <View style={[styles.detalleFechaItem, { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                      }]}>
                        <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                          Fecha Límite para Ofertas:
                        </Text>
                        <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                          {formatearFechaISO(ofertaSeleccionada.SS_FechaLimiteOF)}
                        </Text>
                      </View>
                    )}

                    {ofertaSeleccionada.SS_FechaExpira && (
                      <View style={[styles.detalleFechaItem, { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' 
                      }]}>
                        <Text style={[styles.detalleFechaLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>
                          Fecha de Expiración:
                        </Text>
                        <Text style={[styles.detalleFechaValor, { color: theme.colors.text }]}>
                          {formatearFechaISO(ofertaSeleccionada.SS_FechaExpira)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Espacio para los botones fijos */}
                <View style={{ height: 0 }} />
              </ScrollView>
            )}

            {/* Botón de acción fijo */}
            <View style={[styles.detalleFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={[styles.detalleButton, { backgroundColor: theme.colors.primary }]}
                onPress={cerrarDetalleOferta}
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
    </View>
  );
}
