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
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGISTRATION_API_URL } from '../config';
import * as WebBrowser from 'expo-web-browser';

export const LawyerRegistrationSummary = ({ navigation, route }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const response = await fetch(`${REGISTRATION_API_URL}?action=get_registration_data&user_id=${user.id}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        setData(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch registration data');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (path) => {
    if (!path) return;
    // Assuming the path is relative to the backend root
    const baseUrl = REGISTRATION_API_URL.replace('/lawyer_registration.php', '/');
    const fullUrl = baseUrl + path;
    await WebBrowser.openBrowserAsync(fullUrl);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb.toFixed(1) + ' KB';
  };

  const getFileName = (path) => {
    if (!path) return 'Not uploaded';
    return path.split('/').pop();
  };


  const handleSubmit = () => {
    if (!agreed) {
      Alert.alert('Agreement Required', 'Please agree to the Terms of Service and Privacy Policy before submitting.');
      return;
    }

    navigation.navigate('VerificationPending');
  };


  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const DocumentItem = ({ icon, name, path, size }) => (
    <TouchableOpacity 
      style={styles.docCard}
      onPress={() => handlePreview(path)}
      disabled={!path}
    >
      <View style={styles.docIconBg}>
        <Ionicons name={icon} size={20} color={Theme.colors.primary} />
      </View>
      <View style={styles.docTextContainer}>
        <Text style={styles.docName}>{name}</Text>
        <Text style={styles.docSize}>{getFileName(path)} • {formatSize(size)}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (!data) return null;

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
            <Text style={styles.stepText}>Step 3 of 3</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '100%' }]} />
          </View>
        </View>

        <Text style={styles.caption}>
          Please review your information carefully before submitting.
        </Text>

        {/* Professional Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.sectionCard}>
            <InfoRow label="Full Name" value={data.full_name} />
            <View style={styles.divider} />
            <InfoRow label="Bar Association" value="Indonesian Bar Association (PERADI)" />
            <View style={styles.divider} />
            <InfoRow label="Licence Number" value="LAWSY-2026-REG-778" />
            <View style={styles.divider} />
            <InfoRow label="Years of Practice" value={`${data.years_experience} Years`} />
          </View>
        </View>

        {/* Uploaded Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          <DocumentItem 
            icon="card-outline" 
            name="Identity Card" 
            path={data.id_card_path} 
            size={null} // Size isn't stored in DB yet, could be added later
          />
          <DocumentItem 
            icon="ribbon-outline" 
            name="Lawyer License (KAI)" 
            path={data.lawyer_license_path} 
            size={null}
          />
          <DocumentItem 
            icon="document-text-outline" 
            name="Legal Oath Doc" 
            path={data.oath_doc_path} 
            size={null}
          />
          <DocumentItem 
            icon="school-outline" 
            name="Educational Degree" 
            path={data.degree_path} 
            size={null}
          />
        </View>


        {/* Terms Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxText}>
            I hereby certify that the information provided is true and accurate. I agree to the{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <CustomButton
          title="Submit Application"
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.footerInfo}>
          <Ionicons name="lock-closed" size={14} color="#999999" style={{ marginRight: 5 }} />
          <Text style={styles.footerCaption}>
            Secure encrypted submission
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    marginBottom: 20,
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
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },
  caption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 15,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: {
    paddingVertical: 5,
  },
  infoLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#888888',
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  docTextContainer: {
    flex: 1,
  },
  docName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  docSize: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  linkText: {
    color: Theme.colors.primary,
    textDecorationLine: 'underline',
    fontFamily: Theme.fonts.bold,
  },
  submitButton: {
    marginBottom: 15,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#999999',
  },
});
