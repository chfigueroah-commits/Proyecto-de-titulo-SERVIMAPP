import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  
  // Filtros de estado
  filtrosContainer: {
    marginBottom: 12,
  },
  filtroSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  filtroSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  filtroSelectorText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalSelectorContent: {
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 'auto',
    borderRadius: 16,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  estadoSelectorList: {
    maxHeight: 400,
  },
  estadoSelectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  estadoSelectorText: {
    fontSize: 16,
  },
  
  // Badge de estado
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  estadoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  estadoBadgeDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  estadoDotDetalle: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  estadoTextDetalle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
  },

  // Lista de ofertas
  ofertasList: {
    paddingBottom: 20,
  },
  
  // Tarjeta de oferta
  ofertaCard: {
    marginTop: 15,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
  
  // Monto
  montoContainer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  montoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  montoValue: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },

  // Comentario
  comentarioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 10,
  },
  comentarioText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  fechaText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  verDetalleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    flex: 1,
    gap: 8,
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
  },
  verDetalleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelarOfertaButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    flex: 1,
    borderTopWidth: 1,
    gap: 8,
    backgroundColor: 'rgba(198, 40, 40, 0.05)',
  },
  cancelarOfertaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C62828',
  },

  // Modal de Detalle
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalDetalleContent: {
    height: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  detalleContainer: {
    flex: 1,
    paddingTop: 8,
  },
  detalleTituloContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 20,
  },
  detalleTituloHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  detalleTitulo: {
    flex: 1,
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  montoContainerDetalle: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  montoLabelDetalle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  montoValueDetalle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  detalleCategoriaComuna: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  detalleCategoriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 12,
  },
  detalleCategoriaTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  detalleSeparador: {
    fontSize: 14,
    opacity: 0.3,
  },
  detalleDivisor: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 24,
    opacity: 0.1,
  },
  detalleSection: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  detalleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  detalleSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  detalleTexto: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
    paddingLeft: 28,
  },
  coordenadasContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  coordenadasTexto: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  detalleFechasContainer: {
    gap: 14,
    paddingLeft: 28,
  },
  detalleFechaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 10,
  },
  detalleFechaLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  detalleFechaValor: {
    fontSize: 14,
    fontWeight: '700',
  },
  detalleFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 24,
  },
  detalleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  detalleButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
});
