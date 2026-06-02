import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Platform, Alert, Dimensions } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Theme } from '../theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { HeaderSection } from '../components/HeaderSection';

const { height } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rememberedEmail = await AsyncStorage.getItem('remembered_email');
        if (rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleSignIn = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and Password cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        const userWithPwd = { ...result.user, plainPassword: password };
        await AsyncStorage.setItem('user', JSON.stringify(userWithPwd));
        
        if (rememberMe) {
          await AsyncStorage.setItem('remembered_email', email);
        } else {
          await AsyncStorage.removeItem('remembered_email');
        }
        
        Alert.alert('Success', `Welcome back, ${result.user.name}!`);
        
        if (result.user.role === 'Superadmin') {
          navigation.navigate('AdminRequests');
        } else {
          navigation.navigate('Home', { user: result.user });
        }
      } else {


        setError(result.message || 'Login failed');
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
      {/* Background Image */}
      <ImageBackground
        source={require('../../assets/background-login.webp')}
        style={styles.backgroundImage}
      >
        {/* Header Section (Static at top) */}
        <HeaderSection
          title="Let’s Get Your Sign In"
          caption="Let’s Get You Logged In to Access Trusted Legal Services"
        />

        {/* Static Card Section */}
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
              <Text style={[styles.dividerText, { color: Theme.colors.primary }]}>Or Sign In with</Text>
              <View style={[styles.dividerLine, { backgroundColor: Theme.colors.primary }]} />
            </View>

            {/* Alert/Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Inputs with Labels */}
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

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.rememberForgotRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer} 
                onPress={() => setRememberMe(!rememberMe)}
              >
                <Ionicons 
                  name={rememberMe ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={Theme.colors.primary} 
                />
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <CustomButton
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleSignIn}
              style={{ marginTop: Theme.spacing.medium }}
              disabled={loading}
            />

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don’t Have an Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign Up Here</Text>
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
    marginTop: 20, // Distance from header caption
    paddingHorizontal: Theme.spacing.medium,
    paddingTop: Theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden', // Keep border radius on scroll
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
  forgotPasswordText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
    textAlign: 'right',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Theme.spacing.near,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.near,
  },
  registerText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  registerLink: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
});
