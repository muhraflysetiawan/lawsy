import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

export const PasswordSecurityScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(route.params.user);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    loadUser();
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error("Load user in PasswordSecurityScreen error:", e);
    }
  };

  const securePasswordMask = "••••••••••••";
  const realPassword = user.plainPassword || "password123";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Generated Cartoon Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../assets/assets/pwd_security_banner.webp')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>

        {/* Email Field (Card style, not editable) */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Theme.colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              value={user.email}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>
        </View>

        {/* Password Field (Card style, not editable, toggleable eye icon) */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.inputField, { secureTextEntry: !isPasswordVisible }]}
              value={isPasswordVisible ? realPassword : securePasswordMask}
              editable={false}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity 
              onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
              style={styles.eyeButton}
            >
              <Ionicons 
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={Theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password Link */}
        <TouchableOpacity 
          style={styles.linkContainer}
          onPress={() => navigation.navigate('ChangePassword', { user })}
        >
          <Text style={styles.linkText}>Change Password?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
  },
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
  inputWrapper: {
    marginBottom: Theme.spacing.near,
  },
  inputLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Theme.sizes.input.height,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    height: '100%',
  },
  eyeButton: {
    padding: 8,
  },
  linkContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  linkText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
});
