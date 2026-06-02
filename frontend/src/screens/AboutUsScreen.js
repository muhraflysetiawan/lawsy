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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';

export const AboutUsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Decorative Brand Section */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="gavel" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>LAWSY</Text>
          <Text style={styles.brandTagline}>Your Trusted Legal Partner</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Siapa Kami?</Text>
          <Text style={styles.sectionParagraph}>
            Lawsy adalah platform pionir teknologi hukum (legal-tech) di Indonesia yang didirikan dengan satu misi sederhana namun kuat: mendemokratisasi akses keadilan hukum bagi seluruh masyarakat Indonesia. Kami percaya bahwa setiap individu, tanpa memandang status sosial dan ekonomi, berhak mendapatkan perlindungan hukum yang setara, solusi yang adil, serta akses mudah ke advokat profesional tepercaya.
          </Text>
          <Text style={styles.sectionParagraph}>
            Lahir dari kolaborasi erat antara praktisi hukum berpengalaman dan inovator teknologi perangkat lunak, Lawsy hadir sebagai jembatan digital interaktif yang menghilangkan hambatan jarak, waktu, dan kerumitan prosedural dalam memperoleh layanan konsultasi hukum premium. Melalui perangkat genggam Anda, kami menghadirkan keadilan hukum langsung ke ujung jari Anda secara instan, aman, dan transparan.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Visi dan Misi Kami</Text>
          <Text style={styles.sectionParagraph}>
            Visi jangka panjang kami adalah menjadi ekosistem digital hukum terbesar dan paling tepercaya di Asia Tenggara yang mampu menggerakkan kesadaran hukum masyarakat dan menjamin perlindungan hak hukum setiap individu secara transparan. Misi kami mencakup:
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Aksesibilitas:</Text> Menyediakan wadah digital yang mempertemukan klien dengan jaringan advokat mitra terlisensi terbaik dari seluruh Indonesia kapan saja dan di mana saja.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Integritas:</Text> Menjamin transparansi biaya profesional pengacara melalui modul billing escrow aman dan sistem Midtrans payment gateway tepercaya.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Edukasi:</Text> Meningkatkan literasi hukum publik lewat fitur Kamus Hukum (Legal Dictionary) terlengkap dan artikel analisis hukum (Law Insights) terupdate.
          </Text>
          <Text style={styles.bulletItem}>
            • <Text style={{ fontWeight: 'bold' }}>Efisiensi:</Text> Mempersingkat proses birokrasi penyusunan dokumen hukum mandiri dengan generator dokumen berspesifikasi hukum standar nasional.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Inovasi Teknologi Tanpa Batas</Text>
          <Text style={styles.sectionParagraph}>
            Di Lawsy, kami memanfaatkan inovasi rekayasa perangkat lunak terbaru demi menghadirkan kenyamanan maksimal dalam pengalaman hukum Anda. Kami merancang arsitektur aplikasi yang mengintegrasikan panggilan suara langsung terenkripsi (WebRTC Voice Call), enkripsi data profil end-to-end, pencitraan lokasi spasial advokat terdekat dengan visualisasi peta interaktif Google Maps, serta generator draf dokumen otomatis yang sangat presisi. Seluruh teknologi ini dirancang demi menyederhanakan penyelesaian sengketa hukum Anda secara damai dan profesional.
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
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 12,
  },
  brandName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.primary,
    letterSpacing: 2,
  },
  brandTagline: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
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
