import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/perfilStyles';
import { consultarUsuario } from '../Funciones/usuario';

export default function PerfilScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos cuando la pantalla recibe foco (para actualizar después de editar)
  useFocusEffect(
    React.useCallback(() => {
    cargarDatosUsuario();
    }, [])
  );

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      const datos = await consultarUsuario();
      if (datos) {
        setUsuario(datos);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.dark ? '#B0B0B0' : '#666' }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <View style={styles.avatarContainer}>
            {usuario?.ImagenPerfil ? (
              <Image 
                source={{ uri: `data:image/png;base64,${usuario.ImagenPerfil}` }} 
                style={styles.avatarImage}
              />
            ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>
                {usuario?.Nombre?.charAt(0)}{usuario?.Apellido?.charAt(0)}
              </Text>
            </View>
            )}
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {usuario?.Nombre} {usuario?.Apellido}
            </Text>
            <Text style={[styles.userEmail, { color: isDarkMode ? '#AAA' : '#666' }]}>{usuario?.Correo}</Text>
            {usuario?.Profesion && (
              <View style={[styles.profesionBadge, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
                <Ionicons name="school" size={14} color={theme.colors.primary} />
                <Text style={[styles.profesionBadgeText, { color: theme.colors.primary }]}>
                  {usuario.Profesion}
                </Text>
              </View>
            )}
          </View>
          
          {/* Botón de editar */}
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('EditarPerfil', { usuario })}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Estadísticas - Cantidad de Servicios */}
        {usuario?.CantidadServicios !== null && usuario?.CantidadServicios !== undefined && usuario.CantidadServicios > 0 && (
          <View style={styles.section}>
            <View style={[styles.perfilEstadisticaCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
            <TouchableOpacity 
              style={[styles.verHistorialButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('HistorialServicios')}
            >
              <Ionicons name="time-outline" size={18} color="#FFF" />
              <Text style={styles.verHistorialButtonText}>Ver historial</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Calificaciones */}
        {(usuario?.CalificaUsuario !== null || usuario?.CalificaProveedor !== null) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Calificaciones</Text>
            
            <View style={styles.perfilCalificacionesGrid}>
              {/* Calificación como Usuario */}
              {usuario.CalificaUsuario !== null && usuario.CalificaUsuario !== undefined && (
                <View style={[styles.perfilCalificacionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
                <View style={[styles.perfilCalificacionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
        )}

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información Personal</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemHeader}>
                <Ionicons name="card-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>RUT</Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{usuario?.Rut || 'No disponible'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoItemHeader}>
                <Ionicons name="call-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Teléfono</Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{usuario?.Telefono || 'No disponible'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoItemHeader}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Fecha de Nacimiento</Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {usuario?.FechaNacimiento 
                  ? new Date(usuario.FechaNacimiento).toLocaleDateString('es-CL')
                  : 'No disponible'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoItemHeader}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#AAA' : '#666' }]}>Fecha de Registro</Text>
              </View>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {usuario?.FechaRegistro 
                  ? new Date(usuario.FechaRegistro).toLocaleDateString('es-CL')
                  : 'No disponible'}
              </Text>
            </View>
            
          </View>
        </View>

        {/* Biografía */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Biografía</Text>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.infoItemHeader}>
              <Ionicons name="document-text-outline" size={18} color={theme.colors.primary} />
            </View>
            <Text style={[styles.bioText, { color: theme.colors.text }]}>
              {usuario?.Biografia || 'No hay biografía disponible'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}