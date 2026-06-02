import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

export const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}) => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPasswordHidden}
          keyboardType={keyboardType}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
            style={styles.eyeIconContainer}
          >
            <Ionicons
              name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Theme.spacing.near,
  },
  label: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Theme.sizes.input.height,
    borderRadius: 8,
    backgroundColor: Theme.colors.secondary,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  input: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    height: '100%',
    paddingHorizontal: 16,
  },
  eyeIconContainer: {
    height: '100%',
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
