import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/ajustesStyles';
import { handleLogout } from '../Funciones/autenticacion';

export default function AjustesScreen({ navigation }) {
  const { theme, themeMode, cambiarTema, isDarkMode } = useTheme();

  const onLogoutPress = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await handleLogout(navigation);
          },
        },
      ]
    );
  };

  const opciones = [
    { id: 'system', label: 'Automático', desc: 'Sigue el tema del sistema', icon: 'phone-portrait' },
    { id: 'light', label: 'Claro', desc: 'Siempre tema claro', icon: 'sunny' },
    { id: 'dark', label: 'Oscuro', desc: 'Siempre tema oscuro', icon: 'moon' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ajustes</Text>
        </View>

        {/* Opciones de Tema */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Apariencia</Text>
          
          {opciones.map((opcion) => (
            <TouchableOpacity
              key={opcion.id}
              style={[
                styles.optionCard,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: themeMode === opcion.id ? theme.colors.primary : theme.colors.border,
                  borderWidth: themeMode === opcion.id ? 2 : 1,
                }
              ]}
              onPress={() => cambiarTema(opcion.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={opcion.icon} 
                size={24} 
                color={themeMode === opcion.id ? theme.colors.primary : theme.dark ? '#B0B0B0' : '#666'} 
                style={styles.optionIcon}
              />
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>
                  {opcion.label}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.dark ? '#B0B0B0' : '#666' }]}>
                  {opcion.desc}
                </Text>
              </View>
              {themeMode === opcion.id && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={theme.colors.primary}
                  style={styles.checkmark}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Vista Previa</Text>
          <View style={[styles.previewCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.previewTitle, { color: theme.colors.text }]}>Ejemplo de tarjeta</Text>
            <Text style={[styles.previewText, { color: theme.dark ? '#B0B0B0' : '#666' }]}>
              Así se verán los elementos en la aplicación
            </Text>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.previewButtonText}>Botón</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Cerrar Sesión */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: '#f44336' }]} 
            onPress={onLogoutPress}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
