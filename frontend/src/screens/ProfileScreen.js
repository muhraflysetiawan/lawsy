import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
import { NGROK_URL } from '../config';

import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export const ProfileScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(route?.params?.user || { name: 'User', role: 'Client' });
  const [activeRole, setActiveRole] = useState(route?.params?.activeRole || 'Client'); // The role currently active in the UI
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    loadUser();
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRoleAction = () => {
    if (userData.role === 'Lawyer') {
      // Toggle active role between Client and Lawyer
      setActiveRole(activeRole === 'Client' ? 'Lawyer' : 'Client');
      setShowRoleDropdown(false);
    } else {
      // Still a client, go to registration
      navigation.navigate('LawyerRegistrationStep1');
      setShowRoleDropdown(false);
    }
  };



  const MenuItem = ({ icon, label, library = 'Ionicons', onPress }) => {

    const IconComponent = library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : library === 'FontAwesome5' ? FontAwesome5 : Ionicons;
    
    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuLeft}>
          <IconComponent name={icon} size={22} color={Theme.colors.primary} style={styles.menuIcon} />
          <Text style={styles.menuLabel}>{label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>

        {/* Account Card */}
        <View style={styles.accountCard}>
          <View style={styles.accountMain}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
              <Image
                source={{ uri: userData.profile_image ? (userData.profile_image.startsWith('http') ? userData.profile_image : `${NGROK_URL}/lawsy/backend/${userData.profile_image}`) : 'https://i.pravatar.cc/150?u=' + userData.id }}
                style={styles.profilePic}
              />
              <View style={styles.accountInfo}>
                <Text style={styles.userName} numberOfLines={1}>{userData.name}</Text>
                <Text style={styles.roleText}>I am a {activeRole}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.roleDropdownTrigger}
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            >
              <Ionicons name={showRoleDropdown ? "chevron-up" : "chevron-down"} size={24} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {showRoleDropdown && (
            <View style={styles.dropdownMenu}>
              <Text style={styles.dropdownHeader}>Switch Account</Text>
              
              <TouchableOpacity style={styles.dropdownItem} onPress={handleRoleAction}>
                <View style={styles.dropdownItemLeft}>
                  <View style={styles.miniProfilePicPlaceholder}>
                    <Ionicons name="person" size={20} color="#888888" />
                  </View>
                  <View>
                    <Text style={styles.dropdownItemName}>{userData.name}</Text>
                    <Text style={styles.dropdownItemRole}>
                      {userData.role === 'Lawyer' 
                        ? (activeRole === 'Client' ? 'Switch to Lawyer Account' : 'Switch to Client Account')
                        : 'Register as Lawyer'
                      }
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name={userData.role === 'Lawyer' ? 'repeat' : 'add-circle-outline'} 
                  size={20} 
                  color={Theme.colors.primary} 
                />
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem 
            icon="person-outline" 
            label="Manage Profile" 
            onPress={() => navigation.navigate('ManageProfile', { user: userData, onRefresh: loadUser })} 
          />
          {activeRole === 'Lawyer' && (
            <>
              <View style={styles.divider} />
              <MenuItem 
                icon="briefcase-outline" 
                label="Lawyer Information" 
                onPress={() => navigation.navigate('LawyerInformation', { user: userData })}
              />
              <View style={styles.divider} />
              <MenuItem 
                icon="calendar-outline" 
                label="Manage Availability" 
                onPress={() => navigation.navigate('ManageAvailability', { user: userData })}
              />
            </>
          )}

          <View style={styles.divider} />
          <MenuItem 
            icon="shield-checkmark-outline" 
            label="Password & Security" 
            onPress={() => navigation.navigate('PasswordSecurity', { user: userData })} 
          />
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <MenuItem 
            icon="information-circle-outline" 
            label="About Us" 
            onPress={() => navigation.navigate('AboutUs')} 
          />
          <View style={styles.divider} />
          <MenuItem 
            icon="notifications-outline" 
            label="Notification" 
            onPress={() => navigation.navigate('Notification')} 
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem 
            icon="lock-closed-outline" 
            label="Privacy Policy" 
            onPress={() => navigation.navigate('PrivacyPolicy')} 
          />
          <View style={styles.divider} />
          <MenuItem 
            icon="document-text-outline" 
            label="Terms of Service" 
            onPress={() => navigation.navigate('TermsOfService')} 
          />
          <View style={styles.divider} />
          <MenuItem 
            icon="help-circle-outline" 
            label="Help Center" 
            onPress={() => navigation.navigate('HelpCenter')} 
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.removeItem('user');
            navigation.navigate('Login');
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>


        <View style={{ height: 100 }} />
      </ScrollView>

      {/* AI Chat Button */}
      <TouchableOpacity 
        style={styles.aiChatButton}
        onPress={() => navigation.navigate('ChatList', { user: userData, activeRole: activeRole })}
      >
        <MaterialCommunityIcons name="gavel" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Reusing Bottom Navigation from Home for consistency */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home', { user: userData, activeRole: activeRole })}>

          <Ionicons name="home-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ChatList', { user: userData, activeRole: activeRole })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>Chat</Text>
        </TouchableOpacity>
        
        {activeRole !== 'Lawyer' && (
          <View style={styles.mapsButtonContainer}>
            <TouchableOpacity style={styles.mapsButton} onPress={() => navigation.navigate('FindLawyer', { user: userData, activeRole: activeRole })}>
              <Ionicons name="map" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.navText}>Maps</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('HistoryBooking', { user: userData, activeRole: activeRole })}
        >
          <Ionicons name="time-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile', { user: userData, activeRole: activeRole })}
        >
          <Ionicons name="person" size={28} color={Theme.colors.primary} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    marginBottom: 15,
  },
  headerTitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 24,
    color: Theme.colors.primary,
    textAlign: 'center',
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  accountMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profilePic: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginRight: 8,
  },
  roleDropdownTrigger: {
    padding: 4,
    marginRight: 0,
  },
  roleText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
  },
  dropdownMenu: {
    marginTop: 15,
    paddingTop: 15,
    marginHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dropdownHeader: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#888888',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  miniProfilePicPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownItemName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  dropdownItemRole: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 18,
    color: Theme.colors.primary,
    marginBottom: 10,
    marginLeft: 5,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 15,
    color: Theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 15,
    marginBottom: 30,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FF3B30',
  },
  // Bottom Nav Styles (copied from Home)
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    color: Theme.colors.primary,
    marginTop: 4,
  },
  navTextGray: {
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    color: '#888888',
    marginTop: 4,
  },
  mapsButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 80,
    marginTop: -35,
  },
  mapsButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    marginBottom: 5,
  },
  aiChatButton: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    width: 65,
    height: 65,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});
