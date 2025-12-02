import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/homeStyles';
import { obtenerDatosUsuario } from '../API/storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const datos = await obtenerDatosUsuario();
      if (datos) {
        setUsuario(datos);
      } else {
        console.log('No hay datos de usuario');
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
        <Text style={{ marginTop: 16, color: isDarkMode ? '#B0B0B0' : '#666' }}>Cargando...</Text>
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
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/Logo Servimapp.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.logo, { color: theme.colors.text }]}>ServiMapp</Text>
            </View>
            {usuario && (
              <TouchableOpacity 
                style={styles.userInfo}
                onPress={() => navigation.navigate('Perfil')}
                activeOpacity={0.7}
              >
                <Ionicons name="person-circle" size={24} color={theme.colors.primary} />
                <Text style={[styles.userName, { color: theme.colors.text }]} numberOfLines={1}>
                  {usuario.Nombre || 'Usuario'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.heroBackgroundPattern}>
              <View style={[styles.heroPatternCircle, { backgroundColor: theme.colors.primary + '08' }]} />
              <View style={[styles.heroPatternCircle2, { backgroundColor: theme.colors.primary + '05' }]} />
            </View>
            <View style={styles.heroContent}>
              <View style={[styles.heroIconContainer, { backgroundColor: 'transparent' }]}>
                <Image 
                  source={require('../assets/Logo Servimapp.png')} 
                  style={styles.heroLogoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
                {usuario ? `¡Hola, ${usuario.Nombre || 'Usuario'}!` : '¡Bienvenido!'}
              </Text>
              <Text style={[styles.heroSubtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
                Conecta con profesionales o encuentra servicios cerca de ti
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Ionicons name="people" size={18} color={theme.colors.primary} />
                  <Text style={[styles.heroStatText, { color: theme.colors.text }]}>Profesionales</Text>
                </View>
                <View style={[styles.heroStatDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.heroStatItem}>
                  <Ionicons name="location" size={18} color={theme.colors.primary} />
                  <Text style={[styles.heroStatText, { color: theme.colors.text }]}>Cerca de ti</Text>
                </View>
                <View style={[styles.heroStatDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.heroStatItem}>
                  <Ionicons name="star" size={18} color={theme.colors.primary} />
                  <Text style={[styles.heroStatText, { color: theme.colors.text }]}>Calificados</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ¿Qué necesitas hacer?
          </Text>
          
          {/* Botón: Publica tu necesidad */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Solicitudes')}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonGradient}>
              <View style={styles.actionButtonContent}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="add-circle" size={40} color="#FFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonTitle}>Publica tu necesidad</Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Solicita un servicio y recibe ofertas de profesionales
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" style={styles.actionChevron} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Botón: Ofrece tus servicios */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('Mapa')}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonGradient}>
              <View style={styles.actionButtonContent}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="map" size={40} color="#FFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionButtonTitle}>Ofrece tus servicios</Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Busca oportunidades y envía ofertas a los clientes
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" style={styles.actionChevron} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Accesos Rápidos
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Buscar')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name="search" size={28} color={theme.colors.primary} />
              </View>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>Buscar</Text>
              <Text style={[styles.quickActionText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                Encuentra servicios
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Ofertas')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconContainer, { backgroundColor: '#4CAF50' + '15' }]}>
                <Ionicons name="pricetag" size={28} color="#4CAF50" />
              </View>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>Ofertas</Text>
              <Text style={[styles.quickActionText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                Mis ofertas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Mapa')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconContainer, { backgroundColor: '#2196F3' + '15' }]}>
                <Ionicons name="map" size={28} color="#2196F3" />
              </View>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>Mapa</Text>
              <Text style={[styles.quickActionText, { color: isDarkMode ? '#AAA' : '#666' }]}>
                Ver en mapa
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
