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

export const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Pendahuluan</Text>
          <Text style={styles.sectionParagraph}>
            Selamat datang di Lawsy. Kami berkomitmen untuk melindungi dan menghormati privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi pribadi Anda ketika Anda menggunakan aplikasi mobile Lawsy beserta seluruh layanan konsultasi hukum yang kami sediakan.
          </Text>
          <Text style={styles.sectionParagraph}>
            Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini. Kami menyarankan Anda membaca dokumen ini secara menyeluruh untuk memahami bagaimana kami memperlakukan data pribadi Anda dengan standar keamanan tertinggi dan kepatuhan hukum yang ketat.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Informasi yang Kami Kumpulkan</Text>
          <Text style={styles.sectionParagraph}>
            Kami mengumpulkan beberapa jenis informasi untuk berbagai keperluan guna menyediakan dan meningkatkan Layanan kami kepada Anda. Informasi pribadi yang kami kumpulkan mencakup:
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Data Identitas Pribadi:</Text> Nama lengkap, alamat email, tanggal lahir, foto profil, dan alamat tempat tinggal yang Anda masukkan saat mengedit atau mengelola profil Anda.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Data Kontak & Profesional (untuk Pengacara):</Text> Nomor lisensi hukum, sertifikasi keahlian, spesialisasi kasus hukum, lokasi kantor fisik, koordinat peta, serta riwayat pengalaman kerja Anda.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Dokumen Pendukung Hukum:</Text> File hukum, draf kontrak, surat pernyataan, dokumen identitas, atau bukti fisik lainnya yang Anda upload melalui modul Document Generator atau saat memesan konsultasi.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Data Panggilan & Percakapan:</Text> Riwayat chat, pesan teks, lampiran dokumen dalam chat, serta metadata panggilan suara (WebRTC) yang dilakukan antara klien dan pengacara di platform Lawsy.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Penggunaan Informasi Data Anda</Text>
          <Text style={styles.sectionParagraph}>
            Lawsy menggunakan data yang dikumpulkan untuk berbagai tujuan operasional dan peningkatan layanan, termasuk namun tidak terbatas pada:
          </Text>
          <Text style={styles.bulletItem}>
            • Menyediakan, mengoperasikan, memantau, dan memelihara aplikasi serta fitur konsultasi interaktif agar tetap berjalan lancar dan responsif.
          </Text>
          <Text style={styles.bulletItem}>
            • Menghubungkan Anda secara instan dengan pengacara profesional tepercaya berdasarkan lokasi geografis terdekat dan bidang keahlian hukum yang sesuai.
          </Text>
          <Text style={styles.bulletItem}>
            • Memproses pembuatan dokumen hukum secara otomatis lewat modul generator kontrak dan menyimpannya dengan aman untuk kebutuhan masa mendatang.
          </Text>
          <Text style={styles.bulletItem}>
            • Mengirimkan notifikasi penting terkait konfirmasi jadwal booking agenda, panggilan konsultasi yang masuk, pemberitahuan tagihan, serta pembaruan status kasus hukum Anda.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Keamanan dan Perlindungan Data</Text>
          <Text style={styles.sectionParagraph}>
            Keamanan informasi Anda adalah prioritas utama bagi kami. Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sangat ketat untuk melindungi data pribadi Anda dari akses yang tidak sah, pengubahan, pengungkapan, atau penghancuran.
          </Text>
          <Text style={styles.sectionParagraph}>
            Semua password pengguna di-hash secara aman menggunakan algoritma bcrypt di sisi server, dan semua pengiriman data antara aplikasi mobile dan backend kami dienkripsi secara penuh menggunakan koneksi HTTPS/SSL aman berstandar industri. Dokumen hukum yang diunggah disimpan di folder aman dan hanya dapat diakses oleh pihak yang berwenang. Namun, harap diingat bahwa tidak ada metode transmisi melalui Internet atau metode penyimpanan elektronik yang 100% aman, meskipun kami selalu berupaya menggunakan cara yang paling andal secara komersial untuk melindungi data Anda.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>5. Pengungkapan kepada Pihak Ketiga</Text>
          <Text style={styles.sectionParagraph}>
            Kami tidak menjual, memperdagangkan, atau menyewakan informasi identitas pribadi Anda kepada pihak lain. Kami hanya dapat membagikan informasi Anda kepada penyedia layanan pihak ketiga yang terpercaya untuk membantu kami mengoperasikan aplikasi, menjalankan bisnis kami, atau melayani Anda (seperti gerbang pembayaran Midtrans untuk proses tagihan biaya hukum), asalkan pihak-pihak tersebut setuju untuk menjaga kerahasiaan informasi ini secara ketat.
          </Text>
          <Text style={styles.sectionParagraph}>
            Kami juga dapat mengungkapkan informasi Anda jika diwajibkan oleh hukum atau atas perintah resmi dari pengadilan dan otoritas penegak hukum yang berwenang dalam rangka mematuhi kewajiban hukum yang berlaku di wilayah hukum Republik Indonesia.
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
