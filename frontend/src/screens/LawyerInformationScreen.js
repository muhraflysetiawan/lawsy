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
  TextInput,
  Image,
  Alert,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AddressSelector } from '../components/AddressSelector';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LAWYER_PROFILE_API_URL } from '../config';

const { width } = Dimensions.get('window');

export const LawyerInformationScreen = ({ navigation, route }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertises, setExpertises] = useState([]);
  const [aboutMe, setAboutMe] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Add Certificate Modal State
  const [isAddCertModalVisible, setIsAddCertModalVisible] = useState(false);
  const [newCert, setNewCert] = useState({
    name: '',
    category: '',
    description: '',
    file: null,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setCurrentUser(userData);
        
        // Fetch existing profile from backend
        const response = await fetch(`${LAWYER_PROFILE_API_URL}?action=get_profile&user_id=${userData.id}`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          const profile = result.data;
          setExpertises(profile.expertise || []);
          setAboutMe(profile.about_me || '');
          setLocation(profile.location || '');
          setLatitude(profile.latitude ? parseFloat(profile.latitude) : null);
          setLongitude(profile.longitude ? parseFloat(profile.longitude) : null);
          setCertifications(profile.certifications || []);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const payload = {
        user_id: currentUser.id,
        location: location,
        latitude: latitude,
        longitude: longitude,
        expertise: expertises,
        about_me: aboutMe,
        certifications: certifications,
      };

      const response = await fetch(`${LAWYER_PROFILE_API_URL}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpertise = () => {
    if (!expertiseInput.trim()) return;
    if (expertises.length >= 10) {
      Alert.alert('Limit Reached', 'You can only add up to 10 areas of expertise.');
      return;
    }
    if (!expertises.includes(expertiseInput.trim())) {
      setExpertises([...expertises, expertiseInput.trim()]);
    }
    setExpertiseInput('');
  };

  const removeExpertise = (index) => {
    const newExpertises = [...expertises];
    newExpertises.splice(index, 1);
    setExpertises(newExpertises);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setNewCert({ ...newCert, file: result.assets[0] });
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleAddCertificate = () => {
    if (!newCert.name || !newCert.category || !newCert.description || !newCert.file) {
      Alert.alert('Incomplete Form', 'Please fill all fields and upload a certificate.');
      return;
    }

    const certificate = {
      ...newCert,
      id: Math.random().toString(),
      uploadDate: new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    setCertifications([certificate, ...certifications]);
    setNewCert({ name: '', category: '', description: '', file: null });
    setIsAddCertModalVisible(false);
  };

  const removeCertification = (id) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="help-circle-outline" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>
 
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?u=' + (currentUser?.id || 'default') }}
            style={styles.profilePic}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{currentUser?.name || 'Lawyer'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={Theme.colors.primary} style={{ marginRight: 5 }} />
              {location ? (
                <>
                  <Text style={styles.locationText}>{location} | </Text>
                  <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                    <Text style={styles.editText}>edit</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                  <Text style={styles.editText}>Set location</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.lawyerTypeBadge}>
              <Text style={styles.lawyerTypeText}>{currentUser?.specialization || 'Lawyer'}</Text>
            </View>
          </View>
        </View>

        {/* Areas of Expertise Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas of Expertise</Text>
          <View style={styles.expertiseInputContainer}>
            <TextInput
              style={styles.expertiseInput}
              placeholder="Add expertise (e.g. Family Law)"
              placeholderTextColor={Theme.colors.placeholder}
              value={expertiseInput}
              onChangeText={setExpertiseInput}
              onSubmitEditing={handleAddExpertise}
            />
            <TouchableOpacity onPress={handleAddExpertise} style={styles.addIcon}>
              <Ionicons name="add-circle" size={32} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {expertises.map((item, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{item}</Text>
                <TouchableOpacity onPress={() => removeExpertise(index)} style={styles.removeTag}>
                  <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* About Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Tell clients about your experience and skills..."
              placeholderTextColor={Theme.colors.placeholder}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
              value={aboutMe}
              onChangeText={setAboutMe}
            />
            <Text style={styles.charCount}>{aboutMe.length}/1000</Text>
          </View>
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={() => setIsAddCertModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={Theme.colors.primary} />
            <Text style={styles.uploadText}>Add Certificate</Text>
          </TouchableOpacity>
          
          <View style={styles.certList}>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.certCard}>
                <View style={styles.certCategoryBadge}>
                  <Text style={styles.certCategoryText}>{cert.category}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeCertBtn} 
                  onPress={() => removeCertification(cert.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
                
                <Text style={styles.certCardName}>{cert.name}</Text>
                <Text style={styles.certCardDesc} numberOfLines={2}>
                  {cert.description}
                </Text>
                
                <View style={styles.certCardFooter}>
                  <Text style={styles.certDate}>{cert.uploadDate}</Text>
                  <TouchableOpacity 
                    onPress={() => Alert.alert('Certificate View', `Viewing ${cert.file?.name}`)}
                  >
                    <Text style={styles.viewLink}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <AddressSelector 
            onCancel={() => setShowAddressModal(false)}
            onSave={(result) => {
              const addressString = `${result.kabupaten}, ${result.provinsi}`;
              setLocation(addressString);
              setLatitude(result.latitude);
              setLongitude(result.longitude);
              setShowAddressModal(false);
            }}
          />
        </View>
      </Modal>

      {/* Add Certificate Modal */}
      <Modal
        visible={isAddCertModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddCertModalVisible(false)}
      >
        <View style={styles.certModalOverlay}>
          <View style={styles.certModalContent}>
            <View style={styles.certModalHeader}>
              <Text style={styles.certModalTitle}>Add Certificate</Text>
              <TouchableOpacity onPress={() => setIsAddCertModalVisible(false)}>
                <Ionicons name="close" size={24} color={Theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Certificate Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter certificate name"
                  value={newCert.name}
                  onChangeText={(text) => setNewCert({ ...newCert, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Legal Category</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Criminal Law, Civil Law"
                  value={newCert.category}
                  onChangeText={(text) => setNewCert({ ...newCert, category: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Tell us about this certificate..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={newCert.description}
                  onChangeText={(text) => setNewCert({ ...newCert, description: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Upload Certificate</Text>
                <TouchableOpacity style={styles.filePicker} onPress={handlePickDocument}>
                  <Ionicons 
                    name={newCert.file ? "document-attach" : "cloud-upload"} 
                    size={24} 
                    color={Theme.colors.primary} 
                  />
                  <Text style={styles.filePickerText} numberOfLines={1}>
                    {newCert.file ? newCert.file.name : "Select Certificate File"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddCertificate}>
                <Text style={styles.modalAddBtnText}>Add</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
  },
  editText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  lawyerTypeBadge: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  lawyerTypeText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 2, // Reduced spacing to input
  },
  expertiseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  expertiseInput: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    color: Theme.colors.text,
  },
  addIcon: {
    marginLeft: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#FFFFFF',
    marginRight: 5,
  },
  removeTag: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textArea: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    color: Theme.colors.text,
    lineHeight: 22,
  },
  charCount: {
    textAlign: 'right',
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
    marginTop: 5,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.primary,
    marginLeft: 10,
  },
  certList: {
    marginBottom: 10,
  },
  certCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  certCategoryBadge: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)', // Primary with low opacity
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  certCategoryText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },
  certCardName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  certCardDesc: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  certCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  certDate: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  viewLink: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
    textDecorationLine: 'underline',
  },
  removeCertBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  certModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  certModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  certModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  certModalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    color: Theme.colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  formTextArea: {
    height: 100,
    paddingTop: 12,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  filePickerText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
    marginLeft: 10,
    flex: 1,
  },
  modalAddBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalAddBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
