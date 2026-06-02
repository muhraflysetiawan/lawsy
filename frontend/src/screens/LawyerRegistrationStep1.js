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
  Dimensions,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGISTRATION_API_URL } from '../config';



import { Theme } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';

const { width } = Dimensions.get('window');

const specializations = [
  'Corporate Law',
  'Criminal Law',
  'Civil Law',
  'Family Law',
  'Intellectual Property',
  'Labor Law',
  'Tax Law',
  'Real Estate Law',
  'Environmental Law',
  'International Law',
];

export const LawyerRegistrationStep1 = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [lawFirm, setLawFirm] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [biography, setBiography] = useState('');
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleNextStep = async () => {
    if (!fullName || !lawFirm || !specialization || !yearsExperience || !biography) {
      Alert.alert('Form Incomplete', 'Please fill in all required fields to continue.');
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const response = await fetch(`${REGISTRATION_API_URL}?action=save_step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          fullName,
          lawFirm,
          specialization,
          yearsExperience,
          biography
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        navigation.navigate('LawyerRegistrationStep2');
      } else {
        Alert.alert('Error', result.message || 'Failed to save information');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Connection failed');
    } finally {
      setLoading(false);
    }
  };



  const renderSpecializationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSpecialization(item);
        setShowSpecializationModal(false);
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lawyer Registration</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="help-circle-outline" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Registration Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Registration Progress</Text>
            <Text style={styles.stepText}>Step 1 of 3</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '33.33%' }]} />
          </View>
        </View>

        {/* Title & Caption */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Professional Information</Text>
          <Text style={styles.caption}>
            Please provide your legal credentials to help clients find the right representation.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <CustomInput
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <CustomInput
            label="Current Law Firm"
            placeholder="Enter your current law firm"
            value={lawFirm}
            onChangeText={setLawFirm}
          />

          <View style={styles.rowInputs}>
            <View style={[styles.inputWrapper, { marginRight: 10 }]}>
              <Text style={styles.label}>Primary Specialization</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => setShowSpecializationModal(true)}
              >
                <Text style={[styles.dropdownValue, !specialization && { color: Theme.colors.placeholder }]}>
                  {specialization || 'Select'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { marginLeft: 10 }]}>
              <Text style={styles.label}>Years of Experience</Text>
              <View style={styles.numberInputContainer}>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  placeholderTextColor={Theme.colors.placeholder}
                  keyboardType="numeric"
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Professional Biography</Text>
            <View style={styles.biographyContainer}>
              <TextInput
                style={styles.biographyInput}
                placeholder="Maximum 1000 characters"
                placeholderTextColor={Theme.colors.placeholder}
                multiline
                maxLength={1000}
                numberOfLines={5}
                textAlignVertical="top"
                value={biography}
                onChangeText={setBiography}
              />
            </View>
          </View>
        </View>

        {/* Verification Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="information-circle" size={24} color={Theme.colors.primary} style={styles.alertIcon} />
            <Text style={styles.alertTitle}>Verification Required</Text>
          </View>
          <Text style={styles.alertDescription}>
            We will verify your bar association status in the next step. Please ensure all details are accurate.
          </Text>
        </View>

        {/* Next Step Button */}
        <CustomButton
          title="Next Step"
          onPress={handleNextStep}
          style={styles.nextButton}
          loading={loading}
        />


        <Text style={styles.footerCaption}>
          By continuing, you agree to our Terms of Service for Professional Accounts.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Specialization Modal */}
      <Modal
        visible={showSpecializationModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Specialization</Text>
              <TouchableOpacity onPress={() => setShowSpecializationModal(false)}>
                <Ionicons name="close" size={24} color={Theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={specializations}
              renderItem={renderSpecializationItem}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
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
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginTop: 10,
    marginBottom: 25,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#888888',
  },
  stepText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(29, 80, 131, 0.1)', // Primary color with low opacity
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  titleSection: {
    marginBottom: 25,
  },
  mainTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 26,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  caption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.near,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: Theme.spacing.near,
  },
  label: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: Theme.sizes.input.height,
    borderRadius: 12,
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dropdownValue: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  numberInputContainer: {
    height: Theme.sizes.input.height,
    borderRadius: 12,
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: 'center',
  },
  numberInput: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    height: '100%',
  },
  biographyContainer: {
    minHeight: 120,
    borderRadius: 12,
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  biographyInput: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    flex: 1,
  },
  alertCard: {
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 80, 131, 0.1)',
    marginBottom: 25,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.primary,
  },
  alertDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  nextButton: {
    marginBottom: 15,
  },
  footerCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: Theme.colors.text,
  },
});
