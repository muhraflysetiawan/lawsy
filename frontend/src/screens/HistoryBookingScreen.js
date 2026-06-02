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
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { GET_USER_BOOKINGS_API_URL, MANAGE_BOOKING_API_URL } from '../config';

export const HistoryBookingScreen = ({ navigation, route }) => {
  const { user = { id: '1', role: 'Client' }, activeRole } = route.params || {};
  const currentRole = activeRole || user?.role || 'Client';
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Pending', 'Confirmation', 'Payment', 'Scheduled', 'Canceled'];

  useEffect(() => {
    fetchBookings();
  }, [activeCategory]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${GET_USER_BOOKINGS_API_URL}?user_id=${user.id}&role=${currentRole}&status=${activeCategory}`
      );
      const result = await response.json();
      if (result.status === 'success') {
        setBookings(result.data);
        setFilteredBookings(result.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      const response = await fetch(MANAGE_BOOKING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          status: newStatus,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        if (newStatus === 'Approved') {
          // If approved, fetch booking details to get full data for CreateCase
          const detailRes = await fetch(`${MANAGE_BOOKING_API_URL}?id=${item.id}`);
          const detailData = await detailRes.json();
          if (detailData.status === 'success') {
            navigation.navigate('CreateCase', { booking: detailData.data });
          } else {
            fetchBookings();
          }
        } else {
          fetchBookings();
        }
      } else {
        Alert.alert("Error", result.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error occurred");
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredBookings(bookings);
    } else {
      const filtered = bookings.filter((item) =>
        item.other_party_name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  };

  const formatRequestAt = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    
    return `${dayName}, ${monthName} ${day}, ${year}/${strTime}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Canceled': return '#F44336';
      case 'Pending': return '#FF9800';
      default: return '#888888';
    }
  };

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('DetailBooking', { bookingId: item.id, role: currentRole })}
    >
      <View style={styles.cardTop}>
        <Image
          source={{ uri: item.other_party_photo || `https://i.pravatar.cc/150?u=${item.other_party_name}` }}
          style={styles.profilePic}
        />
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.lawyerName} numberOfLines={1}>
              {item.other_party_name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status === 'Approved' ? 'Confirmation' : item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.lawCategory}>{item.case_category || item.law_category || 'Lawyer'}</Text>
          <Text style={styles.requestAt}>Request at {formatRequestAt(item.created_at)}</Text>
        </View>
      </View>
      {currentRole === 'Lawyer' && item.status === 'Pending' ? (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.declineBtn]} 
            onPress={() => handleUpdateStatus(item, 'Canceled')}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.acceptBtn]} 
            onPress={() => handleUpdateStatus(item, 'Approved')}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => navigation.navigate('DetailBooking', { bookingId: item.id, role: currentRole })}
        >
          <Text style={styles.detailButtonText}>View Detail</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButton} />
        <Text style={styles.headerTitle}>History Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by lawyer name..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categorySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={60} color="#DDD" />
          <Text style={styles.emptyText}>No booking history found</Text>
        </View>
      )}

        {/* AI Chat Button */}
        <TouchableOpacity 
          style={styles.aiChatButton}
          onPress={() => navigation.navigate('ChatList', { user, activeRole: currentRole })}
        >
          <MaterialCommunityIcons name="gavel" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => navigation.navigate('Home', { user, activeRole: currentRole })}
          >
            <Ionicons name="home-outline" size={28} color="#888888" />
            <Text style={styles.navTextGray}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('ChatList', { user, activeRole: currentRole })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="#888888" />
            <Text style={styles.navTextGray}>Chat</Text>
          </TouchableOpacity>
          
          {currentRole !== 'Lawyer' && (
            <View style={styles.mapsButtonContainer}>
              <TouchableOpacity 
                style={styles.mapsButton} 
                onPress={() => navigation.navigate('FindLawyer', { user, activeRole: currentRole })}
              >
                <Ionicons name="map" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.navText}>Maps</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('HistoryBooking', { user, activeRole: currentRole })}
          >
            <Ionicons name="time" size={28} color={Theme.colors.primary} />
            <Text style={styles.navText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => navigation.navigate('Profile', { user, activeRole: currentRole })}
          >
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
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
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
  categorySection: {
    marginBottom: 20,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F5F7FA',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryBtnActive: {
    backgroundColor: Theme.colors.primary,
  },
  categoryText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0F0F0',
  },
  infoContainer: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lawyerName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 10,
  },
  lawCategory: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  requestAt: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#888',
  },
  detailButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 10,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    marginRight: 8,
  },
  declineBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  acceptBtn: {
    backgroundColor: Theme.colors.primary,
    marginLeft: 8,
  },
  acceptBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  // Bottom Nav Styles
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
