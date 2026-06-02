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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

export const HelpCenterScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  const faqs = [
    {
      category: 'Akun',
      question: 'Bagaimana cara mengubah informasi nama, email, dan alamat di profil saya?',
      answer: 'Untuk memperbarui detail profil Anda, silakan masuk ke menu utama "Profile" di pojok kanan bawah aplikasi. Kemudian, klik opsi "Manage Profile". Di halaman tersebut, Anda dapat mengganti Nama, Email, Tanggal Lahir, serta Alamat lengkap Anda. Anda juga dapat mengetuk area foto profil untuk mengupload foto baru dari galeri ponsel Anda. Setelah semua data terisi dengan benar, tekan tombol "Save". Data Anda di database server akan terupdate secara langsung dan instan, serta mengubah tampilan header pada halaman utama.'
    },
    {
      category: 'Pemesanan',
      question: 'Bagaimana cara memesan konsultasi dengan pengacara pilihan saya?',
      answer: 'Anda dapat menelusuri pengacara terbaik kami melalui peta "Maps" interaktif atau mengetuk kategori kasus di halaman utama (seperti Hukum Keluarga, Perdata, Pidana, atau Publik). Ketuk nama pengacara untuk melihat detail latar belakang, pengalaman, keahlian khusus, tarif, serta sertifikasi mereka. Klik tombol "Book Appointment", pilih tipe konsultasi (Virtual/Zoom atau Tatap Muka/Offilne), pilih tanggal dan waktu luang yang tersedia, lalu isi deskripsi singkat masalah hukum Anda. Permintaan konsultasi akan langsung dikirim ke antrean pengacara untuk disetujui (Approved).'
    },
    {
      category: 'Pembayaran',
      question: 'Bagaimana proses pembayaran biaya konsultasi hukum di Lawsy?',
      answer: 'Lawsy menggunakan sistem pembayaran yang terintegrasi secara resmi dengan gerbang pembayaran (payment gateway) Midtrans untuk menjamin keamanan penuh transaksi Anda. Ketika pengacara mitra mengirimkan draf penawaran kerja (bill card) di dalam chat room, Anda dapat menekan tombol "Pay" yang akan langsung membuka halaman pembayaran terenkripsi. Anda dapat memilih metode pembayaran instan seperti transfer bank virtual account (VA), e-wallet (Gopay/ShopeePay), kartu kredit, atau gerai ritel terdekat. Pembayaran harus diselesaikan sebelum waktu countdown habis (1 jam) agar modul chat room kasus aktif Anda tidak terkunci.'
    },
    {
      category: 'Lawsy AI',
      question: 'Apakah dokumen yang dihasilkan oleh Document Generator sah secara hukum?',
      answer: 'Modul Document Generator (pembuat dokumen otomatis) dirancang menggunakan algoritma canggih untuk menyusun kontrak kerja, surat pernyataan, dan surat kuasa dengan parameter hukum baku yang berlaku di Indonesia. Meskipun draf yang dihasilkan memiliki struktur hukum yang sangat kuat dan tepercaya, kami sangat menyarankan Anda untuk membagikan draf dokumen tersebut dalam chat room dengan Pengacara Mitra kami untuk ditelaah ulang (review) dan disahkan secara notaris atau tanda tangan elektronik resmi demi menjamin kekuatan pembuktian hukum yang mutlak.'
    },
    {
      category: 'Akun',
      question: 'Saya lupa password akun Lawsy saya. Bagaimana cara meresetnya?',
      answer: 'Jika Anda lupa password login Anda, silakan buka halaman login awal dan ketuk tautan teks "Forgot Password?". Masukkan alamat email terdaftar Anda dan klik kirim. Sistem kami akan secara otomatis mengirimkan kode One-Time Password (OTP) 6 digit ke email Anda. Masukkan kode OTP tersebut di aplikasi Lawsy untuk memverifikasi identitas Anda, lalu setel password baru Anda pada layar "Set New Password". Setelah berhasil, Anda dapat kembali login dengan password baru tersebut.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'Semua' || faq.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color={Theme.colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Cari solusi atau pertanyaan..."
            placeholderTextColor={Theme.colors.placeholder}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Tabs */}
        <View style={styles.tabsRow}>
          {['Semua', 'Akun', 'Pemesanan', 'Pembayaran', 'Lawsy AI'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs List */}
        <Text style={styles.sectionHeaderTitle}>Pertanyaan Populer</Text>
        {filteredFaqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={22} color={Theme.colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.faqQuestion}>{faq.question}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}

        {filteredFaqs.length === 0 && (
          <Text style={styles.emptyText}>Tidak ada solusi FAQ yang cocok dengan kata kunci Anda.</Text>
        )}

        {/* Support Contact Info */}
        <View style={styles.supportContactCard}>
          <Text style={styles.contactTitle}>Masih Butuh Bantuan?</Text>
          <Text style={styles.contactCaption}>
            Hubungi tim support teknis dan layanan pelanggan Lawsy yang siap melayani kebutuhan konsultasi hukum Anda 24/7 secara profesional.
          </Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={20} color="#FFFFFF" style={{ marginRight: 12 }} />
            <Text style={styles.contactItemText}>support@lawsy.co.id</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call" size={20} color="#FFFFFF" style={{ marginRight: 12 }} />
            <Text style={styles.contactItemText}>+62 21-8930-1049</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 12 }} />
            <Text style={styles.contactItemText}>+62 812-3456-7890 (WhatsApp)</Text>
          </View>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  tabButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  tabButtonText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionHeaderTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECEFF1',
    marginVertical: 12,
  },
  faqAnswer: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
  },
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginVertical: 30,
  },
  supportContactCard: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  contactTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  contactCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.85,
    lineHeight: 20,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactItemText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
