import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/buscarStyles';
import { cargarCatalogos } from '../Funciones/solicitudes';

export default function BuscarScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [busquedaTexto, setBusquedaTexto] = useState('');

  useEffect(() => {
    cargarCategorias();
  }, []);

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

  // Filtrar categorías según el texto de búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!busquedaTexto.trim()) {
      return categorias;
    }
    
    const busquedaLower = busquedaTexto.toLowerCase().trim();
    return categorias.filter(cat => {
      const nombre = (cat.CAT_Nombre || '').toLowerCase();
      return nombre.includes(busquedaLower);
    });
  }, [categorias, busquedaTexto]);

  const handleCategoriaPress = useCallback((categoria) => {
    navigation.navigate('Mapa', { categoriaId: categoria.Id_Categoria });
  }, [navigation]);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border, paddingTop: insets.top + 20 }]}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>Buscar Servicios</Text>
          
          {/* Barra de búsqueda */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#888' : '#999'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Buscar categoría..."
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              value={busquedaTexto}
              onChangeText={setBusquedaTexto}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {busquedaTexto.length > 0 && (
              <TouchableOpacity 
                onPress={() => setBusquedaTexto('')}
                style={styles.searchClear}
              >
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#888' : '#999'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categorías */}
        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categorías</Text>
            <TouchableOpacity 
              style={styles.verTodasButton}
              onPress={() => navigation.navigate('Mapa', { categoriaId: 'todos' })}
            >
              <Text style={[styles.verTodasText, { color: theme.colors.primary }]}>Ver todas</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {cargandoCategorias ? (
            <View style={styles.categoriesLoading}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: isDarkMode ? '#888' : '#666' }]}>
                Cargando categorías...
              </Text>
            </View>
          ) : categoriasFiltradas.length === 0 ? (
            <View style={styles.categoriesEmpty}>
              <Ionicons name="search-outline" size={48} color={isDarkMode ? '#555' : '#CCC'} />
              <Text style={[styles.categoriesEmptyText, { color: theme.colors.text }]}>
                No se encontraron categorías
              </Text>
              <Text style={[styles.categoriesEmptySubtext, { color: isDarkMode ? '#888' : '#666' }]}>
                Intenta con otro término de búsqueda
              </Text>
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {categoriasFiltradas.map((categoria) => (
                <TouchableOpacity
                  key={categoria.Id_Categoria}
                  style={[styles.categoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => handleCategoriaPress(categoria)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: categoria.CAT_Color || theme.colors.primary }]}>
                    <Ionicons 
                      name={categoria.CAT_Icono || 'business'} 
                      size={28} 
                      color="#FFF" 
                    />
                  </View>
                  <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                    {categoria.CAT_Nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
