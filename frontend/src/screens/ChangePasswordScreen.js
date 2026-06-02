import React, { useState } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { CHANGE_PASSWORD_API_URL } from '../config';

export const ChangePasswordScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [loading, setLoading] = useState(false);

  // Verification phase
  const [currentPassword, setCurrentPassword] = useState('');
  const [isCurrentVerified, setIsCurrentVerified] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Upgraded phase (set new password)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleContinue = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Mohon masukkan password saat ini.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${CHANGE_PASSWORD_API_URL}?action=verify_current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          current_password: currentPassword,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setIsCurrentVerified(true);
      } else {
        Alert.alert("Gagal", result.message || "Password saat ini salah.");
      }
    } catch (err) {
      console.error("Verify current password error:", err);
      Alert.alert("Error", "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Semua kolom password baru harus diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Konfirmasi password baru tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password baru minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${CHANGE_PASSWORD_API_URL}?action=update_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        // Update plainPassword in AsyncStorage
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const cachedUser = JSON.parse(userStr);
          cachedUser.plainPassword = newPassword;
          await AsyncStorage.setItem('user', JSON.stringify(cachedUser));
        }

        Alert.alert(
          "Sukses",
          "Password Anda berhasil diperbarui!",
          [
            {
              text: "OK",
              onPress: () => navigation.pop(2) // Pop both ChangePassword and PasswordSecurity screens to return to Profile
            }
          ]
        );
      } else {
        Alert.alert("Gagal", result.message || "Gagal memperbarui password.");
      }
    } catch (err) {
      console.error("Save new password error:", err);
      Alert.alert("Error", "Gagal menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Same Cartoon Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../../assets/assets/pwd_security_banner.webp')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>

        {!isCurrentVerified ? (
          // STEP 1: Verify Current Password
          <View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Masukkan Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Masukkan password saat ini"
                  placeholderTextColor={Theme.colors.placeholder}
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)} 
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Theme.colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && { opacity: 0.8 }]} 
              onPress={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // STEP 2: Set New Password & Confirm New Password
          <View>
            {/* Set New Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Set New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Masukkan password baru"
                  placeholderTextColor={Theme.colors.placeholder}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)} 
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Theme.colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Konfirmasi password baru"
                  placeholderTextColor={Theme.colors.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Theme.colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && { opacity: 0.8 }]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    height: Theme.sizes.button.large,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
