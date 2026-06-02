import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Theme } from '../theme';
import { LAWYERS_MAP_API_URL } from '../config';

const { width, height } = Dimensions.get('window');

// Style kustom untuk menyembunyikan POI default agar peta tidak berantakan
const customMapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  }
];

export const FindLawyerScreen = ({ navigation, route }) => {
  const user = route?.params?.user || { name: 'Guest' };
  const activeRole = route?.params?.activeRole || 'Client';

  // Generate 100 Data Dummy Kantor Hukum tersebar di Indonesia
  const generateDummyData = () => {
    const names = [
      'Adil & Partners', 'Lembaga Bantuan Hukum', 'Kusuma Law Office', 'Harapan Bangsa Law Firm', 
      'Sinergi Advokat', 'Pusat Mediasi Hukum', 'Kantor Pengacara Pratama', 'Bela Rakyat & Co',
      'Keadilan Sejahtera', 'Wira Law Firm', 'Dharma & Rekan', 'Global Legal Center'
    ];
    const cities = ['Jakarta', 'Surabaya', 'Medan', 'Bandung', 'Makassar', 'Semarang', 'Palembang', 'Batam', 'Pekanbaru', 'Denpasar', 'Malang', 'Balikpapan', 'Yogyakarta', 'Pontianak', 'Manado', 'Jayapura'];
    
    return Array.from({ length: 100 }, (_, i) => ({
      id: `firm-${i}`,
      name: names[i % names.length] + ` ${cities[i % cities.length]}`,
      address: `Jl. Keadilan No. ${i + 1}, Kota ${cities[i % cities.length]}`,
      // Koordinat acak dalam rentang geografis Indonesia
      latitude: (Math.random() * (5.0 - (-10.0)) + (-10.0)), 
      longitude: (Math.random() * (141.0 - 95.0) + 95.0),
      rating: (4.0 + Math.random()).toFixed(1),
    }));
  };

  const [allFirms, setAllFirms] = useState(generateDummyData());
  const [lawFirms, setLawFirms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
      } catch (e) {
        console.warn("Failed to request location permission:", e);
      }
    })();
    fetchRealLawyers();
  }, []);

  const fetchRealLawyers = async () => {
    try {
      const response = await fetch(LAWYERS_MAP_API_URL);
      const result = await response.json();
      
      if (result.status === 'success' && result.data.length > 0) {
        // Map backend data to screen format
        const mappedLawyers = result.data.map(l => ({
          id: l.user_id,
          name: l.name,
          address: l.location || 'Location not specified',
          latitude: parseFloat(l.latitude),
          longitude: parseFloat(l.longitude),
          rating: l.rating || '0.0',
          specialization: l.specialization
        }));
        setAllFirms(mappedLawyers);
        setLawFirms(mappedLawyers);
      } else {
        // Fallback to dummy data if no lawyers found in DB
        setLawFirms(allFirms);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      setLawFirms(allFirms); // Fallback to dummy on error
    } finally {
      setLoading(false);
    }
  };

  // Tampilan awal mencakup wilayah Indonesia yang lebih luas
  const initialRegion = {
    latitude: -2.5489, 
    longitude: 118.0149,
    latitudeDelta: 25,
    longitudeDelta: 25,
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setLawFirms(allFirms);
      return;
    }
    
    setLoading(true);
    // Simulasi pencarian lokal dari data dummy
    setTimeout(() => {
      const filtered = allFirms.filter(firm => 
        firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        firm.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setLawFirms(filtered);
      setLoading(false);
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* Header - Konsisten dengan Profile/LawyerInfo */}
      <View style={styles.header}>
        <View style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Find Lawyer</Text>
        <View style={styles.headerIcon} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Theme.colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Search Law Firms..."
            placeholderTextColor={Theme.colors.placeholder}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* Map Content */}
      <View style={styles.mapContainer}>
        <View style={styles.mapCard}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
          )}
          <MapView 
            style={styles.map} 
            initialRegion={initialRegion}
            showsUserLocation={locationPermission}
            customMapStyle={customMapStyle}
          >
            {lawFirms.map((firm) => (
              <Marker
                key={firm.id}
                coordinate={{ latitude: firm.latitude, longitude: firm.longitude }}
                title={firm.name}
                description={firm.address}
              >
                <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{firm.name}</Text>
                    <Text style={styles.calloutAddress}>{firm.address}</Text>
                    <Text style={styles.calloutRating}>★ {firm.rating}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
      </View>

      {/* AI Chat Button */}
      <TouchableOpacity 
        style={styles.aiChatButton}
        onPress={() => navigation.navigate('ChatList', { user, activeRole })}
      >
        <MaterialCommunityIcons name="gavel" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom Navigation - Sesuai ProfileScreen */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home', { user, activeRole })}>
          <Ionicons name="home-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ChatList', { user, activeRole })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>Chat</Text>
        </TouchableOpacity>
        
        {activeRole !== 'Lawyer' && (
          <View style={styles.mapsButtonContainer}>
            <TouchableOpacity style={styles.mapsButton}>
              <Ionicons name="map" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.navText}>Maps</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('HistoryBooking', { user, activeRole })}
        >
          <Ionicons name="time-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile', { user, activeRole })}>
          <Ionicons name="person-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>Profile</Text>
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
    fontFamily: Theme.fonts.medium,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  mapContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 80,
  },
  mapCard: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    zIndex: 1,
  },
  calloutContainer: {
    width: 150,
    padding: 10,
  },
  calloutTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    marginBottom: 5,
  },
  calloutAddress: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  calloutRating: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: '#FFD700',
  },
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
