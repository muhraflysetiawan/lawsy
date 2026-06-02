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
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';


import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGISTRATION_API_URL } from '../config';


import { Theme } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';

export const LawyerRegistrationStep2 = ({ navigation }) => {
  const [docs, setDocs] = useState({
    identity: null,
    license: null,
    oath: null,
    degree: null,
    skill: null, // Optional
  });
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [uploading, setUploading] = useState(null); // type being uploaded

  const handleUpload = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // 2MB Limit
      if (file.size > 2 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Maximum file size is 2MB.');
        return;
      }

      setUploading(type);
      const userStr = await AsyncStorage.getItem('user');
      const user = JSON.parse(userStr);

      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('doc_type', type);
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      const response = await fetch(`${REGISTRATION_API_URL}?action=upload_doc`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const resData = await response.json();
      if (resData.status === 'success') {
        setDocs({ 
          ...docs, 
          [type]: { 
            name: file.name, 
            size: file.size, 
            path: resData.file_path 
          } 
        });
        Alert.alert('Success', `${file.name} uploaded successfully.`);
      } else {
        Alert.alert('Upload Failed', resData.message || 'Unknown error');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploading(null);
    }
  };


  const handleSubmit = () => {
    if (!docs.identity || !docs.license || !docs.oath || !docs.degree) {
      Alert.alert('Missing Documents', 'Please upload all required documents before submitting.');
      return;
    }

    setShowStatusModal(true);
  };

  const handleFinalSubmit = () => {
    setShowStatusModal(false);
    navigation.navigate('LawyerRegistrationStep3');
  };



  const DocumentCard = ({ title, caption, type, isOptional = false }) => {
    const getIcon = () => {
      switch (type) {
        case 'identity': return 'card-outline';
        case 'license': return 'ribbon-outline';
        case 'oath': return 'document-text-outline';
        case 'degree': return 'school-outline';
        case 'skill': return 'certificate-outline';
        default: return 'document-outline';
      }
    };

    return (
      <View style={styles.docCard}>
        <View style={styles.docCardHeader}>
          <View style={styles.iconBackground}>
            <Ionicons name={getIcon()} size={24} color={Theme.colors.primary} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>
              {title} {isOptional && <Text style={styles.optionalText}>(Opsional)</Text>}
            </Text>
            <Text style={styles.docCaption}>{caption}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.uploadButton, docs[type] && styles.uploadedButton]} 
          onPress={() => handleUpload(type)}
          disabled={uploading !== null}
        >
          {uploading === type ? (
            <ActivityIndicator color={Theme.colors.primary} />
          ) : (
            <>
              <Ionicons 
                name={docs[type] ? "checkmark-circle" : "cloud-upload-outline"} 
                size={20} 
                color={docs[type] ? "#4CAF50" : Theme.colors.primary} 
              />
              <Text style={[styles.uploadButtonText, docs[type] && styles.uploadedButtonText]}>
                {docs[type] ? "File Uploaded" : "Upload Document"}
              </Text>
            </>
          )}
        </TouchableOpacity>

      </View>
    );
  };

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
            <Text style={styles.stepText}>Step 2 of 3</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '66.66%' }]} />
          </View>
        </View>

        {/* Title & Caption */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Upload Documents</Text>
          <Text style={styles.caption}>
            Please provide high-quality scans or clear photographs of your professional credentials for verification.
          </Text>
        </View>

        {/* Document List */}
        <View style={styles.docList}>
          <DocumentCard 
            type="identity"
            title="Identity Card (KTP/Passport)"
            caption="Valid government-issued identification."
          />
          <DocumentCard 
            type="license"
            title="Lawyer License (KAI)"
            caption="Official certificate from the Advocate Association."
          />
          <DocumentCard 
            type="oath"
            title="Legal Oath Doc"
            caption="Official Legal Oath from the Advocate."
          />
          <DocumentCard 
            type="degree"
            title="Educational Degree"
            caption="Bachelor of Law (S.H.) or Master's certificate."
          />
          <DocumentCard 
            type="skill"
            title="Sertifikasi Keahlian"
            caption="Unggah sertifikat spesialisasi atau pelatihan hukum lainnya."
            isOptional={true}
          />
        </View>

        {/* Verification Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="shield-checkmark" size={24} color={Theme.colors.primary} style={styles.alertIcon} />
            <Text style={styles.alertTitle}>Verification Required</Text>
          </View>
          <Text style={styles.alertDescription}>
            By uploading these documents, you authorize the verification committee to validate your credentials with the relevant legal and educational institutions.
          </Text>
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Submit Registration"
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.footerInfo}>
          <Ionicons name="lock-closed" size={14} color="#999999" style={{ marginRight: 5 }} />
          <Text style={styles.footerCaption}>
            Secure 256-bit SSL encrypted connection
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Document Status Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon Card */}
            <View style={styles.modalIconCard}>
              <Ionicons name="cloud-done" size={60} color={Theme.colors.primary} />
            </View>

            <Text style={styles.modalTitle}>Documents Uploaded</Text>
            <Text style={styles.modalCaption}>
              All your legal credentials have been successfully uploaded. Please review the list below before final submission.
            </Text>

            <View style={styles.verifiedSection}>
              <Text style={styles.verifiedTitle}>Verified Documents</Text>
              
              <View style={styles.verifiedListContainer}>
                <ScrollView style={styles.verifiedList} showsVerticalScrollIndicator={false}>
                  <VerifiedItem icon="card-outline" label="Identity Card" />
                  <VerifiedItem icon="ribbon-outline" label="Lawyer License (KAI)" />
                  <VerifiedItem icon="document-text-outline" label="Legal Oath Doc" />
                  <VerifiedItem icon="school-outline" label="Educational Degree" />
                  {docs.skill && <VerifiedItem icon="certificate-outline" label="Sertifikasi Keahlian" />}
                </ScrollView>
              </View>

            </View>

            <CustomButton
              title="Next"
              onPress={handleFinalSubmit}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const VerifiedItem = ({ icon, label }) => (
  <View style={styles.verifiedItem}>
    <View style={styles.verifiedIconBg}>
      <Ionicons name={icon} size={18} color={Theme.colors.primary} />
    </View>
    <View style={styles.verifiedTextContainer}>
      <Text style={styles.verifiedItemText}>{label}</Text>
      <Text style={styles.verifiedStatus}>Uploaded Successfully</Text>
    </View>
    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
  </View>
);



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
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
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
  docList: {
    marginBottom: 20,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  docCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  optionalText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#999999',
  },
  docCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  uploadedButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderColor: '#4CAF50',
    borderStyle: 'solid',
  },
  uploadButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
    marginLeft: 8,
  },
  uploadedButtonText: {
    color: '#4CAF50',
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
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  modalIconCard: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: Theme.colors.text,
    marginBottom: 10,
  },
  modalCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  verifiedSection: {
    width: '100%',
    marginBottom: 30,
  },
  verifiedTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 10,
  },
  verifiedListContainer: {
    maxHeight: 200, // Limit the height of the list
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  verifiedList: {
    width: '100%',
  },

  verifiedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  verifiedIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  verifiedItemText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  verifiedStatus: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  modalButton: {
    width: '100%',
  },
});


