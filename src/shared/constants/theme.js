// src/shared/constants/theme.js
// Sistema de diseño "KinalEat" (basado en DESIGN.md - Noir & Grill / Gourmet Minimalism)

export const COLORS = {
  primary: '#825500',
  primaryContainer: '#c8860a',
  onPrimary: '#ffffff',
  primaryFixed: '#ffddb3',

  secondary: '#755b00',
  secondaryContainer: '#fdcf49',
  onSecondary: '#ffffff',

  tertiary: '#006494',
  tertiaryContainer: '#309bdb',
  tertiaryFixed: '#cae6ff',

  background: '#FAF6F0',
  surface: '#F2EAE0',
  surfaceContainerHigh: '#fde3d5',
  surfaceContainerLowest: '#ffffff',

  espresso: '#1C1008',
  inverseSurface: '#3c2d24',
  inverseOnSurface: '#ffede4',

  text: '#3A2418',
  textMuted: '#A08060',
  onSurfaceVariant: '#514535',

  outline: '#847563',
  border: '#d6c4af',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',

  success: '#2E7D5A',
  successContainer: '#dff3e8',
  warning: '#f59e0b',

  overlayDark: 'rgba(28,16,8,0.5)',

  // Tonos del "mockup" de mapa en OrderTrackingScreen (marco/pantalla del teléfono)
  mapFrame: '#e8e0d8',
  mapScreen: '#ddd8ce',

  // alias retrocompatibles
  textLight: '#A08060',
  surfaceVariant: '#f7decf'
};

// Colores del badge de estado en OrderTrackingScreen (tratamiento tipo "alerta"
// con borde, distinto del Badge genérico de Common.jsx)
export const TRACKING_BADGE = {
  PENDING:   { bg: '#FEF9EC', text: '#92400E', border: '#FDE68A' },
  PREPARING: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  READY:     { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  DELIVERED: { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },
  CANCELLED: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
};

export const FONTS = {
  display: 'PlayfairDisplay_700Bold',
  headline: 'PlayfairDisplay_700Bold',
  headlineSemiBold: 'PlayfairDisplay_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  label: 'DMSans_600SemiBold'
};

export const TYPOGRAPHY = {
  displayLg: { fontFamily: FONTS.display, fontSize: 40, lineHeight: 48, letterSpacing: -0.5 },
  headlineLg: { fontFamily: FONTS.headline, fontSize: 28, lineHeight: 36 },
  headlineMd: { fontFamily: FONTS.headlineSemiBold, fontSize: 22, lineHeight: 28 },
  bodyLg: { fontFamily: FONTS.body, fontSize: 17, lineHeight: 26 },
  bodyMd: { fontFamily: FONTS.body, fontSize: 15, lineHeight: 22 },
  labelMd: { fontFamily: FONTS.label, fontSize: 13, lineHeight: 18, letterSpacing: 0.5, textTransform: 'uppercase' },
  labelSm: { fontFamily: FONTS.label, fontSize: 11, lineHeight: 14 }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999
};

export const SHADOWS = {
  sm: {
    shadowColor: '#1C1008',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  md: {
    shadowColor: '#1C1008',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  lg: {
    shadowColor: '#1C1008',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8
  }
};
