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
import { Theme } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomButton } from '../components/CustomButton';

export const VerificationPendingScreen = ({ navigation }) => {
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
        {/* Pending Icon */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="time" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.mainTitle}>Verification in Progress</Text>
          <Text style={styles.caption}>
            Our team is carefully reviewing your identity documents (ID Card), professional membership, and degree.
          </Text>
        </View>

        {/* Info Alert Card */}
        <View style={styles.alertCard}>
          <Ionicons name="information-circle" size={24} color={Theme.colors.primary} style={styles.alertIcon} />
          <Text style={styles.alertDescription}>
            This process usually takes 1-3 business days to ensure the professional standards of our platform are maintained.
          </Text>
        </View>

        {/* Back to Home Button */}
        <CustomButton
          title="Back to Home"
          onPress={() => navigation.navigate('Home')}
          style={styles.homeButton}
        />

        {/* Help Card */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpCaption}>
            If you have any questions regarding your document verification status.
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => {}}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  mainTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  caption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(29, 80, 131, 0.1)',
    marginBottom: 30,
  },
  alertIcon: {
    marginRight: 15,
  },
  alertDescription: {
    flex: 1,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
  },
  homeButton: {
    marginBottom: 35,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  helpTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  helpCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  supportButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
  },
});
