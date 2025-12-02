import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Contextos/ThemeContext';
import { styles } from '../../Estilos/mapaStyles';

/**
 * Modal selector de categorías para filtrar servicios en el mapa
 * @param {boolean} visible - Si el modal está visible o no
 * @param {Array} categorias - Lista de categorías disponibles
 * @param {boolean} loading - Si está cargando las categorías
 * @param {Function} onSelect - Función a ejecutar al seleccionar una categoría
 * @param {Function} onClose - Función a ejecutar al cerrar el modal
 */
export default function CategorySelector({ visible, categorias, loading, onSelect, onClose }) {
  const { theme, isDarkMode } = useTheme();
  const [busqueda, setBusqueda] = useState('');

  // Filtrar categorías según la búsqueda
  const categoriasFiltradas = useMemo(() => {
    const todasCategorias = [{ Id_Categoria: 'todos', CAT_Nombre: 'Todos los Servicios', CAT_Icono: 'apps', CAT_Color: theme.colors.primary }, ...categorias];
    
    if (!busqueda.trim()) {
      return todasCategorias;
    }
    
    const busquedaLower = busqueda.toLowerCase().trim();
    return todasCategorias.filter(cat => 
      cat.CAT_Nombre.toLowerCase().includes(busquedaLower)
    );
  }, [categorias, busqueda, theme.colors.primary]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.selectorContainer, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        
        {/* Header del selector */}
        <View style={[styles.selectorHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <View style={styles.selectorHeaderTop}>
            <View style={styles.selectorHeaderContent}>
              <Ionicons name="filter" size={24} color={theme.colors.primary} />
              <Text style={[styles.selectorTitle, { color: theme.colors.text }]}>
                Selecciona una Categoría
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.selectorCloseButton}
            >
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.selectorSubtitle, { color: isDarkMode ? '#AAA' : '#666' }]}>
            Elige qué servicios deseas ver en el mapa
          </Text>
          
          {/* Barra de búsqueda */}
          <View style={[styles.selectorSearchContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#888' : '#999'} style={styles.selectorSearchIcon} />
            <TextInput
              style={[styles.selectorSearchInput, { color: theme.colors.text }]}
              placeholder="Buscar categoría..."
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity 
                onPress={() => setBusqueda('')}
                style={styles.selectorSearchClear}
              >
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#888' : '#999'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Lista de categorías */}
        {loading ? (
          <View style={styles.selectorLoading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Cargando categorías...</Text>
          </View>
        ) : categoriasFiltradas.length === 0 ? (
          <View style={styles.selectorEmpty}>
            <Ionicons name="search-outline" size={64} color={isDarkMode ? '#555' : '#CCC'} />
            <Text style={[styles.selectorEmptyText, { color: theme.colors.text }]}>
              No se encontraron categorías
            </Text>
            <Text style={[styles.selectorEmptySubtext, { color: isDarkMode ? '#888' : '#666' }]}>
              Intenta con otro término de búsqueda
            </Text>
          </View>
        ) : (
          <FlatList
            data={categoriasFiltradas}
            keyExtractor={(item) => item.Id_Categoria.toString()}
            contentContainerStyle={styles.selectorList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoriaCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => {
                  onSelect(item.Id_Categoria);
                  setBusqueda(''); // Limpiar búsqueda al seleccionar
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.categoriaIcono, { backgroundColor: item.CAT_Color || theme.colors.primary }]}>
                  <Ionicons name={item.CAT_Icono || 'business'} size={24} color="#FFF" />
                </View>
                <Text style={[styles.categoriaNombre, { color: theme.colors.text }]}>
                  {item.CAT_Nombre}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#888' : '#CCC'} />
              </TouchableOpacity>
            )}
            // Optimizaciones de rendimiento
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
          />
        )}
      </View>
    </Modal>
  );
}

