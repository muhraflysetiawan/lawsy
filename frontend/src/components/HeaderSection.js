import React from 'react';
import { View, Text, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { Theme } from '../theme';

export const HeaderSection = ({ title, caption }) => {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../../assets/assets/logo-lawsy-white.webp')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.headerText}>{title}</Text>
      <Text style={styles.captionText}>{caption}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight + 40) : 80,
    paddingBottom: 30,
  },
  logo: {
    width: 200, // Enlarged
    height: 70, // Enlarged
    marginBottom: Theme.spacing.near,
  },
  headerText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  captionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.secondary,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.medium,
  },
});
