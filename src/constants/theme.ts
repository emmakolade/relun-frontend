export const COLORS = {
  // Primary dating app colors - Modern Coral/Rose Palette
  primary: '#FF4B7D',        // More sophisticated rose-pink
  secondary: '#FF8FAB',      // Softer pastel pink for accents
  accent: '#7D4BFF',         // vivid violet for subtle contrast
  
  // Segment colors
  relationship: '#FF4B7D',
  fun: '#FF9F1C',            // Warm organic orange
  
  // UI Colors - Moving away from harsh pure white
  background: '#FAFAFA',     // Very light grey/off-white for main background
  backgroundLight: '#FFFFFF', // Pure white only for cards/surfaces
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors - Softer blacks
  text: '#1A1A1A',           // Soft black
  textSecondary: '#757575',  // Neutral grey
  textLight: '#A0A0A0',      // Light grey
  
  // Action colors
  success: '#00C853',
  error: '#FF3D00',
  warning: '#FFD600',
  like: '#00C853',
  nope: '#FF3D00',
  
  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  gray: '#F0F2F5',           // Modern UI grey
  grayLight: '#F7F8FA',
  grayDark: '#757575',
  border: '#E8E8E8',         // Subtle border color
  
  // Gradients - Richer, smoother gradient
  // gradientStart: '#FF4B7D',
  // gradientEnd: '#FF8FAB',
  
  // Modern Gradient (Coral to Rose)
  gradientStart: '#FF5E62',  
  gradientEnd: '#FF9966',    
};

export const FONTS = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  logo: 'Pacifico_400Regular',
};

export const SIZES = {
  // Modern Spacing Scale
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  
  // Font sizes
  h1: 34,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  body1: 16,
  body2: 14,
  body3: 12,
  
  // Spacing & Radius - Modern softened corners
  padding: 24,               // More breathing room is key to modern clean UI
  margin: 24,
  radius: 24,                // Significantly rounder corners (default)
  radiusLarge: 32,
  radiusSmall: 16,
  
  // Card
  cardPadding: 20,
};

export const SHADOWS = {
  small: {
    shadowColor: '#1A1A1A',  // Softer shadow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,     // Very subtle
    shadowRadius: 12,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  },
  large: {
    shadowColor: '#FF5E62',  // Colored shadow matching primary brand sometimes looks very premium
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 10,
  },
};
