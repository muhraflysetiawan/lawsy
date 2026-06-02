import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';
import { REGISTRATION_API_URL } from '../config';


const { width } = Dimensions.get('window');

export const LawyerRegistrationStep3 = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [progress, setProgress] = useState(0);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const progressInterval = useRef(null);

  const cameraRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      // Scanning animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Progress simulation
      progressInterval.current = setInterval(async () => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            setIsScanning(false);
            handleCapture();
            return 100;
          }
          return prev + 1;
        });
      }, 50);
    } else {
      scanAnim.setValue(0);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isScanning]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
        });

        const userStr = await AsyncStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch(`${REGISTRATION_API_URL}?action=save_face_scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            image: photo.base64,
          }),
        });

        const result = await response.json();
        if (result.status === 'success') {
          setShowSuccessModal(true);
        } else {
          Alert.alert('Upload Failed', result.message || 'Failed to save face scan');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to capture face scan');
      }
    }
  };


  const handleStartScanning = async () => {
    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required for face scanning.');
        return;
      }
    }
    setIsScanning(true);
    setProgress(0);
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
    navigation.navigate('LawyerRegistrationSummary'); 
  };



  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 290], // Height of camera circle
  });


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

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Face Scan</Text>
          <Text style={styles.caption}>
            Please complete the biometric check to finalize your lawyer registration.
          </Text>
        </View>

        {/* Camera Section */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraOutline}>
            <View style={styles.cameraCircle}>
              {permission.granted ? (
                <CameraView 
                  ref={cameraRef}
                  style={styles.camera} 
                  facing="front"
                >

                  {isScanning && (
                    <Animated.View 
                      style={[
                        styles.scanLine, 
                        { transform: [{ translateY }] }
                      ]} 
                    />
                  )}
                </CameraView>
              ) : (
                <View style={[styles.camera, styles.noPermission]}>
                  <Ionicons name="camera-reverse-outline" size={60} color="#CCCCCC" />
                  <Text style={styles.noPermissionText}>Camera Access Required</Text>
                </View>
              )}
            </View>
            
            {/* Progress Badge - Integrated with bottom outline */}
            {isScanning && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  Scanning {progress}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Alert Card */}
        <View style={styles.alertCard}>
          <Ionicons name="scan-outline" size={24} color={Theme.colors.primary} style={styles.alertIcon} />
          <Text style={styles.alertDescription}>
            Position your face within the frame
          </Text>
        </View>

        {/* Start Button */}
        <CustomButton
          title={isScanning ? "Scanning..." : "Start Scanning"}
          onPress={handleStartScanning}
          disabled={isScanning}
          style={styles.startButton}
        />
      </View>

      {/* Face Scan Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon Card */}
            <View style={styles.modalIconCard}>
              <Ionicons name="checkmark-circle" size={80} color={Theme.colors.primary} />
            </View>

            <Text style={styles.modalTitle}>Face Scan Verified</Text>
            <Text style={styles.modalCaption}>
              Your face scan has been checked and verified by the system. Please proceed to the next step for the summary stage.
            </Text>

            <CustomButton
              title="Processed"
              onPress={handleFinish}
              style={styles.modalButton}
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
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  titleSection: {
    marginBottom: 40,
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  cameraOutline: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 12,
    borderColor: Theme.colors.primary,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraCircle: {
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  noPermission: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  noPermissionText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#999999',
    marginTop: 10,
  },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  progressBadge: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#F8F9FA',
    zIndex: 10,
  },
  progressText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 80, 131, 0.1)',
    marginBottom: 20,
    justifyContent: 'center',
  },
  alertIcon: {
    marginRight: 12,
  },
  alertDescription: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  startButton: {
    marginTop: 10,
    marginBottom: 30,
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
    height: 140,
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
  modalButton: {
    width: '100%',
  },
});


