import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../theme';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { NGROK_URL, LAWYER_PROFILE_API_URL, GET_LAWYER_BOOKINGS_API_URL, MANAGE_BOOKING_API_URL, LAW_INSIGHTS_API_URL, LAWYER_STATS_API_URL } from '../config';

export const HomeScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(route?.params?.user || { name: 'Rafly' });
  const [activeRole, setActiveRole] = useState(route?.params?.activeRole || 'Client');
  const [topRatedLawyers, setTopRatedLawyers] = useState([]);
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [todayAgenda, setTodayAgenda] = useState([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [lawyerStats, setLawyerStats] = useState([
    { id: '1', title: 'Rating', value: '...', icon: 'star', color: '#FFD700' },
    { id: '2', title: 'Total Client', value: '...', icon: 'people', color: '#FFFFFF' },
    { id: '3', title: 'Active Cases', value: '...', icon: 'briefcase', color: '#FFFFFF' },
    { id: '4', title: 'Weekly Rev.', value: '...', icon: 'wallet', color: '#FFFFFF' },
  ]);

  // Refresh user data from AsyncStorage on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserFromStorage();
    });
    return unsubscribe;
  }, [navigation]);

  // Sync route params to state
  useEffect(() => {
    if (route?.params?.user) {
      setUser(route?.params?.user);
    } else {
      loadUserFromStorage();
    }
  }, [route?.params?.user]);

  useEffect(() => {
    if (route?.params?.activeRole) {
      setActiveRole(route?.params?.activeRole);
    }
  }, [route?.params?.activeRole]);

  // Load user data from AsyncStorage if route params is missing it
  const loadUserFromStorage = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user in HomeScreen:', error);
    }
  };

  useEffect(() => {
    if (activeRole === 'Client') {
      fetchTopRatedLawyers();
      fetchLatestInsights();
    } else if (activeRole === 'Lawyer') {
      fetchLawyerBookings();
      fetchLawyerStats();
      fetchTodayAgenda();
    }
  }, [activeRole, user]);

      const performSearch = async (query) => {
        try {
          setSearchLoading(true);
          const resp = await fetch(`${LAW_INSIGHTS_API_URL}?action=search&query=${encodeURIComponent(query)}`);
          const data = await resp.json();
          if (data.status === 'success') {
            // Backend returns data under the 'data' key for search as well
            setInsights(data.data || []);
          }
        } catch (e) {
          console.error('Search error', e);
        } finally {
          setSearchLoading(false);
        }
      };

  const fetchTopRatedLawyers = async () => {
    setLoadingLawyers(true);
    try {
      const response = await fetch(`${LAWYER_PROFILE_API_URL}?action=get_top_rated`);
      const result = await response.json();
      if (result.status === 'success') {
        setTopRatedLawyers(result.data);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoadingLawyers(false);
    }
  };

  const fetchLawyerBookings = async () => {
    setLoadingRequests(true);
    try {
      const lawyerId = user.id || '1'; 
      const response = await fetch(`${GET_LAWYER_BOOKINGS_API_URL}?lawyer_id=${lawyerId}&status=Pending`);
      const result = await response.json();
      if (result.status === 'success') {
        setBookingRequests(result.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchLawyerStats = async () => {
    try {
      const lawyerId = user.id || '1';
      const response = await fetch(`${LAWYER_STATS_API_URL}?lawyer_id=${lawyerId}`);
      const result = await response.json();
      if (result.status === 'success') {
        setLawyerStats([
          { id: '1', title: 'Rating', value: result.rating, icon: 'star', color: '#FFD700' },
          { id: '2', title: 'Total Client', value: String(result.total_clients), icon: 'people', color: '#FFFFFF' },
          { id: '3', title: 'Active Cases', value: String(result.active_cases), icon: 'briefcase', color: '#FFFFFF' },
          { id: '4', title: 'Weekly Rev.', value: result.weekly_revenue, icon: 'wallet', color: '#FFFFFF' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching lawyer stats:', error);
    }
  };

  const fetchTodayAgenda = async () => {
    setLoadingAgenda(true);
    try {
      const lawyerId = user.id || '1';
      const response = await fetch(`${GET_LAWYER_BOOKINGS_API_URL}?lawyer_id=${lawyerId}&date=today&status=Approved`);
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        const mappedAgenda = result.data.map((item) => {
          let timeStr = item.booking_time || '09:00';
          let period = 'AM';
          let displayTime = timeStr;
          
          const timeParts = timeStr.split(':');
          if (timeParts.length >= 2) {
            const hour = parseInt(timeParts[0], 10);
            if (hour >= 12) {
              period = 'PM';
              const displayHour = hour > 12 ? hour - 12 : hour;
              const min = timeParts[1];
              displayTime = `${displayHour.toString().padStart(2, '0')}:${min}`;
            } else {
              period = 'AM';
              const displayHour = hour === 0 ? 12 : hour;
              const min = timeParts[1];
              displayTime = `${displayHour.toString().padStart(2, '0')}:${min}`;
            }
          }
          
          const isVirtual = String(item.consultant_type).toLowerCase().includes('virtual') || 
                            String(item.consultant_type).toLowerCase().includes('online');
          
          return {
            id: String(item.id),
            time: displayTime,
            period: period,
            caseName: item.case_category || 'Legal Consultation',
            caseId: `BKG-${String(item.id).padStart(3, '0')}`,
            clientName: item.client_name || 'Client',
            location: isVirtual ? 'Zoom Meeting' : 'Office Room 302',
            isVirtual: isVirtual,
          };
        });
        setTodayAgenda(mappedAgenda);
      } else {
        setTodayAgenda([]);
      }
    } catch (error) {
      console.error('Error fetching today agenda:', error);
      setTodayAgenda([]);
    } finally {
      setLoadingAgenda(false);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    setUpdatingBooking(id);
    try {
      const response = await fetch(`${MANAGE_BOOKING_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        fetchLawyerBookings(); // Refresh list
        fetchTodayAgenda();    // Refresh today's agenda dynamically!
        fetchLawyerStats();    // Refresh stats dynamically!
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setUpdatingBooking(null);
    }
  };
  
  // State for dynamic articles fetched from backend
  const [legalArticles, setLegalArticles] = useState([]);

      const fetchInsights = async () => {
        try {
          setLoading(true);
          const resp = await fetch(`${LAW_INSIGHTS_API_URL}?action=list`);
          const data = await resp.json();
          if (data.status === 'success') {
            // Backend returns data under the 'data' key
            setInsights(data.data || []);
          }
        } catch (e) {
          console.error('Failed to fetch insights', e);
        } finally {
          setLoading(false);
        }
      };

  const fetchLatestInsights = async () => {
    try {
      const response = await fetch(`${LAW_INSIGHTS_API_URL}?action=latest`);
      const result = await response.json();
      if (result.status === 'success') {
        setLegalArticles(result.data);
      }
    } catch (error) {
      console.error('Error fetching latest insights:', error);
    }
  };





  // bookingRequests dummy data removed

  const renderLawyerDashboard = () => {
    return (
      <View style={styles.lawyerDashboard}>
        {/* Header Section (Same as client) */}
        <View style={styles.headerBtn} />
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `${NGROK_URL}/lawsy/backend/${user.profile_image}`) : 'https://i.pravatar.cc/150?u=' + (user.id || 'lawyer') }}
              style={styles.profilePic}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.greetingText}>Hello, Welcome!</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifyButton}>
            <Ionicons name="notifications-outline" size={24} color={Theme.colors.primary} />
            <View style={styles.notifyBadge} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {lawyerStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={stat.icon === 'star' ? styles.statHeader : [styles.statHeader, { alignItems: 'center' }]}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Ionicons name={stat.icon} size={20} color={stat.color || "#FFFFFF"} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Quick Action Section */}
        <View style={styles.lawyerSection}>
          <Text style={styles.lawyerSectionTitle}>Quick Action</Text>
          <View style={styles.quickActionRow}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIconContainer, { backgroundColor: 'rgba(29, 80, 131, 0.1)' }]}>
                <Ionicons name="briefcase" size={24} color={Theme.colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Active Case</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ManageAvailability', { user })}
            >
              <View style={[styles.quickActionIconContainer, { backgroundColor: 'rgba(29, 80, 131, 0.1)' }]}>
                <Ionicons name="calendar" size={24} color={Theme.colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Availability</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Todays Agenda Section */}
        <View style={styles.lawyerSection}>
          <View style={styles.lawyerSectionHeader}>
            <Text style={styles.lawyerSectionTitle}>Todays Agenda</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.verticalList}>
            {loadingAgenda ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginVertical: 20 }} />
            ) : todayAgenda.length > 0 ? (
              todayAgenda.map((item) => (
                <View key={item.id} style={styles.agendaCard}>
                  <View style={styles.agendaTimeContainer}>
                    <Text style={styles.agendaTimeText}>{item.time}</Text>
                    <Text style={styles.agendaPeriodText}>{item.period}</Text>
                  </View>
                  <View style={styles.agendaDivider} />
                  <View style={styles.agendaInfo}>
                    <Text style={styles.agendaCaseName}>{item.caseName}</Text>
                    <View style={styles.agendaDetailRow}>
                      <Text style={styles.agendaCaseId}>{item.caseId}</Text>
                      <Text style={styles.agendaClientName}>{item.clientName}</Text>
                    </View>
                    <View style={styles.agendaLocationRow}>
                      <Ionicons 
                        name={item.isVirtual ? "videocam-outline" : "location-outline"} 
                        size={14} 
                        color="#888888" 
                      />
                      <Text style={styles.agendaLocationText}>{item.location}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyAgendaContainer}>
                <Ionicons name="calendar-outline" size={48} color="#CCCCCC" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyAgendaText}>Agenda Kosong</Text>
                <Text style={styles.emptyAgendaSubtext}>Tidak ada konsultasi yang dijadwalkan untuk hari ini.</Text>
              </View>
            )}
          </View>
        </View>

        {/* New Request Booking Section */}
        <View style={styles.lawyerSection}>
          <View style={styles.lawyerSectionHeader}>
            <Text style={styles.lawyerSectionTitle}>New Request Booking</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{bookingRequests.length} Pending</Text>
            </View>
          </View>
          <View style={styles.verticalList}>
            {loadingRequests ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : bookingRequests.length > 0 ? (
              bookingRequests.map((request) => (
                <TouchableOpacity 
                  key={request.id} 
                  style={styles.requestCard}
                  onPress={() => navigation.navigate('DetailBooking', { bookingId: request.id })}
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestUserInfo}>
                      <Image source={{ uri: request.client_photo || `https://i.pravatar.cc/150?u=${request.user_id}` }} style={styles.requestUserPic} />
                      <View>
                        <Text style={styles.requestUserName}>{request.client_name}</Text>
                        <Text style={styles.requestUserStatus}>Request for {request.case_category}</Text>
                      </View>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="ellipsis-vertical" size={20} color="#888888" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.additional_notes || "No additional notes provided."}
                  </Text>
                  <View style={styles.requestActionRow}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={() => handleUpdateBookingStatus(request.id, 'Canceled')}
                      disabled={updatingBooking === request.id}
                    >
                      {updatingBooking === request.id ? (
                        <ActivityIndicator size="small" color="#FF5252" />
                      ) : (
                        <Text style={styles.declineButtonText}>Decline</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleUpdateBookingStatus(request.id, 'Approved')}
                      disabled={updatingBooking === request.id}
                    >
                      {updatingBooking === request.id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No new booking requests.</Text>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeRole === 'Lawyer' ? (
          renderLawyerDashboard()
        ) : (
          <>
            {/* Header Section */}
            <View style={styles.header}>
            <View style={styles.profileSection}>
              <Image
                source={{ uri: user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `${NGROK_URL}/lawsy/backend/${user.profile_image}`) : 'https://i.pravatar.cc/150?u=' + (user.id || 'client') }}
                style={styles.profilePic}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.greetingText}>Hello, Welcome!</Text>
                <Text style={styles.userName}>{user.name}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notifyButton}>
              <Ionicons name="notifications-outline" size={24} color={Theme.colors.primary} />
              <View style={styles.notifyBadge} />
            </TouchableOpacity>
          </View>

          {/* Search Bar Section */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Theme.colors.placeholder} style={styles.searchIcon} />
              <TextInput
                placeholder="Search for lawyers, articles..."
                placeholderTextColor={Theme.colors.placeholder}
                style={styles.searchInput}
              />
            </View>
          </View>

          {/* Booking Card */}
          <View style={styles.bookingCardContainer}>
            <ImageBackground
              source={require('../../assets/assets/card-booknow-homepage.webp')}
              style={styles.bookingCard}
              imageStyle={{ borderRadius: 20 }}
            >
              <View style={styles.bookingCardContent}>
                <Text style={styles.bookingTitle}>Free Legal Consultation</Text>
                <Text style={styles.bookingDescription}>
                  Speak with our top-rated lawyers for 15 mins at no cost.
                </Text>
                <TouchableOpacity style={styles.bookNowButton} onPress={() => navigation.navigate('Lawyer', { user })}>
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          {/* Quick Menus */}
          <View style={styles.quickMenuRow}>
            <TouchableOpacity 
              style={styles.quickMenuButton}
              onPress={() => navigation.navigate('LegalDictionary', { user })}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="book-open-variant" size={24} color={Theme.colors.primary} />
              </View>
              <Text style={styles.quickMenuText}>Legal Dictionary</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickMenuButton}
              onPress={() => navigation.navigate('DocumentGenerator', { user })}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={24} color={Theme.colors.primary} />
              </View>
              <Text style={styles.quickMenuText}>Document Generator</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Lawyer', { user })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryContainer}>
            <CategoryItem icon="users"     label="Family"   library="FontAwesome5" onPress={() => navigation.navigate('Lawyer', { user, category: 'Family' })} />
            <CategoryItem icon="globe"     label="Public"   library="FontAwesome5" onPress={() => navigation.navigate('Lawyer', { user, category: 'Public' })} />
            <CategoryItem icon="gavel"     label="Criminal" library="FontAwesome5" onPress={() => navigation.navigate('Lawyer', { user, category: 'Criminal' })} />
            <CategoryItem icon="briefcase" label="Civil"    library="FontAwesome5" onPress={() => navigation.navigate('Lawyer', { user, category: 'Civil' })} />
          </View>

          {/* Top Rated Lawyers Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Lawyers</Text>
          </View>
          <View style={styles.lawyerList}>
            {loadingLawyers ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} />
            ) : topRatedLawyers.length > 0 ? (
              topRatedLawyers.map((lawyer) => (
                <TouchableOpacity 
                  key={lawyer.user_id} 
                  style={styles.lawyerCard}
                  onPress={() => navigation.navigate('AboutLawyer', { lawyerId: lawyer.user_id, user })}
                >
                  <Image 
                    source={{ uri: lawyer.profile_image ? (lawyer.profile_image.startsWith('http') ? lawyer.profile_image : `${NGROK_URL}/lawsy/backend/${lawyer.profile_image}`) : 'https://i.pravatar.cc/150?u=' + lawyer.user_id }} 
                    style={styles.lawyerPic} 
                  />
                  <View style={styles.lawyerInfo}>
                    <View style={styles.lawyerHeaderRow}>
                      <Text style={styles.lawyerName} numberOfLines={1}>{lawyer.name}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{parseFloat(lawyer.rating).toFixed(1)}</Text>
                      </View>
                    </View>
                    <Text style={styles.lawyerCategory}>{lawyer.specialization || 'Lawyer'}</Text>
                    <View style={styles.experienceBadge}>
                      <Text style={styles.experienceText}>{(lawyer.years_experience || 5)} Years Experience</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No lawyers available yet.</Text>
            )}
          </View>

          {/* Legal Articles Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Legal Articles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LawInsight', { user })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.articleHorizontalList}
          >
            {legalArticles.map((article) => (
              <TouchableOpacity 
                key={article.id} 
                style={styles.articleCard}
                onPress={() => navigation.navigate('DetailInsight', { insightId: article.id, user })}
              >
                <Image source={{ uri: article.image_url }} style={styles.articleImage} />
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.articleDescription} numberOfLines={3}>
                    {article.summary}
                  </Text>
                  <TouchableOpacity 
                    style={styles.readMoreContainer}
                    onPress={() => navigation.navigate('DetailInsight', { insightId: article.id, user })}
                  >
                    <Text style={styles.readMoreText}>Read More</Text>
                    <Ionicons name="arrow-forward" size={14} color={Theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

        {/* AI Chat Button */}
        <TouchableOpacity 
          style={styles.aiChatButton}
          onPress={() => navigation.navigate('LawsyAI', { user })}
        >
          <MaterialCommunityIcons name="gavel" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.bottomNavContainer}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Home', { user, activeRole })}
          >
            <Ionicons name="home" size={28} color={Theme.colors.primary} />
            <Text style={styles.navText}>Home</Text>
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
              <TouchableOpacity style={styles.mapsButton} onPress={() => navigation.navigate('FindLawyer', { user, activeRole })}>
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

const CategoryItem = ({ icon, label, library, onPress }) => {
  const IconComponent = library === 'FontAwesome5' ? FontAwesome5 : Ionicons;
  return (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
      <View style={styles.categoryIconCircle}>
        <IconComponent name={icon} size={20} color={Theme.colors.primary} />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    // No horizontal padding here to allow full-width elements if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  greetingText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  userName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  notifyButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
  bookingCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  bookingCard: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  bookingCardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bookingTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bookingDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 15,
    maxWidth: '70%',
  },
  bookNowButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  bookNowText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  quickMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  quickMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickMenuText: {
    flex: 1,
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    color: Theme.colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  viewAllText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  categoryItem: {
    alignItems: 'center',
    width: '22%',
  },
  categoryIconCircle: {
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.text,
  },
  lawyerList: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  lawyerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lawyerPic: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginRight: 15,
  },
  lawyerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  lawyerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lawyerName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginLeft: 4,
  },
  lawyerCategory: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#888888',
    marginBottom: 8,
  },
  experienceBadge: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  experienceText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    color: Theme.colors.primary,
  },
  articleHorizontalList: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 20,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    width: 280,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImage: {
    width: '100%',
    height: 150,
  },
  articleContent: {
    padding: 15,
  },
  articleTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  articleDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 10,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
    marginRight: 5,
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
    borderBottomRightRadius: 5, // Chat bubble tail look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
  // Lawyer Dashboard Styles
  lawyerDashboard: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: Theme.colors.primary,
    width: '48%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statTitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  lawyerSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  lawyerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  lawyerSectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  verticalList: {
    width: '100%',
  },
  agendaCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  agendaTimeContainer: {
    alignItems: 'center',
    width: 50,
  },
  agendaTimeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  agendaPeriodText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  agendaDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 15,
  },
  agendaInfo: {
    flex: 1,
  },
  agendaCaseName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  agendaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  agendaCaseId: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  agendaClientName: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  agendaLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaLocationText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
    marginLeft: 5,
  },
  pendingBadge: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  pendingBadgeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: '#FF3B30',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestUserPic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestUserName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  requestUserStatus: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  requestDescription: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 15,
  },
  requestActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  declineButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: '#888888',
  },
  acceptButton: {
    backgroundColor: Theme.colors.primary,
  },
  acceptButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  emptyAgendaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 15,
  },
  emptyAgendaText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 5,
  },
  emptyAgendaSubtext: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
});
