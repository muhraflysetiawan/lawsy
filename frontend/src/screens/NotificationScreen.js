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
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

export const NotificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States for different notification options
  const [bookingNotif, setBookingNotif] = useState(true);
  const [chatNotif, setChatNotif] = useState(true);
  const [callNotif, setCallNotif] = useState(true);
  const [paymentNotif, setPaymentNotif] = useState(true);
  const [articleNotif, setArticleNotif] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('notification_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        setBookingNotif(settings.bookingNotif ?? true);
        setChatNotif(settings.chatNotif ?? true);
        setCallNotif(settings.callNotif ?? true);
        setPaymentNotif(settings.paymentNotif ?? true);
        setArticleNotif(settings.articleNotif ?? false);
      }
    } catch (e) {
      console.error("Load notification settings error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settings = {
        bookingNotif,
        chatNotif,
        callNotif,
        paymentNotif,
        articleNotif,
      };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      
      Alert.alert(
        "Sukses",
        "Preferensi notifikasi Anda berhasil disimpan!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error("Save notification settings error:", e);
      Alert.alert("Error", "Gagal menyimpan preferensi Anda.");
    } finally {
      setSaving(false);
    }
  };

  const ToggleCard = ({ icon, title, description, value, onValueChange }) => (
    <View style={styles.toggleCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={22} color={Theme.colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity 
          onPress={() => onValueChange(!value)}
          activeOpacity={0.8}
          style={[styles.customSwitch, value ? styles.switchOn : styles.switchOff]}
        >
          <View style={[styles.switchCircle, value ? styles.circleOn : styles.circleOff]} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Kelola Notifikasi Anda</Text>
          <Text style={styles.introText}>
            Sesuaikan saluran komunikasi dan jenis pemberitahuan push yang ingin Anda terima dari platform Lawsy. Kami ingin memastikan Anda tetap terhubung secara instan dengan pengacara Anda tanpa merasa terganggu.
          </Text>
        </View>

        {/* 1. Booking & Agenda */}
        <ToggleCard
          icon="calendar-outline"
          title="Booking & Agenda Baru"
          description="Dapatkan notifikasi push instan setiap kali pengacara menyetujui jadwal konsultasi hukum Anda, ketika ada permintaan konsultasi baru yang masuk, atau ketika jadwal agenda konsultasi hari ini akan segera dimulai dalam waktu 15 menit."
          value={bookingNotif}
          onValueChange={setBookingNotif}
        />

        {/* 2. Chat & Pesan */}
        <ToggleCard
          icon="chatbubble-ellipses-outline"
          title="Pesan Chat Masuk"
          description="Terima notifikasi real-time saat Anda mendapatkan balasan pesan baru dari pengacara Anda di chat room, termasuk saat pengacara mengirimkan lampiran draf dokumen pendukung hukum penting."
          value={chatNotif}
          onValueChange={setChatNotif}
        />

        {/* 3. Panggilan Suara */}
        <ToggleCard
          icon="call-outline"
          title="Panggilan Masuk (Call)"
          description="Pastikan opsi ini tetap aktif agar Anda dapat menerima dering notifikasi panggilan suara langsung (WebRTC) dari pengacara Anda saat sesi konsultasi online interaktif dimulai."
          value={callNotif}
          onValueChange={setCallNotif}
        />

        {/* 4. Tagihan & Pembayaran */}
        <ToggleCard
          icon="wallet-outline"
          title="Tagihan & Pembayaran"
          description="Dapatkan peringatan penting saat pengacara mitra mengirimkan draf penawaran kerja (bill card) baru, pengingat sisa waktu transfer pembayaran Midtrans sebelum chat terkunci, serta struk bukti sukses pembayaran kasus Anda."
          value={paymentNotif}
          onValueChange={setPaymentNotif}
        />

        {/* 5. Edukasi & Artikel */}
        <ToggleCard
          icon="book-outline"
          title="Update Artikel & Insights"
          description="Dapatkan pemberitahuan mingguan mengenai analisis kasus hukum terbaru di Indonesia, tips praktis perlindungan hukum, kamus istilah hukum terbaru, serta pembaruan info hukum terpopuler."
          value={articleNotif}
          onValueChange={setArticleNotif}
        />

        {/* Save button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.8 }]} 
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
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
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  introTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 8,
  },
  introText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.text,
  },
  cardDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  customSwitch: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: Theme.colors.primary,
  },
  switchOff: {
    backgroundColor: '#E0E0E0',
  },
  switchCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  circleOn: {
    alignSelf: 'flex-end',
  },
  circleOff: {
    alignSelf: 'flex-start',
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    height: Theme.sizes.button.large,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
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
});
