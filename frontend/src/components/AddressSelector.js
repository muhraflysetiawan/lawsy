import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Theme } from '../theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export const AddressSelector = ({ onSave, onCancel }) => {
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedRegency, setSelectedRegency] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [postalCode, setPostalCode] = useState('');
  const [region, setRegion] = useState({
    latitude: -6.2000,
    longitude: 106.8166,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerCoords, setMarkerCoords] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [modalData, setModalData] = useState([]);

  const [loading, setLoading] = useState({
    provinces: false,
    regencies: false,
    districts: false,
    villages: false,
    postalCode: false,
  });

  // Fetch Provinces on mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const response = await fetch('https://api.datawilayah.com/api/provinsi.json');
      const result = await response.json();
      
      // Map 'nama_wilayah' to 'name' and 'kode_wilayah' to 'id' for compatibility
      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({ 
          ...item, 
          id: item.kode_wilayah,
          name: item.nama_wilayah 
        }));
        setProvinces(mappedData);
      } else {
        console.error('Invalid API response format for provinces');
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  // Fetch Regencies when Province changes
  useEffect(() => {
    if (selectedProvince) {
      fetchRegencies(selectedProvince.id);
    } else {
      setRegencies([]);
    }
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setPostalCode('');
  }, [selectedProvince]);

  const fetchRegencies = async (provinceId) => {
    setLoading(prev => ({ ...prev, regencies: true }));
    try {
      const response = await fetch(`https://api.datawilayah.com/api/kabupaten_kota/${provinceId}.json`);
      const result = await response.json();
      
      // Map 'nama_wilayah' to 'name' and 'kode_wilayah' to 'id' for compatibility
      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({ 
          ...item, 
          id: item.kode_wilayah,
          name: item.nama_wilayah 
        }));
        setRegencies(mappedData);
      }
    } catch (error) {
      console.error('Error fetching regencies:', error);
    } finally {
      setLoading(prev => ({ ...prev, regencies: false }));
    }
  };

  // Fetch Districts when Regency changes
  useEffect(() => {
    if (selectedRegency) {
      fetchDistricts(selectedRegency.id);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setPostalCode('');
  }, [selectedRegency]);

  const fetchDistricts = async (regencyId) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const response = await fetch(`https://api.datawilayah.com/api/kecamatan/${regencyId}.json`);
      const result = await response.json();
      
      // Map 'nama_wilayah' to 'name' and 'kode_wilayah' to 'id' for compatibility
      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({ 
          ...item, 
          id: item.kode_wilayah,
          name: item.nama_wilayah 
        }));
        setDistricts(mappedData);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  // Fetch Villages when District changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchVillages(selectedDistrict.id);
    } else {
      setVillages([]);
    }
    setSelectedVillage(null);
    setPostalCode('');
  }, [selectedDistrict]);

  const fetchVillages = async (districtId) => {
    setLoading(prev => ({ ...prev, villages: true }));
    try {
      const response = await fetch(`https://api.datawilayah.com/api/desa_kelurahan/${districtId}.json`);
      const result = await response.json();
      
      // Map 'nama_wilayah' to 'name' and 'kode_wilayah' to 'id' for compatibility
      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedData = result.data.map(item => ({ 
          ...item, 
          id: item.kode_wilayah,
          name: item.nama_wilayah 
        }));
        setVillages(mappedData);
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
    } finally {
      setLoading(prev => ({ ...prev, villages: false }));
    }
  };

  // Auto Generate Postal Code
  useEffect(() => {
    if (selectedVillage?.name && selectedDistrict?.name) {
      fetchPostalCode(selectedVillage.name, selectedDistrict.name, selectedRegency?.name);
    } else {
      setPostalCode('');
    }
  }, [selectedVillage, selectedDistrict]);

  const fetchPostalCode = async (villageName, districtName, regencyName) => {
    if (!villageName) return;
    
    setLoading(prev => ({ ...prev, postalCode: true }));
    
    try {
      const cleanVillage = villageName.trim();
      const cleanDistrict = districtName ? districtName.trim() : '';
      const cleanRegency = regencyName ? regencyName.trim().replace('KOTA ', '').replace('KABUPATEN ', '') : '';
      
      const query = encodeURIComponent(`${cleanVillage} ${cleanDistrict} ${cleanRegency}`);
      
      const url = `https://kodepos.vercel.app/search?q=${query}`;
      const response = await fetch(url, { timeout: 10000 });
      const result = await response.json();
      
      if (result && result.data && result.data.length > 0) {
        const item = result.data[0];
        const code = item.code || item.postalcode || item.kodepos || '';
        if (code) {
          setPostalCode(code);
          return;
        }
      }

      // Fallback
      const fbUrl = `https://kodepos.vercel.app/search?q=${encodeURIComponent(cleanVillage)}`;
      const fbResponse = await fetch(fbUrl);
      const fbResult = await fbResponse.json();
      if (fbResult && fbResult.data && fbResult.data.length > 0) {
        const item = fbResult.data[0];
        const code = item.code || item.postalcode || item.kodepos || '';
        if (code) {
          setPostalCode(code);
          return;
        }
      }

    } catch (error) {
      console.log('Postal code fetch failed:', error.message);
    } finally {
      setLoading(prev => ({ ...prev, postalCode: false }));
    }
  };

  // Auto Update Map Pin based on selection
  useEffect(() => {
    const timer = setTimeout(() => {
      updateMapFromSelection();
    }, 500); // Debounce to avoid too many requests
    return () => clearTimeout(timer);
  }, [selectedProvince, selectedRegency, selectedDistrict, selectedVillage]);

  const updateMapFromSelection = async () => {
    if (!selectedProvince) return;

    const parts = [
      selectedVillage?.name,
      selectedDistrict?.name,
      selectedRegency?.name,
      selectedProvince?.name,
      'Indonesia'
    ].filter(Boolean);

    if (parts.length < 2) return;

    const addressString = parts.join(', ');
    
    try {
      const result = await Location.geocodeAsync(addressString);
      if (result && result.length > 0) {
        const { latitude, longitude } = result[0];
        
        // Determine zoom level based on specificity
        let delta = 0.05;
        if (selectedVillage) delta = 0.005;
        else if (selectedDistrict) delta = 0.015;
        else if (selectedRegency) delta = 0.03;

        const newCoords = {
          latitude,
          longitude,
          latitudeDelta: delta,
          longitudeDelta: delta,
        };
        
        setRegion(newCoords);
        setMarkerCoords({ latitude, longitude });
      }
    } catch (error) {
      console.log('Geocoding failed:', error.message);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      setRegion(coords);
      setMarkerCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode to fill administrative data if possible
      const address = await Location.reverseGeocodeAsync(location.coords);
      if (address && address.length > 0) {
        const addr = address[0];
        // Note: Automatic administrative matching is complex, for now we just set the pin
        // and let user fill the dropdowns if needed, or we show the estimated address.
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapPress = (e) => {
    setMarkerCoords(e.nativeEvent.coordinate);
  };

  const handleMarkerDragEnd = (e) => {
    setMarkerCoords(e.nativeEvent.coordinate);
  };

  const openSelector = (type, data) => {
    setModalType(type);
    setModalData(data);
    setModalVisible(true);
  };

  const handleSelect = (item) => {
    switch (modalType) {
      case 'province':
        setSelectedProvince(item);
        break;
      case 'regency':
        setSelectedRegency(item);
        break;
      case 'district':
        setSelectedDistrict(item);
        break;
      case 'village':
        setSelectedVillage(item);
        break;
    }
    setModalVisible(false);
  };

  const renderDropdownField = (label, selectedValue, type, data, isLoading, isDisabled) => {
    return (
      <View style={[styles.dropdownFieldWrapper, isDisabled && styles.disabled]}>
        <Text style={styles.dropdownLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => !isDisabled && openSelector(type, data)}
          disabled={isDisabled || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          ) : (
            <Text style={[styles.dropdownValue, !selectedValue && { color: Theme.colors.placeholder }]}>
              {selectedValue ? selectedValue.name : `Select ${label}`}
            </Text>
          )}
          <Ionicons name="chevron-down" size={20} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const selectionResult = {
    provinsi: selectedProvince?.name || '',
    kabupaten: selectedRegency?.name || '',
    kecamatan: selectedDistrict?.name || '',
    kelurahan: selectedVillage?.name || '',
    kodePos: postalCode,
    latitude: markerCoords?.latitude || null,
    longitude: markerCoords?.longitude || null,
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalHeader}>
        <Text style={styles.title}>Edit Location</Text>
        <TouchableOpacity onPress={onCancel}>
          <Ionicons name="close" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        {renderDropdownField('Province', selectedProvince, 'province', provinces, loading.provinces, false)}
        {renderDropdownField('Regency/City', selectedRegency, 'regency', regencies, loading.regencies, !selectedProvince)}
        {renderDropdownField('District', selectedDistrict, 'district', districts, loading.districts, !selectedRegency)}
        {renderDropdownField('Village', selectedVillage, 'village', villages, loading.villages, !selectedDistrict)}

        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.dropdownLabel}>Pin Location Accuracy</Text>
            <TouchableOpacity 
              style={styles.currentLocBtn} 
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color={Theme.colors.primary} />
              ) : (
                <>
                  <MaterialIcons name="my-location" size={18} color={Theme.colors.primary} />
                  <Text style={styles.currentLocText}>Get Current</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              onMapReady={() => setIsMapReady(true)}
            >
              {markerCoords && (
                <Marker
                  coordinate={markerCoords}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                  title="Your Location"
                  description="Hold and drag to adjust"
                />
              )}
            </MapView>
            {!markerCoords && (
              <View style={styles.mapOverlay}>
                <Text style={styles.mapOverlayText}>Tap on map to set your location pin</Text>
              </View>
            )}
          </View>
          {markerCoords && (
            <Text style={styles.coordsText}>
              Coords: {markerCoords.latitude.toFixed(6)}, {markerCoords.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Postal Code Card (Looks like input) */}
        <View style={styles.inputWrapper}>
          <Text style={styles.dropdownLabel}>Postal Code</Text>
          <View style={styles.postalCodeCard}>
            {loading.postalCode ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Theme.colors.primary} />
                <Text style={styles.loadingText}>Searching Postal Code...</Text>
              </View>
            ) : (
              <Text style={[styles.postalValue, !postalCode && { color: Theme.colors.placeholder }]}>
                {postalCode || 'Automatic Postal Code'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.saveButton, !selectedVillage && styles.saveDisabled]} 
          onPress={() => onSave(selectionResult)}
          disabled={!selectedVillage}
        >
          <Text style={styles.saveText}>Save Address</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.listModalOverlay}>
          <View style={styles.listModalContent}>
            <View style={styles.listModalHeader}>
              <Text style={styles.listModalTitle}>Select {modalType === 'province' ? 'Province' : modalType === 'regency' ? 'Regency' : modalType === 'district' ? 'District' : 'Village'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem} onPress={() => handleSelect(item)}>
                  <Text style={styles.listItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 20,
    maxHeight: '90%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
  },
  formScroll: {
    marginBottom: 20,
  },
  dropdownFieldWrapper: {
    marginBottom: 18,
  },
  disabled: {
    opacity: 0.5,
  },
  dropdownLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownValue: {
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    color: Theme.colors.text,
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  postalCodeCard: {
    height: 55,
    borderRadius: 15,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postalValue: {
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    color: Theme.colors.text,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.placeholder,
    marginLeft: 10,
  },
  actionRow: {
    marginTop: 10,
  },
  saveButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  listModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  listModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  listModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listModalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  listItemText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: Theme.colors.text,
  },
  mapSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0E7FF',
  },
  currentLocText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
    marginLeft: 5,
  },
  mapWrapper: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapOverlayText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  coordsText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
    textAlign: 'right',
  },
});
