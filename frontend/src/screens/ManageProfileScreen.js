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
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { USER_PROFILE_API_URL, NGROK_URL } from '../config';

export const ManageProfileScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  
  // Image states
  const [avatarUri, setAvatarUri] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);

  // DatePicker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${USER_PROFILE_API_URL}?action=get&user_id=${user.id}`);
      const result = await response.json();
      if (result.status === 'success' && result.user) {
        setName(result.user.name || '');
        setEmail(result.user.email || '');
        setDob(result.user.dob || '');
        setAddress(result.user.address || '');
        
        if (result.user.profile_image) {
          const imgUrl = result.user.profile_image.startsWith('http') 
            ? result.user.profile_image 
            : `${NGROK_URL}/lawsy/backend/${result.user.profile_image}`;
          setCurrentAvatar(imgUrl);
          setAvatarUri(imgUrl);
        }
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      Alert.alert("Error", "Gagal memuat profil terbaru.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Mohon izinkan akses galeri untuk mengupload foto profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDob(formattedDate);
      setPickerDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Nama dan Email tidak boleh kosong.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('name', name);
      formData.append('email', email);
      formData.append('dob', dob || '');
      formData.append('address', address || '');

      if (avatarUri && avatarUri !== currentAvatar) {
        const uriParts = avatarUri.split('/');
        const fileName = uriParts[uriParts.length - 1];
        const fileType = fileName.split('.').pop().toLowerCase();
        
        formData.append('profile_image', {
          uri: Platform.OS === 'android' ? avatarUri : avatarUri.replace('file://', ''),
          name: fileName,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      }

      const response = await fetch(`${USER_PROFILE_API_URL}?action=update`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (result.status === 'success' && result.user) {
        // Update AsyncStorage cached user
        const userStr = await AsyncStorage.getItem('user');
        const cachedUserObj = userStr ? JSON.parse(userStr) : user;
        const updatedUser = {
          ...cachedUserObj,
          name: result.user.name,
          email: result.user.email,
          profile_image: result.user.profile_image,
          dob: result.user.dob,
          address: result.user.address,
        };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        Alert.alert(
          "Sukses", 
          "Profil Anda berhasil diperbarui!",
          [
            { 
              text: "OK", 
              onPress: () => {
                if (route.params?.onRefresh) {
                  route.params.onRefresh();
                }
                navigation.goBack();
              } 
            }
          ]
        );
      } else {
        Alert.alert("Gagal", result.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      Alert.alert("Error", "Terjadi kesalahan koneksi saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    if (Platform.OS === 'ios') {
      return (
        <View style={styles.iosDatePickerContainer}>
          <View style={styles.iosDatePickerHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={{ color: '#FF3B30', fontSize: 16, fontFamily: Theme.fonts.bold }}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={{ color: Theme.colors.primary, fontSize: 16, fontFamily: Theme.fonts.bold }}>Selesai</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        </View>
      );
    }

    return (
      <DateTimePicker
        value={pickerDate}
        mode="date"
        display="default"
        onChange={onDateChange}
        maximumDate={new Date()}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header aligned as requested */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture centered */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.9}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={70} color="#BDBDBD" />
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Nama</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor={Theme.colors.placeholder}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputField}
              placeholder="Masukkan alamat email"
              placeholderTextColor={Theme.colors.placeholder}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Birth Date Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Tanggal Lahir</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.inputFieldText, !dob && { color: Theme.colors.placeholder }]}>
              {dob || "Pilih Tanggal Lahir"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={Theme.colors.primary} style={{ marginRight: 16 }} />
          </TouchableOpacity>
        </View>

        {/* Address Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Alamat</Text>
          <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start' }]}>
            <TextInput
              style={[styles.inputField, { height: '100%', paddingVertical: 12, textAlignVertical: 'top' }]}
              placeholder="Masukkan alamat lengkap"
              placeholderTextColor={Theme.colors.placeholder}
              multiline
              numberOfLines={4}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.8 }]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>

        {renderDatePicker()}
        <View style={{ height: 40 }} />
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: Theme.colors.primary,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
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
    backgroundColor: Theme.colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  inputField: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    height: '100%',
    paddingHorizontal: 16,
  },
  inputFieldText: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    paddingHorizontal: 16,
  },
  saveButton: {
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
  saveButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  iosDatePickerContainer: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    paddingBottom: 20,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
});
