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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LAWYER_PROFILE_API_URL, NGROK_URL } from '../config';

const { width } = Dimensions.get('window');

export const AboutLawyerScreen = ({ navigation, route }) => {
  const { lawyerId, user } = route.params;
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLawyerDetail();
  }, []);

  const fetchLawyerDetail = async () => {
    try {
      const response = await fetch(`${LAWYER_PROFILE_API_URL}?action=get_profile&user_id=${lawyerId}`);
      const result = await response.json();
      if (result.status === 'success') {
        setLawyer(result.data);
      }
    } catch (error) {
      console.error('Error fetching lawyer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Lawyer not found</Text>
      </View>
    );
  }

  const renderStatCard = (icon, title, value) => (
    <View style={styles.statCard}>
      <View style={styles.statIconCircle}>
        <MaterialCommunityIcons name={icon} size={24} color={Theme.colors.primary} />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderRatingBar = (star, percentage) => (
    <View style={styles.ratingBarRow}>
      <Text style={styles.starNum}>{star}</Text>
      <Ionicons name="star" size={12} color="#FFD700" style={{ marginHorizontal: 5 }} />
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Lawyer</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('BookingLawyer', { lawyer: lawyer, user })}
        >
          <MaterialCommunityIcons name="calendar-check" size={26} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: lawyer.profile_image ? (lawyer.profile_image.startsWith('http') ? lawyer.profile_image : `${NGROK_URL}/lawsy/backend/${lawyer.profile_image}`) : 'https://i.pravatar.cc/150?u=' + lawyer.user_id }}
            style={styles.profilePic}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.lawyerName}>{lawyer.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={16} color={Theme.colors.primary} />
              <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                {lawyer.location || 'Location not set'}
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{lawyer.specialization || 'Lawyer'}</Text>
            </View>
          </View>
        </View>

        {/* Lawyer Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lawyer Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              {renderStatCard('briefcase-check', 'Cases', (lawyer.cases_solved || 0) + (lawyer.cases_solved > 0 ? '+' : ''))}
              {renderStatCard('clock-outline', 'Experience', (lawyer.years_experience || 0) + ' Years')}
            </View>
            <View style={styles.statsRow}>
              {renderStatCard('account-group', 'Clients Served', (lawyer.clients_served || 0) + (lawyer.clients_served > 0 ? '+' : ''))}
              {renderStatCard('chat-processing', 'Consultations', (lawyer.legal_consultations || 0) + (lawyer.legal_consultations > 0 ? '+' : ''))}
            </View>
          </View>
        </View>

        {/* Areas of Expertise */}
        <View style={[styles.section, { marginTop: -15 }]}>
          <Text style={styles.sectionTitle}>Areas of Expertise</Text>
          <View style={styles.expertiseContainer}>
            {lawyer.expertise && lawyer.expertise.map((item, index) => (
              <View key={index} style={styles.expertiseTag}>
                <Text style={styles.expertiseTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Lawyer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Lawyer</Text>
          <Text style={styles.aboutText}>
            {lawyer.about_me || 'No biography provided yet.'}
          </Text>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.certScroll}>
            {lawyer.certifications && lawyer.certifications.map((cert) => (
              <View key={cert.id} style={styles.certCard}>
                <View style={styles.certBadge}>
                  <Text style={styles.certBadgeText}>{cert.category}</Text>
                </View>
                <Text style={styles.certName} numberOfLines={1}>{cert.name}</Text>
                <Text style={styles.certDesc} numberOfLines={2}>{cert.description}</Text>
                <View style={styles.certFooter}>
                  <Text style={styles.certDate}>{cert.uploadDate}</Text>
                  <Text style={styles.viewLink}>View</Text>
                </View>
              </View>
            ))}
            {(!lawyer.certifications || lawyer.certifications.length === 0) && (
              <Text style={styles.emptyText}>No certifications listed.</Text>
            )}
          </ScrollView>
        </View>

        {/* Ratings and Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Ratings and Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.reviewCaption}>
            ratings and reviews are verified and come from people who use the same type of device you use <Ionicons name="information-circle-outline" size={14} color="#888" />
          </Text>
          
          <View style={styles.ratingOverviewRow}>
            <View style={styles.ratingBars}>
              {renderRatingBar(5, 80)}
              {renderRatingBar(4, 60)}
              {renderRatingBar(3, 40)}
              {renderRatingBar(2, 20)}
              {renderRatingBar(1, 10)}
            </View>
            <View style={styles.ratingScoreContainer}>
              <Text style={styles.bigRating}>{(lawyer.rating || 0).toFixed(1)}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4].map(i => <Ionicons key={i} name="star" size={16} color="#FFD700" />)}
                <Ionicons name="star-outline" size={16} color="#FFD700" />
              </View>
              <Text style={styles.totalReviews}>{lawyer.review_count || 0} Reviews</Text>
            </View>
          </View>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity style={[styles.filterPill, styles.filterPillActive]}>
              <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterText}>Positive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterText}>Critical</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterText}>5 <Ionicons name="star" size={12} /></Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Sample Review */}
          <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: 'https://i.pravatar.cc/100?u=c' }} style={styles.reviewerPic} />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>Courtney Henry</Text>
                <View style={styles.reviewMeta}>
                   <View style={styles.miniStars}>
                     {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={12} color="#FFD700" />)}
                   </View>
                   <Text style={styles.reviewTime}>2 mins ago</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <Text style={styles.reviewContent}>
              Trusted lawyers provide professional legal services and guidance to help resolve cases efficiently and fairly.
            </Text>
            <Text style={styles.helpfulText}>8 people found this helpful</Text>
            <View style={styles.reviewActions}>
              <Text style={styles.wasHelpful}>Was this review helpful?</Text>
              <View style={styles.actionBtns}>
                <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>Yes</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>No</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.bookBtn}
          onPress={() => navigation.navigate('BookingLawyer', { lawyer: lawyer, user })}
        >
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 15,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  lawyerName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  statsGrid: {
    marginBottom: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 52) / 2,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#888888',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    marginBottom: 10,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseTag: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  expertiseTagText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#FFFFFF',
  },
  aboutText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  certScroll: {
    paddingBottom: 5,
  },
  certCard: {
    backgroundColor: '#FFFFFF',
    width: 260,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  certBadge: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  certBadgeText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 11,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },
  certName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  certDesc: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.primary,
    marginBottom: 12,
    lineHeight: 18,
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  certDate: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  viewLink: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
    textDecorationLine: 'underline',
  },
  viewAllLink: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  reviewCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 15,
  },
  ratingOverviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  ratingBars: {
    flex: 1.2,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starNum: {
    width: 10,
    fontSize: 12,
    color: Theme.colors.text,
  },
  barBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 3,
  },
  ratingScoreContainer: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
    marginLeft: 15,
  },
  bigRating: {
    fontFamily: Theme.fonts.bold,
    fontSize: 48,
    color: Theme.colors.text,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalReviews: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F0F2F5',
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: Theme.colors.primary,
  },
  filterText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#666666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  reviewItem: {
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerPic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewTime: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  reviewContent: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
    marginBottom: 12,
  },
  helpfulText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#008489',
    marginBottom: 15,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wasHelpful: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  actionBtns: {
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginLeft: 10,
  },
  actionBtnText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  viewAllReviewBtn: {
    height: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllReviewText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
  },
  bookBtn: {
    backgroundColor: Theme.colors.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
});
