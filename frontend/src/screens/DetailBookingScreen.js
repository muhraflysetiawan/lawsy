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
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Theme } from '../theme';
import { MANAGE_BOOKING_API_URL, BASE_URL } from '../config';

export const DetailBookingScreen = ({ navigation, route }) => {
  const { bookingId } = route.params || { bookingId: null };
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID not found");
      navigation.goBack();
      return;
    }

    try {
      const response = await fetch(`${MANAGE_BOOKING_API_URL}?id=${bookingId}`);
      const result = await response.json();
      if (result.status === 'success') {
        setBooking(result.data);
      } else {
        Alert.alert("Error", result.message || "Failed to fetch booking details");
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(MANAGE_BOOKING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert("Success", `Booking ${newStatus.toLowerCase()} successfully`);
        if (newStatus === 'Approved' && (route.params?.role === 'Lawyer' || !route.params?.role)) {
          navigation.navigate('CreateCase', { booking: booking });
        } else {
          fetchBookingDetails();
        }
      } else {
        Alert.alert("Error", result.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return `${formattedDate} | ${timeStr}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Canceled': return '#F44336';
      case 'Pending': return '#FF9800';
      default: return '#888888';
    }
  };

  const formatRequestAt = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    // format as "Wed, Nov 20, 2026/09:20 AM"
    const formatted = date.toLocaleString('en-US', options).replace(/, /g, ', ');
    const parts = formatted.split(', ');
    // parts: [Wed, Nov 20, 2026, 09:20 AM]
    if (parts.length >= 3) {
      const timePart = parts[2].split(' at ');
      return `${parts[0]}, ${parts[1]}, ${timePart[0]}/${timePart[1] || parts[2]}`;
    }
    return formatted;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtnLeft}>
        <Ionicons name="chevron-back" size={28} color={Theme.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Detail Booking</Text>
      <TouchableOpacity style={styles.headerBtnRight}>
        <Ionicons name="help-circle-outline" size={28} color={Theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderClientInfo = () => (
    <View style={styles.clientSection}>
      <Image
        source={{ uri: booking.client_photo ? booking.client_photo : `https://i.pravatar.cc/150?u=${booking.user_id}` }}
        style={styles.clientPhoto}
      />
      <View style={styles.clientDetails}>
        <Text style={styles.clientName}>{booking.client_name}</Text>
        <View style={styles.requestAtRow}>
          <Ionicons name="time-outline" size={16} color="#888888" style={{ marginRight: 5 }} />
          <Text style={styles.metaText}>Request at {formatRequestAt(booking.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '15', marginTop: 5 }]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>{booking.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderScheduledTimeCard = () => {
    const methodIcon = booking.consultant_type === 'Online' ? 'video' : 
                       booking.consultant_type === 'Office' ? 'building' : 'map-marker-alt';
    
    return (
      <View style={[styles.infoCard, styles.blueLeftBorder]}>
        <Text style={styles.cardHeader}>Scheduled Time</Text>
        <Text style={styles.timeTextBold}>{formatDate(booking.booking_date, booking.booking_time)}</Text>
        <Text style={styles.durationText}>Duration: 1 hour</Text>
        
        <View style={styles.methodCard}>
          <FontAwesome5 name={methodIcon} size={14} color={Theme.colors.primary} />
          <Text style={styles.methodText}>Booking via {booking.consultant_type}</Text>
        </View>
      </View>
    );
  };

  const renderCaseDetailsCard = () => (
    <View style={[styles.infoCard, styles.caseTypeCard]}>
      <Text style={styles.caseTypeLabel}>Case Type: <Text style={{ color: Theme.colors.primary }}>{booking.case_category}</Text></Text>
      <Text style={styles.noteText}>{booking.additional_notes || "No additional notes from client."}</Text>
    </View>
  );

  const renderAttachments = () => {
    const files = booking.document_path ? booking.document_path.split(', ') : [];
    
    return (
      <View style={styles.attachmentsSection}>
        <Text style={styles.sectionTitle}>Attachments</Text>
        {files.length > 0 ? (
          files.map((file, index) => {
            const fileName = file.split('/').pop();
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.fileItem}
                onPress={async () => {
                  const url = BASE_URL + file;
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert("Error", "Don't know how to open this URL: " + url);
                  }
                }}
              >
                <View style={styles.fileIconBox}>
                  <MaterialCommunityIcons name="file-document-outline" size={24} color={Theme.colors.primary} />
                </View>
                <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No attachments uploaded.</Text>
        )}
      </View>
    );
  };

  const renderFooterButtons = () => {
    const role = route.params?.role || 'Lawyer';

    if (role === 'Client') {
      return (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.footerBtn, styles.cancelBtn]} 
            onPress={() => handleUpdateStatus('Canceled')}
            disabled={updating || booking.status === 'Canceled'}
          >
            {updating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.cancelBtnText}>Cancel Appointment</Text>}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.footerBtn, styles.declineBtn]} 
          onPress={() => handleUpdateStatus('Canceled')}
          disabled={updating || booking.status !== 'Pending'}
        >
          {updating ? <ActivityIndicator color={Theme.colors.primary} /> : <Text style={styles.declineBtnText}>Decline</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerBtn, styles.acceptBtn]} 
          onPress={() => handleUpdateStatus('Approved')}
          disabled={updating || booking.status !== 'Pending'}
        >
          {updating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.acceptBtnText}>Accept</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderClientInfo()}
        {renderScheduledTimeCard()}
        {renderCaseDetailsCard()}
        {renderAttachments()}
      </ScrollView>
      {renderFooterButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  headerBtnLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerBtnRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  clientPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
  },
  clientDetails: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  requestAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  blueLeftBorder: {
    borderLeftWidth: 5,
    borderLeftColor: Theme.colors.primary,
  },
  caseTypeCard: {
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    borderWidth: 0,
  },
  cardHeader: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 10,
  },
  timeTextBold: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  durationText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#888888',
    marginBottom: 15,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 80, 131, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  methodText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
    marginLeft: 8,
  },
  caseTypeLabel: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 10,
  },
  noteText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  attachmentsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 15,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileName: {
    flex: 1,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  footerBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    marginRight: 10,
  },
  declineBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
  },
  acceptBtn: {
    backgroundColor: Theme.colors.primary,
    marginLeft: 10,
  },
  acceptBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: '#F44336',
  },
  cancelBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
