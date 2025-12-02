import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/recuperarPasswordStyles';

export default function RecuperarPasswordScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }

    // TODO: Implementar funcionalidad de recuperación de contraseña
    setLoading(true);
    
    // Simular envío
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Enviado',
        'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header con botón de volver */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Recuperar Contraseña
          </Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/Logo Servimapp.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Descripción */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: isDarkMode ? '#AAA' : '#666' }]}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Correo electrónico
            </Text>
            <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDarkMode ? '#888' : '#999'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="tu@email.com"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus={false}
              />
            </View>
          </View>

          {/* Enviar Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Enviar</Text>
                <Ionicons name="send" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Volver al login */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backToLoginText, { color: theme.colors.primary }]}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

