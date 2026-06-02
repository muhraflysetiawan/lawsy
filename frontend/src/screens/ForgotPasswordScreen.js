import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { HeaderSection } from '../components/HeaderSection';

const { height } = Dimensions.get('window');

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = () => {
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }
    setError('');
    // Handle OTP sending logic
    navigation.navigate('SetNewPassword');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background-login.webp')}
        style={styles.backgroundImage}
      >
        <HeaderSection
          title="Forgot Password"
          caption="Kindly input your registered email address below to continue the password recovery."
        />

        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContent}
            bounces={false}
          >
            {/* Very Large Round Icon - Primary Blue Background, White Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={60} color={Theme.colors.secondary} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Input with Label */}
            <CustomInput
              label="Email"
              placeholder="Enter your registered email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Send Code Button */}
            <CustomButton
              title="Send Code"
              onPress={handleSendCode}
              style={{ marginTop: Theme.spacing.near }}
            />

            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
              <Text style={styles.backLink}>Back to Login</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: Theme.colors.secondary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 20,
    paddingHorizontal: Theme.spacing.medium,
    paddingTop: Theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  cardScrollContent: {
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120, // Increased size
    height: 120, // Increased size
    borderRadius: 60,
    backgroundColor: Theme.colors.primary, // Blue background
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40, // Added to move it lower
    marginBottom: Theme.spacing.medium,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorText: {
    color: '#FF0000',
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Theme.spacing.near,
  },
  backLink: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
    textAlign: 'center',
  },
});
