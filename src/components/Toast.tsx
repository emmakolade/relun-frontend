import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastConfig = {
  success: {
    icon: 'checkmark-circle' as const,
    backgroundColor: '#10B981',
    iconColor: '#FFFFFF',
  },
  error: {
    icon: 'close-circle' as const,
    backgroundColor: COLORS.primary,
    iconColor: '#FFFFFF',
  },
  warning: {
    icon: 'warning' as const,
    backgroundColor: '#F59E0B',
    iconColor: '#FFFFFF',
  },
  info: {
    icon: 'information-circle' as const,
    backgroundColor: '#3B82F6',
    iconColor: '#FFFFFF',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback((config: ToastConfig) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast(config);
    setVisible(true);

    // Reset animation values
    translateY.setValue(-100);
    opacity.setValue(0);

    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const duration = config.duration || 3000;
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  }, [translateY, opacity, hideToast]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const config = toast ? toastConfig[toast.type] : toastConfig.info;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && toast && (
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={[styles.toast, { backgroundColor: config.backgroundColor }]}
            activeOpacity={0.95}
            onPress={hideToast}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={config.icon} size={24} color={config.iconColor} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={1}>
                {toast.title}
              </Text>
              {toast.message && (
                <Text style={styles.message} numberOfLines={2}>
                  {toast.message}
                </Text>
              )}
            </View>
            {toast.action && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  toast.action?.onPress();
                  hideToast();
                }}
              >
                <Text style={styles.actionText}>{toast.action.label}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 32,
    maxWidth: 400,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...SHADOWS.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

// Confirmation Dialog Component
interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[dialogStyles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[dialogStyles.dialog, { transform: [{ scale: scaleAnim }] }]}>
          <View style={dialogStyles.iconCircle}>
            <Ionicons 
              name={destructive ? "warning" : "help-circle"} 
              size={32} 
              color={destructive ? COLORS.primary : COLORS.accent} 
            />
          </View>
          <Text style={dialogStyles.title}>{title}</Text>
          <Text style={dialogStyles.message}>{message}</Text>
          <View style={dialogStyles.buttonRow}>
            <TouchableOpacity 
              style={dialogStyles.cancelButton} 
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={dialogStyles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                dialogStyles.confirmButton,
                destructive && dialogStyles.destructiveButton
              ]} 
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={dialogStyles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const dialogStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  destructiveButton: {
    backgroundColor: COLORS.primary,
  },
  confirmText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});

export default ToastProvider;
