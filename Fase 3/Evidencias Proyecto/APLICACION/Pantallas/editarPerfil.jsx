import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../Contextos/ThemeContext';
import { styles } from '../Estilos/editarPerfilStyles';
import { actualizarPerfil, guardarFotoPerfil, borrarFotoPerfil, cargarProfesiones } from '../Funciones/usuario';

export default function EditarPerfilScreen({ navigation, route }) {
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario } = route.params || {};
  
  const [telefono, setTelefono] = useState(usuario?.Telefono || '');
  const [biografia, setBiografia] = useState(usuario?.Biografia || '');
  const [errors, setErrors] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null); // URI de la foto seleccionada/recortada
  const [fotoPerfilExistente, setFotoPerfilExistente] = useState(usuario?.ImagenPerfil || null); // Imagen existente desde la API
  const [seleccionandoFoto, setSeleccionandoFoto] = useState(false);
  
  // Estados para profesiones
  const [profesiones, setProfesiones] = useState([]);
  const [profesionSeleccionada, setProfesionSeleccionada] = useState(usuario?.Id_Profesion || null);
  const [busquedaProfesion, setBusquedaProfesion] = useState(usuario?.Profesion || '');
  const [mostrarSelectorProfesion, setMostrarSelectorProfesion] = useState(false);
  const [cargandoProfesiones, setCargandoProfesiones] = useState(false);

  // Cargar imagen existente cuando cambie el usuario
  React.useEffect(() => {
    if (usuario?.ImagenPerfil) {
      setFotoPerfilExistente(usuario.ImagenPerfil);
    }
  }, [usuario?.ImagenPerfil]);

  // Cargar profesiones al montar
  useEffect(() => {
    cargarListaProfesiones();
  }, []);

  const cargarListaProfesiones = async () => {
    try {
      setCargandoProfesiones(true);
      const profesionesData = await cargarProfesiones();
      setProfesiones(profesionesData);
    } catch (error) {
      console.error('Error al cargar profesiones:', error);
    } finally {
      setCargandoProfesiones(false);
    }
  };

  // Estado para búsqueda dentro del selector (separado del texto mostrado)
  const [busquedaSelector, setBusquedaSelector] = useState('');

  // Filtrar profesiones según el texto de búsqueda del selector
  // Solo devolver resultados si hay texto de búsqueda (para no renderizar todas)
  const profesionesFiltradas = useMemo(() => {
    if (!busquedaSelector.trim()) {
      return []; // No mostrar nada hasta que el usuario escriba
    }
    
    const busquedaLower = busquedaSelector.toLowerCase().trim();
    return profesiones.filter(prof => {
      const nombre = (prof.PR_Nombre || '').toLowerCase();
      return nombre.includes(busquedaLower);
    });
  }, [profesiones, busquedaSelector]);

  const seleccionarProfesion = (profesion) => {
    setProfesionSeleccionada(profesion.Id_Profesion);
    setBusquedaProfesion(profesion.PR_Nombre);
    setBusquedaSelector('');
    setMostrarSelectorProfesion(false);
  };

  const abrirSelector = () => {
    setMostrarSelectorProfesion(true);
    setBusquedaSelector('');
  };

  const seleccionarFotoPerfil = async () => {
    try {
      setSeleccionandoFoto(true);

      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a las imágenes');
        setSeleccionandoFoto(false);
        return;
      }

      // Mostrar opciones: Galería o Cámara
      Alert.alert(
        'Seleccionar Foto',
        '¿De dónde quieres seleccionar la foto?',
        [
          {
            text: 'Galería',
            onPress: async () => {
              await abrirSelectorImagen('library');
            },
          },
          {
            text: 'Cámara',
            onPress: async () => {
              // Verificar permisos de cámara
              const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraStatus !== 'granted') {
                Alert.alert('Permisos', 'Se necesitan permisos para acceder a la cámara');
                setSeleccionandoFoto(false);
                return;
              }
              await abrirSelectorImagen('camera');
            },
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setSeleccionandoFoto(false),
          },
        ]
      );
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      Alert.alert('Error', 'No se pudo abrir el selector de imágenes');
      setSeleccionandoFoto(false);
    }
  };

  const abrirSelectorImagen = async (source) => {
    try {
      let resultado;

      if (source === 'camera') {
        // Para cámara, usar launchCameraAsync
        resultado = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        // Para galería, usar launchImageLibraryAsync
        resultado = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true, // Permitir recorte
          aspect: [1, 1], // Aspecto cuadrado para foto de perfil
          quality: 0.8,
        });
      }

      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        await procesarImagenSeleccionada(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al abrir selector:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen');
    } finally {
      setSeleccionandoFoto(false);
    }
  };

  const procesarImagenSeleccionada = async (uri) => {
    try {
      // Recortar y redimensionar la imagen a un tamaño adecuado para perfil
      const imagenRecortada = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: 400,
              height: 400,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setFotoPerfil(imagenRecortada.uri);
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen seleccionada');
    }
  };

  const eliminarFotoPerfil = async () => {
    Alert.alert(
      'Eliminar Foto',
      '¿Estás seguro de que quieres eliminar la foto de perfil?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Si hay una foto existente en el servidor, borrarla inmediatamente
              if (fotoPerfilExistente) {
                const resultado = await borrarFotoPerfil();
                
                if (resultado.exito) {
                  setFotoPerfil(null);
                  setFotoPerfilExistente(null);
                  Alert.alert('Éxito', 'Foto de perfil eliminada correctamente.');
                } else {
                  Alert.alert('Error', resultado.mensaje || 'No se pudo eliminar la foto de perfil');
                }
              } else if (fotoPerfil) {
                // Si solo hay una foto seleccionada localmente (no guardada), solo limpiar el estado
                setFotoPerfil(null);
              }
            } catch (error) {
              console.error('Error al eliminar foto:', error);
              Alert.alert('Error', 'No se pudo eliminar la foto de perfil. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar teléfono
    if (!telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido';
    } else {
      // Validar que solo contenga números
      const telefonoLimpio = telefono.replace(/\D/g, '');
      if (telefonoLimpio.length !== 9) {
        nuevosErrores.telefono = 'El teléfono debe tener 9 dígitos';
      }
    }

    // Validar biografía
    if (!biografia.trim()) {
      nuevosErrores.biografia = 'La biografía es requerida';
    } else if (biografia.trim().length < 10) {
      nuevosErrores.biografia = 'La biografía debe tener al menos 10 caracteres';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      Alert.alert('Error', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    try {
      setGuardando(true);
      
      // Actualizar datos del perfil (teléfono, biografía y profesión)
      const resultado = await actualizarPerfil(telefono, biografia, profesionSeleccionada);
      
      if (!resultado.exito) {
        // Si falla la actualización del perfil, no continuar
        return;
      }

      // Si hay foto de perfil seleccionada, guardarla
      if (fotoPerfil) {
        const resultadoFoto = await guardarFotoPerfil(fotoPerfil);
        
        if (!resultadoFoto.exito) {
          // Si falla el guardado de la foto, mostrar mensaje pero no bloquear
          Alert.alert(
            'Advertencia',
            'El perfil se actualizó correctamente, pero no se pudo guardar la foto de perfil. Puedes intentar nuevamente.',
            [
              {
                text: 'Aceptar',
                onPress: () => navigation.goBack(),
              },
            ]
          );
          return;
        }
      }

      // Si todo salió bien
      Alert.alert(
        'Perfil Actualizado',
        resultado.mensaje || 'Los cambios se han guardado correctamente.',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Editar Perfil
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 } // Espacio para el footer fijo
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Información del usuario */}
        <View style={[styles.userInfoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.avatarContainer}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
            ) : fotoPerfilExistente ? (
              <Image 
                source={{ uri: `data:image/png;base64,${fotoPerfilExistente}` }} 
                style={styles.avatarImage} 
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>
                  {usuario?.Nombre?.charAt(0)}{usuario?.Apellido?.charAt(0)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.avatarEditButton, { backgroundColor: theme.colors.primary }]}
              onPress={seleccionarFotoPerfil}
              disabled={seleccionandoFoto}
            >
              {seleccionandoFoto ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFF" />
              )}
            </TouchableOpacity>
            {(fotoPerfil || fotoPerfilExistente) && (
              <TouchableOpacity
                style={[styles.avatarDeleteButton, { backgroundColor: '#f44336' }]}
                onPress={eliminarFotoPerfil}
              >
                <Ionicons name="close" size={14} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {usuario?.Nombre} {usuario?.Apellido}
          </Text>
          <Text style={[styles.userEmail, { color: isDarkMode ? '#AAA' : '#666' }]}>
            {usuario?.Correo}
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Teléfono */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Teléfono <Text style={styles.required}>*</Text>
            </Text>
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.background,
                borderColor: errors.telefono ? '#f44336' : theme.colors.border,
              }
            ]}>
              <Ionicons name="call-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Ej: 987654321"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={telefono}
                onChangeText={(text) => {
                  setTelefono(text);
                  if (errors.telefono) {
                    setErrors({ ...errors, telefono: null });
                  }
                }}
                keyboardType="phone-pad"
                maxLength={12}
              />
            </View>
            {errors.telefono && (
              <Text style={styles.errorText}>{errors.telefono}</Text>
            )}
          </View>

          {/* Profesión */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Profesión
            </Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={abrirSelector}
            >
              <Ionicons name="school-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
              <Text style={[styles.input, { color: profesionSeleccionada ? theme.colors.text : (isDarkMode ? '#888' : '#999') }]}>
                {profesionSeleccionada 
                  ? profesiones.find(p => p.Id_Profesion === profesionSeleccionada)?.PR_Nombre || 'Seleccionar profesión'
                  : 'Seleccionar profesión'}
              </Text>
              <Ionicons 
                name={mostrarSelectorProfesion ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={isDarkMode ? '#888' : '#666'} 
              />
            </TouchableOpacity>
            
            <Modal
              visible={mostrarSelectorProfesion}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setMostrarSelectorProfesion(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  {/* Header del Modal */}
                  <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                      Seleccionar Profesión
                    </Text>
                    <TouchableOpacity
                      onPress={() => setMostrarSelectorProfesion(false)}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Búsqueda */}
                  <View style={[styles.searchContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <Ionicons name="search" size={18} color={isDarkMode ? '#888' : '#666'} />
                    <TextInput
                      style={[styles.searchInput, { color: theme.colors.text }]}
                      placeholder="Buscar profesión..."
                      placeholderTextColor={isDarkMode ? '#888' : '#999'}
                      value={busquedaSelector}
                      onChangeText={setBusquedaSelector}
                      autoFocus={true}
                    />
                    {busquedaSelector.length > 0 && (
                      <TouchableOpacity onPress={() => setBusquedaSelector('')}>
                        <Ionicons name="close-circle" size={18} color={isDarkMode ? '#888' : '#666'} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Lista de profesiones */}
                  {cargandoProfesiones ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    </View>
                  ) : !busquedaSelector.trim() ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={48} color={isDarkMode ? '#555' : '#999'} />
                      <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#666' }]}>
                        Escribe para buscar una profesión
                      </Text>
                    </View>
                  ) : profesionesFiltradas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="close-circle-outline" size={48} color={isDarkMode ? '#555' : '#999'} />
                      <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#666' }]}>
                        No se encontraron profesiones
                      </Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.profesionesList} nestedScrollEnabled>
                      {profesionesFiltradas.map((profesion) => (
                        <TouchableOpacity
                          key={profesion.Id_Profesion}
                          style={[
                            styles.profesionItem,
                            {
                              backgroundColor: profesionSeleccionada === profesion.Id_Profesion 
                                ? theme.colors.primary + '20' 
                                : theme.colors.background,
                              borderLeftColor: profesion.PR_Color || theme.colors.primary,
                            }
                          ]}
                          onPress={() => seleccionarProfesion(profesion)}
                        >
                          <View style={[styles.profesionIconContainer, { backgroundColor: (profesion.PR_Color || theme.colors.primary) + '20' }]}>
                            <Ionicons 
                              name={profesion.PR_Icono || 'school'} 
                              size={20} 
                              color={profesion.PR_Color || theme.colors.primary} 
                            />
                          </View>
                          <Text style={[styles.profesionNombre, { color: theme.colors.text }]}>
                            {profesion.PR_Nombre}
                          </Text>
                          {profesionSeleccionada === profesion.Id_Profesion && (
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </Modal>
          </View>

          {/* Biografía */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Biografía <Text style={styles.required}>*</Text>
            </Text>
            <View style={[
              styles.textAreaContainer,
              {
                backgroundColor: theme.colors.background,
                borderColor: errors.biografia ? '#f44336' : theme.colors.border,
              }
            ]}>
              <TextInput
                style={[styles.textArea, { color: theme.colors.text }]}
                placeholder="Escribe una breve descripción sobre ti..."
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={biografia}
                onChangeText={(text) => {
                  setBiografia(text);
                  if (errors.biografia) {
                    setErrors({ ...errors, biografia: null });
                  }
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>
            <View style={styles.characterCount}>
              <Text style={[styles.characterCountText, { color: isDarkMode ? '#888' : '#666' }]}>
                {biografia.length}/500 caracteres
              </Text>
            </View>
            {errors.biografia && (
              <Text style={styles.errorText}>{errors.biografia}</Text>
            )}
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botón Guardar - Footer fijo */}
      <View style={[
        styles.footer, 
        { 
          backgroundColor: theme.colors.card, 
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 16),
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { backgroundColor: theme.colors.primary },
            guardando && styles.saveButtonDisabled
          ]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

