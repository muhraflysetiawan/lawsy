import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { Theme } from '../theme';

export const CustomButton = ({
  title,
  onPress,
  type = 'primary', // 'primary' | 'outline' | 'text'
  size = 'large', // 'large' | 'small'
  style,
  textStyle,
  icon,
  disabled = false,
  loading = false,
}) => {

  const isPrimary = type === 'primary';
  const isOutline = type === 'outline';

  const buttonHeight = size === 'large' ? Theme.sizes.button.large : Theme.sizes.button.small;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { height: buttonHeight },
        isPrimary && styles.primaryButton,
        isOutline && styles.outlineButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#FFFFFF" : Theme.colors.primary} />
      ) : (
        <>
          {icon && icon}
          <Text
            style={[
              styles.text,
              isPrimary ? styles.primaryText : styles.outlineText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>

  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Theme.spacing.near,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    marginLeft: 8,
  },
  primaryText: {
    color: Theme.colors.secondary,
  },
  outlineText: {
    color: Theme.colors.text,
  },
});
