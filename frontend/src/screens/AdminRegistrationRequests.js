import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { REGISTRATION_API_URL } from '../config';
import * as WebBrowser from 'expo-web-browser';

export const AdminRegistrationRequests = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${REGISTRATION_API_URL}?action=get_all_requests`);
      const result = await response.json();
      if (result.status === 'success') {
        setRequests(result.requests);
      } else {
        Alert.alert('Error', 'Failed to fetch requests');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    Alert.alert(
      'Approve Registration',
      'Are you sure you want to approve this lawyer registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              const response = await fetch(`${REGISTRATION_API_URL}?action=approve_request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registration_id: id }),
              });
              const result = await response.json();
              if (result.status === 'success') {
                Alert.alert('Approved', 'Lawyer registration has been approved.');
                fetchRequests();
              } else {
                Alert.alert('Error', result.message || 'Approval failed');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Connection failed');
            }
          },
        },
      ]
    );
  };

  const handlePreview = async (path) => {
    if (!path) return;
    const baseUrl = REGISTRATION_API_URL.replace('/lawyer_registration.php', '/');
    const fullUrl = baseUrl + path;
    await WebBrowser.openBrowserAsync(fullUrl);
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name}</Text>
          <Text style={styles.userEmail}>{item.user_email}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <DetailItem label="Firm" value={item.law_firm} />
        <DetailItem label="Specialization" value={item.specialization} />
        <DetailItem label="Experience" value={`${item.years_experience} Years`} />
      </View>

      <Text style={styles.sectionTitle}>Documents</Text>
      <View style={styles.docRow}>
        <DocThumbnail label="ID" onPress={() => handlePreview(item.id_card_path)} exists={item.id_card_path} />
        <DocThumbnail label="License" onPress={() => handlePreview(item.lawyer_license_path)} exists={item.lawyer_license_path} />
        <DocThumbnail label="Oath" onPress={() => handlePreview(item.oath_doc_path)} exists={item.oath_doc_path} />
        <DocThumbnail label="Degree" onPress={() => handlePreview(item.degree_path)} exists={item.degree_path} />
        <DocThumbnail label="Face" onPress={() => handlePreview(item.face_scan_path)} exists={item.face_scan_path} />
      </View>

      <TouchableOpacity 
        style={styles.approveButton}
        onPress={() => handleApprove(item.id)}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.approveButtonText}>Approve Registration</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lawyer Requests</Text>
        <TouchableOpacity onPress={fetchRequests} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={80} color="#CCCCCC" />
              <Text style={styles.emptyText}>No pending registration requests</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
  </View>
);

const DocThumbnail = ({ label, onPress, exists }) => (
  <TouchableOpacity 
    style={[styles.docThumb, !exists && styles.docThumbMissing]} 
    onPress={onPress}
    disabled={!exists}
  >
    <Ionicons name={exists ? "document-attach" : "close-circle"} size={20} color={exists ? Theme.colors.primary : "#FF5252"} />
    <Text style={[styles.docThumbLabel, !exists && { color: "#FF5252" }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.primary,
  },
  refreshBtn: {
    padding: 5,
  },
  listContent: {
    padding: 15,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  userEmail: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 10,
    color: '#FF9800',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
  },
  detailItem: {
    width: '33.33%',
    padding: 5,
  },
  detailLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 10,
    color: '#888888',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: Theme.colors.text,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#444444',
    marginBottom: 10,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  docThumb: {
    width: '18%',
    height: 50,
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29, 80, 131, 0.1)',
  },
  docThumbMissing: {
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
    borderColor: 'rgba(255, 82, 82, 0.1)',
  },
  docThumbLabel: {
    fontFamily: Theme.fonts.bold,
    fontSize: 9,
    color: Theme.colors.primary,
    marginTop: 2,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    height: 45,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: '#999999',
    marginTop: 15,
  },
});
