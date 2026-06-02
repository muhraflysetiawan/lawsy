import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

export const TermsOfServiceScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Penerimaan Ketentuan Penggunaan</Text>
          <Text style={styles.sectionParagraph}>
            Selamat datang di aplikasi Lawsy. Dengan mengunduh, menginstal, mendaftar, mengakses, atau menggunakan aplikasi ini, Anda secara sadar dan tegas menyatakan setuju untuk terikat oleh Ketentuan Layanan (Terms of Service) ini beserta seluruh hukum dan peraturan perundang-undangan yang berlaku di Indonesia.
          </Text>
          <Text style={styles.sectionParagraph}>
            Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda dilarang keras untuk menggunakan aplikasi Lawsy dan harus segera menghapus aplikasi ini dari perangkat Anda. Kami berhak mengubah, memodifikasi, menambah, atau menghapus bagian dari ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya, dan penggunaan berkelanjutan Anda atas aplikasi merupakan bentuk penerimaan mutlak atas perubahan tersebut.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Deskripsi Layanan Layanan</Text>
          <Text style={styles.sectionParagraph}>
            Lawsy adalah platform digital marketplace jasa hukum yang menghubungkan klien umum dengan advokat atau praktisi hukum independen profesional (Pengacara Mitra) terlisensi. Layanan utama yang kami sediakan meliputi:
          </Text>
          <Text style={styles.bulletItem}>
            • Modul reservasi konsultasi janji temu (booking appointment) secara langsung maupun online.
          </Text>
          <Text style={styles.bulletItem}>
            • Fasilitas komunikasi suara real-time berbasis WebRTC dan chat interaktif untuk membahas perkara hukum secara langsung di dalam aplikasi.
          </Text>
          <Text style={styles.bulletItem}>
            • Modul pembuatan draf hukum otomatis (Document Generator) untuk membantu menyusun kontrak kerja, surat pernyataan, dan surat kuasa secara mandiri.
          </Text>
          <Text style={styles.bulletItem}>
            • Sistem navigasi lokasi kantor pengacara terdekat yang terintegrasi langsung dengan pemetaan koordinat Google Maps.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Akun Pengguna & Kewajiban Anda</Text>
          <Text style={styles.sectionParagraph}>
            Untuk dapat mengakses sebagian besar fitur utama di Lawsy, Anda diwajibkan membuat akun yang dilindungi oleh password. Anda berkewajiban untuk:
          </Text>
          <Text style={styles.bulletItem}>
            • Menyediakan data profil yang akurat, mutakhir, dan lengkap (Nama lengkap, Email, Tanggal Lahir, dan Alamat Anda) pada menu "Manage Profile".
          </Text>
          <Text style={styles.bulletItem}>
            • Menjaga kerahasiaan password login Anda dan bertanggung jawab penuh atas segala aktivitas atau tindakan yang terjadi di bawah akun Anda.
          </Text>
          <Text style={styles.bulletItem}>
            • Menjamin bahwa semua dokumen pendukung hukum yang diunggah ke platform kami adalah dokumen asli yang sah secara hukum dan tidak melanggar hak cipta pihak ketiga.
          </Text>
          <Text style={styles.bulletItem}>
            • Tidak menyalahgunakan layanan untuk tindakan ilegal, penipuan, pencucian uang, penyebaran kebencian, atau pelecehan kepada para pengacara mitra kami.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Kebijakan Pembayaran & Biaya Hukum</Text>
          <Text style={styles.sectionParagraph}>
            Beberapa layanan khusus yang diberikan oleh Pengacara Mitra kami (seperti konsultasi strategis dan penanganan kasus aktif) dikenakan biaya profesional sesuai kesepakatan penawaran tagihan (bill card) yang dikirim oleh pengacara melalui chat room.
          </Text>
          <Text style={styles.sectionParagraph}>
            Semua transaksi pembayaran diproses dengan aman melalui gerbang pembayaran (payment gateway) Midtrans. Pembayaran bersifat final dan tidak dapat dikembalikan, kecuali jika layanan konsultasi dibatalkan secara sepihak oleh pengacara yang bersangkutan. Klien yang memiliki tagihan tertunda (pending payment status) wajib menyelesaikannya dalam waktu 1 jam guna membuka blokir akses chat room kasus aktif mereka demi menjaga integritas transaksi profesional di dalam aplikasi.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>5. Batasan Tanggung Jawab (Disclaimer)</Text>
          <Text style={styles.sectionParagraph}>
            Lawsy berperan secara eksklusif sebagai penyedia teknologi perantara digital (platform) yang menghubungkan pengguna dengan praktisi hukum mitra kami. Hubungan hukum konsultasi advokat-klien terjalin secara independen dan profesional langsung antara Anda dengan Pengacara Mitra yang Anda pilih.
          </Text>
          <Text style={styles.sectionParagraph}>
            Kami selalu melakukan verifikasi latar belakang lisensi dan rekam jejak para advokat mitra pada saat pendaftaran, namun Lawsy tidak bertanggung jawab atas kualitas opini hukum, kelalaian penanganan perkara, strategi hukum yang gagal, atau segala kerugian materiil/immateriil yang timbul dari hasil konsultasi atau penggunaan draf dokumen dari aplikasi kami. Semua keputusan hukum yang diambil berada di bawah tanggung jawab pribadi pengguna sepenuhnya.
          </Text>
        </View>
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
  sectionCard: {
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
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 10,
  },
  sectionParagraph: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 10,
  },
  bulletItem: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
    marginLeft: 12,
    marginBottom: 8,
  },
});
