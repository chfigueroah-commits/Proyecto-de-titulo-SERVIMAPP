import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/historialServiciosStyles';

export default function HistorialServiciosScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Historial Servicios
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Contenido */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.placeholderContainer}>
          <Ionicons name="time-outline" size={64} color={isDarkMode ? '#555' : '#CCC'} />
          <Text style={[styles.placeholderText, { color: isDarkMode ? '#888' : '#999' }]}>
            Historial Servicios
          </Text>
          <Text style={[styles.placeholderSubtext, { color: isDarkMode ? '#666' : '#AAA' }]}>
            El contenido se agregará próximamente
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

