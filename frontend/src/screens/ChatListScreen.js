import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { CHAT_LIST_API_URL } from '../config';

export const ChatListScreen = ({ navigation, route }) => {
  const { user, activeRole } = route.params || { user: { id: '1', role: 'Client' }, activeRole: 'Client' };
  const currentRole = activeRole || user?.role || 'Client';
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    fetchChats();
    // Set up polling for new messages/chats
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch(`${CHAT_LIST_API_URL}?user_id=${user.id}&role=${currentRole}`);
      const result = await response.json();
      if (result.status === 'success') {
        setChats(result.data);
        if (searchQuery === '') {
          setFilteredChats(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching chat list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.other_user_name.toLowerCase().includes(text.toLowerCase()) ||
        (chat.last_message && chat.last_message.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredChats(filtered);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate('ChatRoom', { 
        bookingId: item.booking_id, 
        otherUser: {
          id: item.other_user_id,
          name: item.other_user_name,
          photo: item.other_user_photo,
          category: item.case_category
        },
        user: user
      })}
    >
      <Image
        source={{ uri: item.other_user_photo || `https://i.pravatar.cc/150?u=${item.other_user_id}` }}
        style={styles.profilePhoto}
      />
      <View style={styles.chatInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.other_user_name}</Text>
          <Text style={styles.timeText}>{formatTime(item.last_message_time)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.last_message || 'Start a conversation...'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by lawyer name or message..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading && chats.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.booking_id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons name="chat-question-outline" size={60} color="#DDD" />
          <Text style={styles.emptyText}>No active conversations found</Text>
          <Text style={styles.emptyCaption}>Approved bookings will appear here</Text>
        </View>
      )}

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
          <Ionicons name="chatbubble-ellipses" size={28} color={Theme.colors.primary} />
          <Text style={styles.navText}>Chat</Text>
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
          <Ionicons name="time-outline" size={28} color="#888888" />
          <Text style={styles.navTextGray}>History</Text>
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
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 18,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  searchSection: {
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  timeText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  lastMessage: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    opacity: 0.6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 18,
    color: '#999',
    marginTop: 15,
  },
  emptyCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#BBB',
    marginTop: 5,
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
});
