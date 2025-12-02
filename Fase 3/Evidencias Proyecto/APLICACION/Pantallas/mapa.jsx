import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, InteractionManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/mapaStyles';
import { listarSolicitudesGeneral, cargarCatalogos, crearOferta, listarOfertasUsuario } from '../Funciones/solicitudes';
import { REGION_INICIAL, DARK_MAP_STYLE } from '../Constantes/mapaConstantes';
import MarcadorMapa from '../Componentes/Mapa/MarcadorMapa';
import ServiceCard from '../Componentes/Mapa/ServiceCard';
import ServiceDetailModal from '../Componentes/Mapa/ServiceDetailModal';
import CategorySelector from '../Componentes/Mapa/CategorySelector';
import OfertaModal from '../Componentes/Ofertas/OfertaModal';

export default function MapaScreen({ route }) {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const mapRef = useRef(null);

  // Estados del mapa y ubicación
  const [region, setRegion] = useState(REGION_INICIAL);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Estados de solicitudes de servicio
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);
  
  // Estados de ofertas del usuario
  const [ofertasUsuario, setOfertasUsuario] = useState([]);

  // Estados de categorías
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mostrarSelectorCategoria, setMostrarSelectorCategoria] = useState(true);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  // Estados de marcador seleccionado y modal
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalOferta, setMostrarModalOferta] = useState(false);

  // ============================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================

  const cargarCategorias = useCallback(async () => {
    try {
      setCargandoCategorias(true);
      const { categorias: categoriasData } = await cargarCatalogos();
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setCargandoCategorias(false);
    }
  }, []);

  const cargarSolicitudes = async () => {
    try {
      setCargandoSolicitudes(true);
      
      InteractionManager.runAfterInteractions(async () => {
        // Cargar solicitudes y ofertas en paralelo
        const [solicitudesData, ofertasData] = await Promise.all([
          listarSolicitudesGeneral(),
          listarOfertasUsuario()
        ]);
        
        // Guardar ofertas del usuario
        setOfertasUsuario(ofertasData);
        
        if (categoriaSeleccionada && categoriaSeleccionada !== 'todos') {
          const solicitudesFiltradas = solicitudesData.filter(
            sol => sol.Id_Categoria === categoriaSeleccionada
          );
          setSolicitudes(solicitudesFiltradas);
          console.log(`✓ Solicitudes encontradas: ${solicitudesFiltradas.length}`);
        } else {
          setSolicitudes(solicitudesData);
          console.log(`✓ Solicitudes encontradas: ${solicitudesData.length}`);
        }
        setCargandoSolicitudes(false);
      });
    } catch (error) {
      console.error('Error al cargar solicitudes en el mapa:', error);
      setCargandoSolicitudes(false);
    }
  };

  // ============================================================
  // FUNCIONES DE UBICACIÓN
  // ============================================================

  const obtenerUbicacion = useCallback(async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationLoading(false);
        setIsInitialLoading(false);
        Alert.alert(
          'Ubicación desactivada',
          'Para ver servicios cerca de ti, activa los permisos de ubicación en la configuración de la app.',
          [{ text: 'Entendido' }]
        );
        return;
      }

      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        )
      ]);

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      setLocationLoading(false);
    } catch (error) {
      console.log('Aviso: No se pudo obtener ubicación', error.message);
      
      Alert.alert(
        'Aviso',
        'No pudimos obtener tu ubicación en este momento. Puedes navegar el mapa manualmente o presionar el botón de ubicación para intentar nuevamente.',
        [{ text: 'Entendido' }]
      );
      
      setLocationLoading(false);
    }
  }, []);

  const recentrarMapa = useCallback(() => {
    if (userLocation && mapRef.current) {
      const newRegion = {
        ...userLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
    } else {
      obtenerUbicacion();
    }
  }, [userLocation, obtenerUbicacion]);

  // ============================================================
  // FUNCIONES DE INTERACCIÓN
  // ============================================================

  const seleccionarCategoria = useCallback((idCategoria) => {
    setCategoriaSeleccionada(idCategoria);
    setMostrarSelectorCategoria(false);
  }, []);

  const cerrarSelectorCategoria = useCallback(() => {
    // Si no hay categoría seleccionada, seleccionar "todos" por defecto
    if (categoriaSeleccionada === null) {
      setCategoriaSeleccionada('todos');
    }
    setMostrarSelectorCategoria(false);
  }, [categoriaSeleccionada]);

  const handleMarkerPress = useCallback((solicitud) => {
    setSolicitudSeleccionada(solicitud);
  }, []);

  const abrirModalDetalles = useCallback(() => {
    setMostrarModal(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setMostrarModal(false);
    setSolicitudSeleccionada(null);
  }, []);

  const handleOfertar = useCallback((ofertaExistente) => {
    setMostrarModal(false);
    if (ofertaExistente) {
      // Si hay una oferta existente, navegar a la pestaña de Ofertas con el ID de la oferta
      navigation.navigate('Ofertas', { ofertaId: ofertaExistente.Id_Oferta });
    } else {
      // Si no hay oferta, mostrar el modal para crear una nueva
      setMostrarModalOferta(true);
    }
  }, [navigation]);

  const handleCerrarOferta = useCallback(() => {
    setMostrarModalOferta(false);
  }, []);


  const handleEnviarOferta = useCallback(async (datosOferta) => {
    if (!solicitudSeleccionada) {
      Alert.alert('Error', 'No hay una solicitud seleccionada');
      return;
    }

    // Llamar a la función para crear la oferta
    const resultado = await crearOferta(
      solicitudSeleccionada.Id_SolicitudServicio,
      datosOferta.monto,
      datosOferta.comentario
    );

    if (resultado.exito) {
      // Recargar ofertas del usuario para actualizar el estado
      const ofertasActualizadas = await listarOfertasUsuario();
      setOfertasUsuario(ofertasActualizadas);
      
      Alert.alert(
        'Oferta Enviada',
        `Tu oferta de $${datosOferta.monto.toLocaleString()} ha sido enviada exitosamente.`,
        [
          {
            text: 'OK',
            onPress: () => setMostrarModalOferta(false)
          }
        ]
      );
    }
  }, [solicitudSeleccionada]);

  // Función para obtener la oferta del usuario para una solicitud específica
  const obtenerOfertaUsuario = useCallback((idSolicitud) => {
    if (!idSolicitud) return null;
    const oferta = ofertasUsuario.find(
      oferta => oferta.Id_SolicitudServicio === idSolicitud
    );
    return oferta || null;
  }, [ofertasUsuario]);

  // ============================================================
  // EFECTOS
  // ============================================================

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Si viene una categoría desde el Home, seleccionarla automáticamente
  useEffect(() => {
    if (route?.params?.categoriaId) {
      setCategoriaSeleccionada(route.params.categoriaId);
      setMostrarSelectorCategoria(false);
    }
  }, [route?.params?.categoriaId]);

  useEffect(() => {
    if (categoriaSeleccionada !== null) {
      cargarSolicitudes();
      setIsInitialLoading(false);
    }
  }, [categoriaSeleccionada]);

  // ============================================================
  // MARCADORES PROCESADOS
  // ============================================================

  const marcadores = useMemo(() => {
    const markers = solicitudes
      .filter(sol => sol.SS_Latitud && sol.SS_Longitud)
      .map(sol => ({
        id: sol.Id_SolicitudServicio,
        titulo: sol.SS_Titulo,
        descripcion: `${sol.SS_Direccion || 'Sin dirección'}`,
        coordinate: {
          latitude: parseFloat(sol.SS_Latitud),
          longitude: parseFloat(sol.SS_Longitud),
        },
        icono: sol.CAT_Icono || 'business',
        color: sol.CAT_Color || theme.colors.primary,
        data: sol
      }));
    
    return markers;
  }, [solicitudes, theme.colors.primary]);

  const mapStyle = useMemo(() => isDarkMode ? DARK_MAP_STYLE : [], [isDarkMode]);

  // ============================================================
  // RENDERIZADO
  // ============================================================

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Selector de categorías */}
      <CategorySelector
        visible={mostrarSelectorCategoria}
        categorias={categorias}
        loading={cargandoCategorias}
        onSelect={seleccionarCategoria}
        onClose={cerrarSelectorCategoria}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="map" size={24} color={theme.colors.primary} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mapa de Servicios</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.syncButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={cargarSolicitudes}
              disabled={cargandoSolicitudes}
            >
              {cargandoSolicitudes ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="refresh" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.syncButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
              onPress={() => setMostrarSelectorCategoria(true)}
            >
              <Ionicons name="filter" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Loading inicial */}
      {isInitialLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Obteniendo tu ubicación...
          </Text>
          <Text style={[styles.loadingSubtext, { color: isDarkMode ? '#888' : '#666' }]}>
            Esto puede tomar unos segundos
          </Text>
        </View>
      ) : (
        <>
          {/* Mapa */}
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            customMapStyle={mapStyle}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            loadingEnabled={true}
            loadingIndicatorColor={theme.colors.primary}
          >
            {marcadores.map((marcador) => (
              <MarcadorMapa 
                key={marcador.id} 
                marcador={marcador} 
                onPress={handleMarkerPress}
              />
            ))}
          </MapView>

          {/* Indicador si no hay marcadores */}
          {marcadores.length === 0 && !cargandoSolicitudes && (
            <View style={[styles.noMarkersContainer, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="map-outline" size={48} color={theme.colors.primary} />
              <Text style={[styles.noMarkersText, { color: theme.colors.text }]}>
                No hay servicios en esta categoría
              </Text>
              <Text style={[styles.noMarkersSubtext, { color: isDarkMode ? '#888' : '#666' }]}>
                Selecciona otra categoría o prueba más tarde
              </Text>
            </View>
          )}

          {/* Indicador de carga de solicitudes */}
          {cargandoSolicitudes && (
            <View style={[styles.loadingMarkersContainer, { backgroundColor: theme.colors.card }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingMarkersText, { color: theme.colors.text }]}>
                Cargando servicios...
              </Text>
            </View>
          )}

          {/* Card de solicitud seleccionada */}
          {solicitudSeleccionada && !mostrarModal && (
            <ServiceCard
              solicitud={solicitudSeleccionada}
              onClose={() => setSolicitudSeleccionada(null)}
              onViewDetails={abrirModalDetalles}
            />
          )}

          {/* Modal de detalles */}
          <ServiceDetailModal
            visible={mostrarModal}
            solicitud={solicitudSeleccionada}
            onClose={cerrarModal}
            onOfertar={handleOfertar}
            ofertaExistente={solicitudSeleccionada ? obtenerOfertaUsuario(solicitudSeleccionada.Id_SolicitudServicio) : null}
          />

          {/* Modal de oferta */}
          <OfertaModal
            visible={mostrarModalOferta}
            solicitud={solicitudSeleccionada}
            onClose={handleCerrarOferta}
            onEnviar={handleEnviarOferta}
          />


          {/* Botón de recentrar */}
          <TouchableOpacity
            style={[styles.recenterButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={recentrarMapa}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="locate" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
