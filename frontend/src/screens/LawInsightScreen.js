// LawInsightScreen.js
// This screen displays a list of legal insights/articles.
// Premium design with glassmorphism-like cards and a floating search bar.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Platform, StatusBar, SafeAreaView, TextInput, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { LAW_INSIGHTS_API_URL } from '../config';

const { width, height } = Dimensions.get('window');

export const LawInsightScreen = ({ navigation }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch all insights (initial load)
  useEffect(() => {
    fetchInsights();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      fetchInsights();
      return;
    }
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${LAW_INSIGHTS_API_URL}?action=list`);
      const data = await resp.json();
      if (data.status === 'success') {
        setInsights(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch insights', e);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      setSearchLoading(true);
      const resp = await fetch(`${LAW_INSIGHTS_API_URL}?action=search&query=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (data.status === 'success') {
        setInsights(data.insights || []);
      }
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setSearchLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DetailInsight', { insightId: item.id })} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.date}>{new Date(item.published_date).toLocaleDateString('id-ID')}</Text>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.caption} numberOfLines={2}>{item.summary}…</Text>
        </View>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const handleHelp = () => {
    alert('Law Insight Help', 'Browse, search and read the latest legal insights. Tap a card to view the full article.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Law Insight</Text>
        <TouchableOpacity onPress={handleHelp} style={styles.headerBtn}>
          <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Theme.colors.placeholder} style={styles.searchIcon} />
          <TextInput
            placeholder="Search insights..."
            placeholderTextColor={Theme.colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Theme.colors.placeholder} style={{ marginRight: 5 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content List */}
      {loading || searchLoading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={insights}
          keyExtractor={(item) => `${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 0 },
  headerBtn: { padding: 5 },
  headerTitle: { fontFamily: Theme.fonts.regular, fontSize: 18, color: Theme.colors.primary, textAlign: 'center', flex: 1 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: Theme.fonts.regular, fontSize: 14, color: Theme.colors.text },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 2 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  textContainer: { flex: 1, paddingRight: 10 },
  date: { fontFamily: Theme.fonts.medium, fontSize: 11, color: '#888', marginBottom: 4 },
  title: { fontFamily: Theme.fonts.bold, fontSize: 15, color: Theme.colors.primary, marginBottom: 2 },
  caption: { fontFamily: Theme.fonts.regular, fontSize: 13, color: '#555', lineHeight: 18 },
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#E5E7EB' },
});

export default LawInsightScreen;
