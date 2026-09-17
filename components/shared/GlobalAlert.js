import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import colors from '../../constants/colors';

export const globalAlertRef = React.createRef();

export const CustomAlert = {
  alert: (title, message, buttons = [], options = {}) => {
    if (globalAlertRef.current) {
      globalAlertRef.current.alert(title, message, buttons, options);
    } else {
      console.warn("GlobalAlert not mounted, falling back to native Alert");
      Alert.alert(title, message, buttons, options);
    }
  }
};

const GlobalAlertComponent = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [],
    options: {}
  });

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useImperativeHandle(ref, () => ({
    alert: (title, message, buttons, options) => {
      const defaultButtons = buttons && buttons.length > 0 
        ? buttons 
        : [{ text: 'OK' }];

      setAlertConfig({ title, message, buttons: defaultButtons, options });
      setVisible(true);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }));

  const handleClose = (onPress) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (onPress) onPress();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => {
        if (alertConfig.options?.cancelable !== false) {
          handleClose();
        }
      }}
    >
      <View style={styles.overlay}>
        <Animated.View style={[
          styles.overlayBg, 
          { opacity: fadeAnim }
        ]} />
        
        <Animated.View style={[
          styles.alertBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          
          <View style={styles.content}>
            {!!alertConfig.title && (
              <Text style={styles.title}>{alertConfig.title}</Text>
            )}
            {!!alertConfig.message && (
              <Text style={styles.message}>{alertConfig.message}</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            {alertConfig.buttons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    alertConfig.buttons.length === 2 && styles.buttonHalf,
                    index > 0 && alertConfig.buttons.length > 2 && styles.buttonTopBorder,
                    index > 0 && alertConfig.buttons.length === 2 && styles.buttonLeftBorder,
                  ]}
                  onPress={() => handleClose(btn.onPress)}
                >
                  <Text style={[
                    styles.buttonText,
                    isDestructive && styles.textDestructive,
                    isCancel && styles.textCancel,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
        </Animated.View>
      </View>
    </Modal>
  );
});

GlobalAlertComponent.displayName = 'GlobalAlertComponent';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  alertBox: {
    width: '80%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'quicksand-bold',
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'nunito',
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  buttonHalf: {
    width: '50%',
  },
  buttonTopBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  buttonLeftBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontFamily: 'nunito-bold',
    fontSize: 16,
    color: colors.PRIMARY || '#132F94',
  },
  textDestructive: {
    color: '#EF4444',
  },
  textCancel: {
    color: '#6B7280',
    fontFamily: 'nunito',
  }
});

export default GlobalAlertComponent;
