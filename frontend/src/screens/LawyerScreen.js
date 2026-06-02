// LawyerScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Theme } from '../theme';
import { LAWYER_PROFILE_API_URL, NGROK_URL } from '../config';

const CATEGORIES = [
  { label: 'All',      icon: null,        filterKey: '' },
  { label: 'Family',   icon: 'users',     filterKey: 'Family' },
  { label: 'Public',   icon: 'globe',     filterKey: 'Public' },
  { label: 'Criminal', icon: 'gavel',     filterKey: 'Criminal' },
  { label: 'Civil',    icon: 'briefcase', filterKey: 'Civil' },
];

// ─── Extracted outside main component so it never remounts on re-render ───────
const LawyerListHeader = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  loading,
}) => (
  <>
    {/* Search Bar */}
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Theme.colors.placeholder} style={styles.searchIcon} />
        <TextInput
          placeholder="Search for lawyers..."
          placeholderTextColor={Theme.colors.placeholder}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color={Theme.colors.placeholder} style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        )}
      </View>
    </View>

    {/* Category Tabs */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryRow}
      style={styles.categoryScroll}
      keyboardShouldPersistTaps="handled"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.filterKey;
        return (
          <TouchableOpacity
            key={cat.label}
            style={[styles.categoryTab, isActive && styles.categoryTabActive]}
            onPress={() => onCategoryChange(cat.filterKey)}
            activeOpacity={0.7}
          >
            {cat.icon && (
              <FontAwesome5
                name={cat.icon}
                size={13}
                color={isActive ? '#FFFFFF' : Theme.colors.primary}
                style={{ marginRight: 5 }}
              />
            )}
            <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>

    {loading && (
      <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 30, marginBottom: 10 }} />
    )}
  </>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export const LawyerScreen = ({ navigation, route }) => {
  const initialCategory = route?.params?.category || '';
  const user = route?.params?.user || null;

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery]       = useState('');
  const [lawyers, setLawyers]               = useState([]);
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLawyers(activeCategory, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  const fetchLawyers = async (category, search) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ action: 'get_all' });
      if (category) params.append('category', category);
      if (search)   params.append('search', search);
      const resp   = await fetch(`${LAWYER_PROFILE_API_URL}?${params.toString()}`);
      const result = await resp.json();
      if (result.status === 'success') {
        setLawyers(result.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch lawyers', e);
    } finally {
      setLoading(false);
    }
  };

  // Stable callbacks — won't cause header remount
  const handleSearchChange   = useCallback((text) => setSearchQuery(text), []);
  const handleCategoryChange = useCallback((key) => setActiveCategory(key), []);

  const renderLawyerCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.lawyerCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('AboutLawyer', { lawyerId: item.user_id, user })}
    >
      <Image
        source={{ uri: item.profile_image ? (item.profile_image.startsWith('http') ? item.profile_image : `${NGROK_URL}/lawsy/backend/${item.profile_image}`) : 'https://i.pravatar.cc/150?u=' + item.user_id }}
        style={styles.lawyerPic}
      />
      <View style={styles.lawyerInfo}>
        <View style={styles.lawyerHeaderRow}>
          <Text style={styles.lawyerName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{parseFloat(item.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.lawyerCategory}>{item.specialization || 'Lawyer'}</Text>
        <View style={styles.experienceBadge}>
          <Text style={styles.experienceText}>
            {item.years_experience || 5} Years Experience
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation, user]);

  // Pass props to stable header component — React sees same component type, no remount
  const listHeader = (
    <LawyerListHeader
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
      loading={loading}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Page Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lawyer</Text>
        <View style={styles.headerBtn} />
      </View>

      <FlatList
        data={loading ? [] : lawyers}
        keyExtractor={(item) => `${item.user_id}`}
        renderItem={renderLawyerCard}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No lawyers found.</Text> : null
        }
      />
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
    backgroundColor: '#FFFFFF',
  },
  headerBtn: { padding: 5, width: 34 },
  headerTitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  categoryTabActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryTabText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 30,
  },
  lawyerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 20,
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
    backgroundColor: '#E5E7EB',
  },
  lawyerInfo: { flex: 1, justifyContent: 'center' },
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
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
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
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
    marginHorizontal: 20,
  },
});

export default LawyerScreen;
