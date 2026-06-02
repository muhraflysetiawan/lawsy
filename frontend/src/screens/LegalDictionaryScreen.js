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
  ActivityIndicator,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { LEGAL_DICTIONARY_API_URL } from '../config';

const { width, height } = Dimensions.get('window');

export const LegalDictionaryScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  
  const [terms, setTerms] = useState([]);
  const [termOfTheDay, setTermOfTheDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [activeTab, setActiveTab] = useState('definition'); // 'definition', 'pasal_id'

  const categories = ['All', 'Civil Law', 'Criminal Law', 'Business Law', 'Constitutional Law'];

  useEffect(() => {
    fetchTerms();
    fetchTermOfTheDay();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      fetchTerms(selectedCategory);
    } else {
      const delayDebounce = setTimeout(() => {
        performSearch(searchQuery);
      }, 500); // 500ms debounce
      return () => clearTimeout(delayDebounce);
    }
  }, [searchQuery, selectedCategory]);

  const fetchTerms = async (category = 'All') => {
    try {
      setLoading(true);
      const url = `${LEGAL_DICTIONARY_API_URL}?action=list&category=${encodeURIComponent(category)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        setTerms(data.terms || []);
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTermOfTheDay = async () => {
    try {
      const response = await fetch(`${LEGAL_DICTIONARY_API_URL}?action=random`);
      const data = await response.json();
      if (data.status === 'success') {
        setTermOfTheDay(data.term || null);
      }
    } catch (error) {
      console.error('Error fetching term of the day:', error);
    }
  };

  const performSearch = async (query) => {
    try {
      setSearchLoading(true);
      const url = `${LEGAL_DICTIONARY_API_URL}?action=search&query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'success') {
        let filteredTerms = data.terms || [];
        if (selectedCategory !== 'All') {
          filteredTerms = filteredTerms.filter(
            (t) => t.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        setTerms(filteredTerms);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleHelp = () => {
    alert(
      "Legal Dictionary Help",
      "Browse and search Indonesian legal terms to understand key legal frameworks before consulting a lawyer or filing a case."
    );
  };

  const openDetail = (term) => {
    setSelectedTerm(term);
    setActiveTab('definition');
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Dictionary</Text>
        <TouchableOpacity onPress={handleHelp} style={styles.headerBtn}>
          <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Theme.colors.placeholder} style={styles.searchIcon} />
            <TextInput
              placeholder="Search for legal terms, definitions..."
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

        {/* Legal Term of the Day */}
        {termOfTheDay && searchQuery.trim() === '' && (
          <View style={styles.termOfDayContainer}>
            <View style={styles.termOfDayCard}>
              <View style={styles.termOfDayBadge}>
                <Ionicons name="star" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.termOfDayBadgeText}>Legal Term of the Day</Text>
              </View>
              <Text style={styles.termOfDayTitle}>{termOfTheDay.title}</Text>
              <Text style={styles.termOfDayTranslation}>{termOfTheDay.translation}</Text>
              <Text style={styles.termOfDaySummary} numberOfLines={3}>
                {termOfTheDay.summary}
              </Text>
              <TouchableOpacity onPress={() => openDetail(termOfTheDay)} style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>Read More</Text>
                <Ionicons name="arrow-forward" size={14} color={Theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Popular Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Category</Text>
        </View>
        
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat && styles.categoryBtnActive
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dictionary Card List */}
        <View style={styles.listContainer}>
          {searchLoading || loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 30 }} />
          ) : terms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="journal-outline" size={48} color={Theme.colors.placeholder} />
              <Text style={styles.emptyText}>No legal terms found</Text>
            </View>
          ) : (
            terms.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.termCard}
                onPress={() => openDetail(item)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTermTitle}>{item.title}</Text>
                  <View style={styles.cardCategoryBadge}>
                    <Text style={styles.cardCategoryText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.cardTranslation}>{item.translation}</Text>
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {item.summary}
                </Text>
              </TouchableOpacity>
            ))
          )}

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Sheet Details Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackgroundDismiss} 
            activeOpacity={1} 
            onPress={() => setDetailModalVisible(false)}
          />
          <View style={styles.bottomSheet}>
            {selectedTerm && (
              <>
                <View style={styles.bottomSheetIndicatorRow}>
                  <View style={styles.bottomSheetIndicator} />
                </View>
                
                <View style={styles.bottomSheetHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bottomSheetTitle}>{selectedTerm.title}</Text>
                    <Text style={styles.bottomSheetTranslation}>{selectedTerm.translation}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeModalBtn}>
                    <Ionicons name="close-circle" size={26} color="#888" />
                  </TouchableOpacity>
                </View>

                {/* Custom Segment Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'definition' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('definition')}
                  >
                    <Text style={[styles.tabText, activeTab === 'definition' && styles.tabTextActive]}>
                      Definition & Concept
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'pasal_id' && styles.tabBtnActive]}
                    onPress={() => setActiveTab('pasal_id')}
                  >
                    <Text style={[styles.tabText, activeTab === 'pasal_id' && styles.tabTextActive]}>
                      Governing Regulations
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {activeTab === 'definition' ? (
                    <View style={{ paddingVertical: 10 }}>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Category Classification</Text>
                        <View style={[styles.cardCategoryBadge, { alignSelf: 'flex-start', marginTop: 4, height: 'auto', paddingVertical: 4, paddingHorizontal: 12 }]}>
                          <Text style={styles.cardCategoryText}>{selectedTerm.category}</Text>
                        </View>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Detailed Explanation</Text>
                        <Text style={styles.detailText}>{selectedTerm.definition}</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Legal Foundations / Governing Articles</Text>
                        <View style={styles.articleCard}>
                          <Ionicons name="document-text-outline" size={18} color={Theme.colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                          <Text style={styles.articleText}>{selectedTerm.articles}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={{ paddingVertical: 10 }}>
                      <Text style={[styles.detailText, { marginBottom: 15, fontStyle: 'italic', fontSize: 13, color: '#666' }]}>
                        Rujukan dokumen hukum resmi Republik Indonesia untuk "{selectedTerm.title}":
                      </Text>
                      
                      {/* Dynamic premium articles citation card */}
                      <View style={styles.pasalReferenceBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <Ionicons name="shield-checkmark" size={20} color="#2E7D32" />
                          <Text style={styles.pasalSourceTitle}>Dasar Hukum Terverifikasi</Text>
                        </View>
                        <Text style={[styles.pasalSourceSnippet, { fontSize: 14, fontFamily: Theme.fonts.bold, color: Theme.colors.primary, marginBottom: 8 }]}>
                          {selectedTerm.articles}
                        </Text>
                        <Text style={styles.pasalSourceSnippet}>
                          Pengertian hukum ini telah diselaraskan secara akurat dengan peraturan perundang-undangan dan Lembaran Negara Republik Indonesia. Anda dapat menggunakan dasar hukum ini sebagai rujukan hukum formal saat merumuskan kronologi kasus Anda sebelum melakukan konsultasi bersama pengacara di Lawsy.
                        </Text>
                      </View>

                      {/* Professional action callout */}
                      <View style={[styles.referenceContainer, { marginTop: 15 }]}>
                        <View style={styles.refRow}>
                          <Ionicons name="information-circle-outline" size={20} color={Theme.colors.primary} />
                          <Text style={[styles.refRowText, { fontFamily: Theme.fonts.bold }]}>Tips Konsultasi</Text>
                        </View>
                        <Text style={{ fontFamily: Theme.fonts.regular, fontSize: 12, color: '#4B5563', lineHeight: 18, marginTop: 4 }}>
                          Catat dasar hukum di atas dan sampaikan kepada pengacara pilihan Anda selama konsultasi untuk mempercepat proses analisis kasus hukum Anda secara profesional.
                        </Text>
                      </View>
                    </View>
                  )}
                  <View style={{ height: 40 }} />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  termOfDayContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  termOfDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: Theme.colors.primary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  termOfDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  termOfDayBadgeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  termOfDayTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.primary,
  },
  termOfDayTranslation: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  termOfDaySummary: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 15,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  readMoreText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.placeholder,
  },
  termCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTermTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    flex: 1,
    marginRight: 10,
  },
  cardCategoryBadge: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCategoryText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 10,
    color: Theme.colors.primary,
  },
  cardTranslation: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  cardSummary: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  pasalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  pasalCardTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#2E7D32',
    flex: 1,
    marginRight: 10,
  },
  pasalCardSnippet: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#555555',
    lineHeight: 16,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackgroundDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: height * 0.75,
    paddingTop: 10,
  },
  bottomSheetIndicatorRow: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  bottomSheetIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bottomSheetTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.primary,
  },
  bottomSheetTranslation: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  closeModalBtn: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#666',
  },
  tabTextActive: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
  },
  detailText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    lineHeight: 20,
    marginTop: 4,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  articleText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.primary,
    flex: 1,
    lineHeight: 18,
  },
  referenceContainer: {
    backgroundColor: '#F3F8FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    gap: 8,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refRowText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.primary,
    flex: 1,
  },
  pasalReferenceBox: {
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.15)',
  },
  pasalSourceTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: '#2E7D32',
  },
  pasalSourceSnippet: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#444',
    lineHeight: 16,
  },
});
