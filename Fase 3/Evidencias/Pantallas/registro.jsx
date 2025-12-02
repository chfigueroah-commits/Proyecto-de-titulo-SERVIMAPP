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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from '../Estilos/registroStyles';
import { handleRegistro as registro } from '../Funciones/autenticacion';
import { 
  formatearRUT as formatRUT,
  formatearFecha as formatFecha,
  formatearTelefono as formatTelefono
} from '../Funciones/formateadores';

export default function RegistroScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rut, setRut] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegistro = async () => {
    setLoading(true);
    setErrorMessage('');
    
    const datosUsuario = {
      nombre,
      apellido,
      rut,
      correo,
      contrasena,
      telefono,
      fechaNacimiento,
    };
    
    const resultado = await registro(datosUsuario, navigation);
    
    setLoading(false);
    
    if (!resultado.success) {
      setErrorMessage(resultado.message);
      Alert.alert('Error', resultado.message);
    } else {
      Alert.alert('Éxito', resultado.message);
    }
  };

  const formatearRUT = (texto) => {
    formatRUT(texto, setRut);
  };

  const formatearFecha = (texto) => {
    formatFecha(texto, setFechaNacimiento);
  };

  const formatearTelefono = (texto) => {
    formatTelefono(texto, setTelefono);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Nombre y Apellido en fila */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                placeholder="Pérez"
                value={apellido}
                onChangeText={setApellido}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* RUT */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>RUT</Text>
            <TextInput
              style={styles.input}
              placeholder="12345678-9"
              value={rut}
              onChangeText={formatearRUT}
              keyboardType="numeric"
              maxLength={12}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Teléfono y Fecha de Nacimiento en fila */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="987654321"
                value={telefono}
                onChangeText={formatearTelefono}
                keyboardType="phone-pad"
                maxLength={9}
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Fecha Nac.</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                value={fechaNacimiento}
                onChangeText={formatearFecha}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              value={contrasena}
              onChangeText={setContrasena}
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

          {/* Términos y Condiciones */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Al registrarte, aceptas nuestros{' '}
            </Text>
            <TouchableOpacity>
              <Text style={styles.termsLink}>Términos y Condiciones</Text>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleRegistro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

