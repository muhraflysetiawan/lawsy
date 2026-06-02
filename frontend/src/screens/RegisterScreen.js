import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Platform, Alert, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { HeaderSection } from '../components/HeaderSection';

const { height } = Dimensions.get('window');

export const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch (error) {
      console.error(error);
      setError('Connection error. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background-login.webp')}
        style={styles.backgroundImage}
      >
        <HeaderSection
          title="Create Account"
          caption="Let’s Get You Logged In to Access Trusted Legal Services"
        />

        <View style={styles.card}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.cardScrollContent}
            bounces={false}
          >
            {/* Social Logins - Side by Side */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={30} color="#4285F4" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={30} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Divider - Blue Color */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: Theme.colors.primary }]} />
              <Text style={[styles.dividerText, { color: Theme.colors.primary }]}>Or Sign Up with</Text>
              <View style={[styles.dividerLine, { backgroundColor: Theme.colors.primary }]} />
            </View>

            {/* Alert/Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Inputs with Labels */}
            <CustomInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
            <CustomInput
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Sign Up Button */}
            <CustomButton
              title={loading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignUp}
              style={{ marginTop: Theme.spacing.near }}
              disabled={loading}
            />

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>You Have an Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log'in here</Text>
              </TouchableOpacity>
            </View>
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
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Theme.spacing.near,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.near,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    marginHorizontal: 8,
  },
  errorText: {
    color: '#FF0000',
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Theme.spacing.near,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.near,
  },
  loginText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  loginLink: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
});
