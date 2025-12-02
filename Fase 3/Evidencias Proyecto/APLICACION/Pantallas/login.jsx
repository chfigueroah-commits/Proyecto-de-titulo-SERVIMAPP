import React, { useState, useEffect } from 'react';
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
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from '../Estilos/loginStyles';
import { handleLogin as login } from '../Funciones/autenticacion';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prevenir navegación hacia atrás en Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // En Login, permitir salir de la app con el botón atrás
      // No hacer nada, dejar que el comportamiento por defecto funcione
      return false;
    });

    return () => backHandler.remove();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    
    const resultado = await login(email, password, navigation);
    
    setLoading(false);
    
    if (!resultado.success) {
      setErrorMessage(resultado.message);
      Alert.alert('Error', resultado.message);
    }
    // Si es exitoso, la función login ya navega a Home automáticamente
  };

  const content = (
    <>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ServiMapp</Text>
          <Image 
            source={require('../assets/Logo Servimapp.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>!Hola de nuevo!</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('RecuperarPassword')}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {content}
    </View>
  );
}
