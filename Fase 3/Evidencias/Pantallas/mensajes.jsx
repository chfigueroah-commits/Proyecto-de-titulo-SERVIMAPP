import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/mensajesStyles';

export default function MensajesScreen() {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Text style={[styles.title, { color: theme.colors.text }]}>Mensajes</Text>
      <Text style={[styles.subtitle, { color: theme.dark ? '#B0B0B0' : '#666' }]}>Chatea con proveedores de servicios</Text>
    </View>
  );
}
