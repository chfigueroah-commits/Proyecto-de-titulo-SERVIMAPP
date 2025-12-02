import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

// Temas personalizados basados en los de React Navigation
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#333333',
    border: '#e0e0e0',
  },
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#2196F3',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#333333',
  },
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system');
  
  useEffect(() => {
    cargarPreferencia();
  }, []);

  const cargarPreferencia = async () => {
    try {
      const preferencia = await AsyncStorage.getItem('themeMode');
      if (preferencia) {
        setThemeMode(preferencia);
      }
    } catch (error) {
      console.error('Error al cargar preferencia de tema:', error);
    }
  };

  const cambiarTema = async (modo) => {
    try {
      setThemeMode(modo);
      await AsyncStorage.setItem('themeMode', modo);
    } catch (error) {
      console.error('Error al guardar preferencia de tema:', error);
    }
  };

  const temaActual = themeMode === 'system' 
    ? (systemColorScheme === 'dark' ? darkTheme : lightTheme)
    : (themeMode === 'dark' ? darkTheme : lightTheme);

  const isDarkMode = temaActual.dark;

  return (
    <ThemeContext.Provider value={{ 
      theme: temaActual, 
      themeMode, 
      cambiarTema, 
      isDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
