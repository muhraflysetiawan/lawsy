// DetailInsightScreen.js
// Detail view for a Law Insight article with banner, title, author info, and content.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { LAW_INSIGHTS_API_URL } from '../config';

const { width } = Dimensions.get('window');

export const DetailInsightScreen = ({ navigation, route }) => {
  const { insightId } = route.params || {};
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (insightId) {
      fetchInsight(insightId);
    }
  }, [insightId]);

  const fetchInsight = async (id) => {
    try {
      setLoading(true);
      const resp = await fetch(`${LAW_INSIGHTS_API_URL}?action=get&id=${encodeURIComponent(id)}`);
      const data = await resp.json();
      if (data.status === 'success') {
        // Backend returns insight with flat fields; map to nested author object
        const insightData = data.data;
        const mappedInsight = {
          ...insightData,
          author: {
            id: insightData.author_id,
            name: insightData.author_name,
            avatar_url: insightData.author_photo,
            is_lawyer: insightData.author_role === 'lawyer' || insightData.author_role === 'Lawyer'
          }
        };
        setInsight(mappedInsight);
      }
    } catch (e) {
      console.error('Failed to fetch insight detail', e);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
        <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Law Insight</Text>
      <View style={styles.headerBtn} />
    </View>
  );

  if (loading || !insight) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 30 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        {insight.image_url ? (
          <Image source={{ uri: insight.image_url }} style={styles.banner} />
        ) : null}
        {/* Title & Date */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.date}>{new Date(insight.published_date).toLocaleDateString('id-ID')}</Text>
        </View>
        {/* Author Section */}
        {insight.author && (
          <View style={styles.authorContainer}>
            <Image source={{ uri: insight.author.avatar_url }} style={styles.authorAvatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{insight.author.name}</Text>
              {insight.author.is_lawyer && (
                <TouchableOpacity style={styles.viewProfileBtn} onPress={() => navigation.navigate('AboutLawyer', { lawyerId: insight.author.id, user: null })}>
                  <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        {/* Content */}
        <Text style={styles.content}>{insight.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 0 },
  headerBtn: { padding: 5 },
  headerTitle: { fontFamily: Theme.fonts.regular, fontSize: 18, color: Theme.colors.primary, textAlign: 'center', flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  banner: { width: width - 40, height: 180, borderRadius: 12, marginBottom: 15, backgroundColor: '#E5E7EB' },
  titleContainer: { marginBottom: 10 },
  title: { fontFamily: Theme.fonts.bold, fontSize: 22, color: Theme.colors.primary, marginBottom: 4 },
  date: { fontFamily: Theme.fonts.medium, fontSize: 12, color: '#888' },
  authorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  authorAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB' },
  authorInfo: { marginLeft: 10 },
  authorName: { fontFamily: Theme.fonts.bold, fontSize: 15, color: Theme.colors.text },
  viewProfileBtn: { marginTop: 4 },
  viewProfileText: { fontFamily: Theme.fonts.medium, fontSize: 13, color: Theme.colors.primary },
  content: { fontFamily: Theme.fonts.regular, fontSize: 15, color: Theme.colors.text, lineHeight: 22 },
});

export default DetailInsightScreen;
