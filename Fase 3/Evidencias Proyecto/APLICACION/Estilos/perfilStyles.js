import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  
  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  // Info Card
  infoCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoItem: {
    marginBottom: 20,
  },
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 26,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Badge de profesión
  profesionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  profesionBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Calificaciones
  perfilCalificacionesGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  perfilCalificacionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  perfilCalificacionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  perfilCalificacionLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  perfilCalificacionValor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perfilCalificacionNumero: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  // Estadísticas
  perfilEstadisticaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  perfilEstadisticaIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfilEstadisticaContent: {
    flex: 1,
  },
  perfilEstadisticaLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  perfilEstadisticaValor: {
    fontSize: 32,
    fontWeight: '700',
  },
  
  // Botón ver historial
  verHistorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  verHistorialButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
