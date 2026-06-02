import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  Clipboard,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Theme } from '../theme';
import { GET_OR_CREATE_PAYMENT_API_URL, CHECK_PAYMENT_STATUS_API_URL } from '../config';

export const PaymentScreen = ({ navigation, route }) => {
  const { caseId } = route.params;
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState('59:59');

  useEffect(() => {
    fetchPayment();
  }, []);

  const fetchPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(GET_OR_CREATE_PAYMENT_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ case_id: caseId }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setPaymentData(result);
      } else {
        Alert.alert('Error', result.message || 'Failed to initialize payment.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch payment details. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const parsePHPDate = (dateStr) => {
    if (!dateStr) return new Date();
    // format: YYYY-MM-DD HH:MM:SS
    const parts = dateStr.split(/[- :]/);
    // Month is 0-indexed in JavaScript Date
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  };

  useEffect(() => {
    if (!paymentData || !paymentData.created_at) return;

    const updateTimer = () => {
      const createdTime = parsePHPDate(paymentData.created_at).getTime();
      const now = Date.now();
      const diff = 3600000 - (now - createdTime); // 1 hour validity

      if (diff <= 0) {
        setTimeLeft('00:00');
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [paymentData]);

  const handleCopyTransactionId = () => {
    if (!paymentData || !paymentData.qris_url) return;
    Clipboard.setString(paymentData.qris_url);
    Alert.alert(
      'URL Copied', 
      'QRIS Image URL copied to clipboard! Opening Midtrans Simulator...',
      [
        { 
          text: 'OK', 
          onPress: () => {
            Linking.openURL('https://simulator.sandbox.midtrans.com/v2/qris/index');
          } 
        }
      ]
    );
  };

  const handleSaveQRIS = async () => {
    try {
      if (!paymentData || !paymentData.qris_url) return;
      
      const fileUri = `${FileSystem.documentDirectory}lawsy_qris_${Date.now()}.png`;
      const downloadRes = await FileSystem.downloadAsync(paymentData.qris_url, fileUri);
      
      if (downloadRes.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          Alert.alert('Success', 'QRIS image downloaded successfully!');
        }
      }
    } catch (error) {
      console.error('Save QRIS error:', error);
      Alert.alert('Error', 'Failed to save QRIS to gallery.');
    }
  };

  const handleCheckStatus = async (force = false) => {
    setCheckingStatus(true);
    try {
      const response = await fetch(CHECK_PAYMENT_STATUS_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ case_id: caseId, force_success: force }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        if (result.payment_status === 'Success') {
          Alert.alert(
            'Payment Verified', 
            'Your payment was successfully processed. Chat is now unlocked!',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  navigation.goBack();
                } 
              }
            ]
          );
        } else {
          Alert.alert(
            'Payment Pending',
            'We have not received your payment yet. Please complete the QRIS payment and wait a few moments before checking again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to verify payment status.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to the server. Please try again.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const steps = [
    { id: 1, text: 'Open your e-wallet app (GoPay, OVO, Dana) or mobile banking.' },
    { id: 2, text: "Select the Scan or Pay menu on the app's main screen." },
    { id: 3, text: 'Point your camera at the QR code shown above.' },
    { id: 4, text: 'Check the payment amount and confirm your transaction.' }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Initializing Midtrans QRIS...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Complete Payment Alert Card */}
        <View style={styles.alertCard}>
          <Text style={styles.alertText}>Complete payment</Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={16} color="#FFFFFF" style={styles.timerIcon} />
            <Text style={styles.timerText}>{timeLeft}</Text>
          </View>
        </View>

        {/* Total Payment Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total payment</Text>
          <Text style={styles.totalValue}>{formatCurrency(paymentData?.total_cost || 0)}</Text>
          
          <TouchableOpacity onPress={handleCopyTransactionId} style={styles.txIdContainer}>
            <Text style={styles.txIdText}>{paymentData?.order_id}</Text>
            <Ionicons name="copy-outline" size={14} color="#FFFFFF" style={styles.copyIcon} />
          </TouchableOpacity>
        </View>

        {/* QRIS Card */}
        <View style={styles.qrisCard}>
          {paymentData?.qris_url ? (
            <Image 
              source={{ uri: paymentData.qris_url }} 
              style={styles.qrisImage} 
              resizeMode="contain" 
            />
          ) : (
            <View style={styles.qrisPlaceholder}>
              <ActivityIndicator color={Theme.colors.primary} />
            </View>
          )}

          <TouchableOpacity onPress={handleSaveQRIS} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save QRIS to gallery</Text>
          </TouchableOpacity>

          <Text style={styles.scanCaption}>Scan QRIS to pay</Text>
          <Text style={styles.scanSubCaption}>Can be used in all Indonesian payment merchant</Text>
        </View>

        {/* Payment Procedure */}
        <Text style={styles.sectionTitle}>Payment Procedure</Text>
        <View style={styles.procedureCard}>
          {steps.map((step) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>{step.id}</Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Check Status Button */}
        <TouchableOpacity 
          onPress={() => handleCheckStatus(false)} 
          style={styles.checkStatusBtn}
          disabled={checkingStatus}
        >
          {checkingStatus ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkStatusBtnText}>Check Payment Status</Text>
          )}
        </TouchableOpacity>

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 15,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  alertCard: {
    backgroundColor: 'rgba(29, 80, 131, 0.12)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  alertText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  timerContainer: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerIcon: {
    marginRight: 5,
  },
  timerText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  totalLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#777777',
    marginBottom: 5,
  },
  totalValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 26,
    color: Theme.colors.primary,
  },
  txIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 12,
  },
  txIdText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#FFFFFF',
  },
  copyIcon: {
    marginLeft: 8,
  },
  qrisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  qrisImage: {
    width: 240,
    height: 240,
  },
  qrisPlaceholder: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  scanCaption: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#333333',
    marginTop: 15,
  },
  scanSubCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#333333',
    marginBottom: 10,
  },
  procedureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    marginLeft: 12,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
  },
  checkStatusBtn: {
    backgroundColor: Theme.colors.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkStatusBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
