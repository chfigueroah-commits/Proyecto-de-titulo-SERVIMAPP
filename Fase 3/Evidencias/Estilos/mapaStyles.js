import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  
  // Loading inicial
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Mapa
  map: {
    flex: 1,
  },

  // Badge simple para marcadores
  simpleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  
  // Botón de recentrar
  recenterButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  // Info Card
  infoCard: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },

  // Selector de categorías
  selectorContainer: {
    flex: 1,
  },
  selectorHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  selectorHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectorHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectorCloseButton: {
    padding: 4,
  },
  selectorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectorSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  selectorSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  selectorSearchIcon: {
    marginRight: 8,
  },
  selectorSearchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  selectorSearchClear: {
    padding: 4,
    marginLeft: 8,
  },
  selectorLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  selectorEmptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  selectorEmptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  selectorList: {
    padding: 20,
    paddingBottom: 40,
  },
  categoriaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriaIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoriaNombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  // Indicador de sin marcadores
  noMarkersContainer: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ translateY: -100 }], // Centrar verticalmente
  },
  noMarkersText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  noMarkersSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },

  // Indicador de carga de marcadores
  loadingMarkersContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingMarkersText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Card de servicio seleccionado
  serviceCard: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 180,
  },
  closeCardButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 28,
  },
  serviceCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceCardInfo: {
    flex: 1,
  },
  serviceCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    lineHeight: 20,
  },
  serviceCardCategory: {
    fontSize: 12,
  },
  serviceCardDetails: {
    marginBottom: 8,
    gap: 6,
  },
  serviceCardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceCardDetailText: {
    fontSize: 12,
    flex: 1,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  detailsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal de detalles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalServiceHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalServiceIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalServiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalServiceCategory: {
    fontSize: 15,
    textAlign: 'center',
  },
  modalSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSectionContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  modalInfoContent: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  modalButtonSecondary: {
    borderWidth: 1,
  },
  modalButtonPrimary: {
    // backgroundColor viene del theme
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal de Oferta
  modalOfertaContent: {
    flex: 1,
    padding: 20,
  },
  modalOfertaServiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalOfertaServiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalOfertaServiceDetails: {
    flex: 1,
  },
  modalOfertaServiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalOfertaServiceCategory: {
    fontSize: 14,
  },
  modalOfertaForm: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalOfertaInputGroup: {
    marginBottom: 20,
  },
  modalOfertaLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalOfertaInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
  },
  modalOfertaInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOfertaTextArea: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
  },
  
  // Badge de estado para detalle
  estadoBadgeDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  estadoTextDetalle: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Estilos para imágenes del modal
  modalImagesContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  modalImageWrapper: {
    width: 280,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },

  // Estilos para modal de imagen completa
  modalImagenCompletaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImagenCompletaCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalImagenCompleta: {
    width: '100%',
    height: '100%',
  },
});

