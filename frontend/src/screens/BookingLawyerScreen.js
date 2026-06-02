import React, { useState } from 'react';
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
  Dimensions,
  PanResponder,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Theme } from '../theme';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BOOKING_API_URL, MANAGE_AVAILABILITY_API_URL, GET_LAWYER_BOOKINGS_API_URL } from '../config';


const { width, height } = Dimensions.get('window');

const formatDateLocal = (date) => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const BookingLawyerScreen = ({ navigation, route }) => {
  const { lawyer } = route.params || {
    lawyer: {
      id: '1',
      name: 'Aditya Pratama, S.H.',
      specialization: 'Corporate Lawyer',
      rating: 4.8,
      user_id: '1',
    }
  };

  const [consultantType, setConsultantType] = useState('Online');
  
  // Realtime Calendar Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedFullDate, setSelectedFullDate] = useState(today);

  const handlePrevMonth = () => {
    const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    const currentMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prevMonth >= currentMonthFirst) {
      setViewDate(prevMonth);
    }
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Swipe Gesture Handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only set pan responder if horizontal movement is significant
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        // Swipe Right -> Prev Month
        handlePrevMonth();
      } else if (gestureState.dx < -50) {
        // Swipe Left -> Next Month
        handleNextMonth();
      }
    },
  });

  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Family Law');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Dynamic Availability States
  const [closedDates, setClosedDates] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [slotAvailabilities, setSlotAvailabilities] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  React.useEffect(() => {
    fetchLawyerAvailability();
  }, [lawyer.user_id]);

  const fetchLawyerAvailability = async () => {
    try {
      setLoadingAvailability(true);
      
      // 1. Fetch closed dates, working hours, slot availabilities
      const avResponse = await fetch(`${MANAGE_AVAILABILITY_API_URL}?action=get_availability&lawyer_id=${lawyer.user_id}`);
      const avJson = await avResponse.json();
      if (avJson.status === 'success') {
        setClosedDates(avJson.data.closed_dates || []);
        setWorkingHours(avJson.data.working_hours || []);
        setSlotAvailabilities(avJson.data.slot_availabilities || []);
      }

      // 2. Fetch existing approved or pending bookings
      const bkResponse = await fetch(`${GET_LAWYER_BOOKINGS_API_URL}?lawyer_id=${lawyer.user_id}`);
      const bkJson = await bkResponse.json();
      if (bkJson.status === 'success') {
        setExistingBookings(bkJson.data || []);
      }
    } catch (error) {
      console.error("Error fetching lawyer availability:", error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const dayMatchesRange = (dayRange, date) => {
    const dayIndex = date.getDay();
    const dayName = dayNames[dayIndex];
    const shortDayName = shortDayNames[dayIndex];
    const cleanRange = dayRange.trim().toLowerCase();

    if (cleanRange === 'mon - fri') return dayIndex >= 1 && dayIndex <= 5;
    if (cleanRange === 'sat - sun') return dayIndex === 0 || dayIndex === 6;
    if (cleanRange === 'mon - sat') return dayIndex >= 1 && dayIndex <= 6;

    if (cleanRange.includes(dayName.toLowerCase()) || cleanRange.includes(shortDayName.toLowerCase())) return true;

    if (cleanRange.includes('-')) {
      const parts = cleanRange.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const getDayIndex = (str) => {
          const s = str.toLowerCase();
          for (let i = 0; i < 7; i++) {
            if (dayNames[i].toLowerCase().startsWith(s) || shortDayNames[i].toLowerCase().startsWith(s)) return i;
          }
          return -1;
        };
        const startIndex = getDayIndex(parts[0]);
        const endIndex = getDayIndex(parts[1]);
        if (startIndex !== -1 && endIndex !== -1) {
          if (startIndex <= endIndex) return dayIndex >= startIndex && dayIndex <= endIndex;
          else return dayIndex >= startIndex || dayIndex <= endIndex;
        }
      }
    }
    return false;
  };

  const parseTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes) => {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    else if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const generateSlotsForHours = (startTimeStr, endTimeStr) => {
    const start = parseTimeToMinutes(startTimeStr);
    const end = parseTimeToMinutes(endTimeStr);
    const slots = [];
    let current = start;
    while (current + 60 <= end) {
      const slotStart = formatMinutesToTime(current);
      const slotEnd = formatMinutesToTime(current + 60);
      slots.push(`${slotStart} - ${slotEnd}`);
      current += 60;
    }
    return slots;
  };

  const getDynamicSlotsForDate = (date) => {
    const dateStr = formatDateLocal(date);
    if (closedDates.includes(dateStr)) {
      return [];
    }

    // 1. Generate slots based on matching working hours
    let slots = [];
    workingHours.forEach(wh => {
      if (dayMatchesRange(wh.day_range, date)) {
        const generated = generateSlotsForHours(wh.start_time, wh.end_time);
        slots = [...slots, ...generated];
      }
    });
    slots = [...new Set(slots)]; // deduplicate
    // 2. Filter out slots disabled by the lawyer
    slots = slots.filter(slot => {
      const override = slotAvailabilities.find(sa => sa.slot_date === dateStr && sa.slot_time === slot);
      if (override) {
        return override.is_available === 1;
      }
      return true; // default available
    });

    return slots;
  };

  const isSlotBookedClient = (slotTime, date) => {
    if (!date) return false;
    const dateStr = formatDateLocal(date);
    return existingBookings.some(b => {
      return b.booking_date === dateStr && 
             b.booking_time?.trim() === slotTime?.trim() && 
             (b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'approved' || b.status?.toLowerCase() === 'pending' || b.status?.toLowerCase() === 'proposed');
    });
  };


  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      // 20MB Limit
      if (file.size > 20 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Maximum file size is 20MB.');
        return;
      }

      setUploadingDoc(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });

      const response = await fetch(`${BOOKING_API_URL}?action=upload_doc`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const resData = await response.json();
      if (resData.status === 'success') {
        setUploadedFiles([
          ...uploadedFiles,
          {
            id: Date.now().toString(),
            name: resData.file_name,
            size: resData.file_size,
            path: resData.file_path
          }
        ]);
        Alert.alert('Success', `${file.name} uploaded successfully.`);
      } else {
        Alert.alert('Upload Failed', resData.message || 'Unknown error');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeFile = (id) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
  };

  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateEndTime = (startTime) => {
    if (!startTime) return "";
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    let newHours = hours + 1;
    let newPeriod = period;

    if (newHours === 12) {
      newPeriod = period === 'AM' ? 'PM' : 'AM';
    } else if (newHours > 12) {
      newHours -= 12;
    }

    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${newPeriod}`;
  };

  const handleConfirm = async () => {
    // Validation
    if (!consultantType || !selectedFullDate || !selectedSlot || !selectedCategory) {
      Alert.alert("Error", "Please fill all required fields before confirming.");
      return;
    }

    setLoading(true);
    try {
      // In a real app, get user_id from context or storage
      const userId = route.params?.user?.id || '1'; 
      const bookingData = {
        user_id: userId,
        lawyer_id: lawyer.user_id,
        consultant_type: consultantType,
        booking_date: formatDateLocal(selectedFullDate),
        booking_time: selectedSlot,
        case_category: selectedCategory,
        additional_notes: notes,
        document_path: uploadedFiles.map(f => f.path).join(', ')
      };

      const response = await fetch(BOOKING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setShowPopup(true);
      } else {
        Alert.alert("Booking Failed", result.message || "An error occurred.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const consultantTypes = [
    { id: 'Online', title: 'Online', icon: 'video', caption: 'Via video call' },
    { id: 'Office', title: 'Office', icon: 'building', caption: 'At lawyer office' },
    { id: 'Client', title: 'Client', icon: 'map-marker-alt', caption: 'At your location' },
  ];

  const categories = [
    'Family Law', 'Criminal Law', 'Business Law', 'Property Law', 'Civil Law', 'Tax Law'
  ];

  const morningSlots = ['07:00 AM', '08:30 AM', '11:00 AM'];
  const afternoonSlots = ['01:00 PM', '02:30 PM', '04:00 PM'];

  // Helper functions for calendar
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const isDateFullyBooked = (date) => {
    if (!date) return false;
    const dateStr = formatDateLocal(date);
    if (closedDates.includes(dateStr)) return false;

    let slots = [];
    workingHours.forEach(wh => {
      if (dayMatchesRange(wh.day_range, date)) {
        const generated = generateSlotsForHours(wh.start_time, wh.end_time);
        slots = [...slots, ...generated];
      }
    });
    slots = [...new Set(slots)];

    slots = slots.filter(slot => {
      const override = slotAvailabilities.find(sa => sa.slot_date === dateStr && sa.slot_time === slot);
      if (override) {
        return override.is_available === 1;
      }
      return true;
    });

    if (slots.length === 0) return false;

    return slots.every(slot => {
      return existingBookings.some(b => {
        return b.booking_date === dateStr && 
               b.booking_time?.trim() === slot?.trim() && 
               (b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'approved' || b.status?.toLowerCase() === 'pending' || b.status?.toLowerCase() === 'proposed');
      });
    });
  };

  const generateDates = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const dates = [];
    // Previous month filler
    for (let i = 0; i < firstDay; i++) {
      dates.push({ day: null, id: `empty-${i}` });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dateStr = formatDateLocal(dateObj);
      const isClosed = closedDates.includes(dateStr);
      const isFull = isDateFullyBooked(dateObj);
      dates.push({
        day: i,
        isPast: dateObj < today || isClosed,
        isClosed: isClosed,
        isFull: isFull,
        fullDate: dateObj,
        id: `date-${i}`
      });
    }
    return dates;
  };


  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
        <Ionicons name="chevron-back" size={28} color={Theme.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Booking Appointment</Text>
      <View style={styles.headerIcon} />
    </View>
  );

  const renderLawyerCard = () => (
    <View style={styles.lawyerCard}>
      <Image
        source={{ uri: 'https://i.pravatar.cc/150?u=' + lawyer.user_id }}
        style={styles.lawyerPhoto}
      />
      <View style={styles.lawyerInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.lawyerName} numberOfLines={1}>{lawyer.name}</Text>
          <MaterialCommunityIcons name="check-decagram" size={18} color="#4CAF50" style={{ marginLeft: 5 }} />
        </View>
        <Text style={styles.lawyerCategory}>{lawyer.specialization}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{lawyer.rating} Ratings</Text>
        </View>
      </View>
    </View>
  );

  const renderConsultantType = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Consultant Type</Text>
      <View style={styles.consultantRow}>
        {consultantTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.consultantCard,
              consultantType === type.id && styles.consultantCardActive
            ]}
            onPress={() => setConsultantType(type.id)}
          >
            <View style={[
              styles.iconCircle,
              consultantType === type.id && styles.iconCircleActive
            ]}>
              <FontAwesome5
                name={type.icon}
                size={20}
                color={consultantType === type.id ? '#FFFFFF' : Theme.colors.primary}
              />
            </View>
            <Text style={[
              styles.consultantTitle,
              consultantType === type.id && styles.consultantTitleActive
            ]}>{type.title}</Text>
            <Text style={styles.consultantCaption}>{type.caption}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSelectDate = () => {
    const dates = generateDates();
    const rows = [];
    for (let i = 0; i < dates.length; i += 7) {
      const row = dates.slice(i, i + 7);
      // Pad the last row with empty items to ensure it has 7 columns
      while (row.length < 7) {
        row.push({ day: null, id: `pad-${row.length}-${i}` });
      }
      rows.push(row);
    }

    const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <View style={styles.calendarCard} {...panResponder.panHandlers}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth} disabled={isCurrentMonth}>
              <Ionicons 
                name="chevron-back" 
                size={20} 
                color={isCurrentMonth ? '#CCC' : Theme.colors.text} 
              />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={20} color={Theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.daysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <Text key={i} style={styles.dayInitial}>{day}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.calendarRow}>
                {row.map((dateItem, i) => (
                  <View key={dateItem.id} style={styles.dateContainer}>
                    <TouchableOpacity
                      disabled={!dateItem.day || dateItem.isPast}
                      style={[
                        styles.dateCircle,
                        dateItem.day && selectedFullDate.toDateString() === dateItem.fullDate?.toDateString() && styles.dateCircleActive,
                        dateItem.isPast && styles.dateDisabled,
                        dateItem.isClosed && { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', borderWidth: 1 },
                        dateItem.isFull && { backgroundColor: 'rgba(29, 80, 131, 0.12)', borderColor: 'rgba(29, 80, 131, 0.3)', borderWidth: 1 },
                        !dateItem.day && { borderColor: 'transparent', backgroundColor: 'transparent' }
                      ]}
                      onPress={() => {
                        setSelectedDate(dateItem.day);
                        setSelectedFullDate(dateItem.fullDate);
                      }}
                    >
                      {dateItem.day && (
                        <Text style={[
                          styles.dateText,
                          selectedFullDate.toDateString() === dateItem.fullDate?.toDateString() && styles.dateTextActive,
                          dateItem.isPast && styles.dateTextDisabled,
                          dateItem.isClosed && { color: '#D32F2F', fontFamily: Theme.fonts.bold },
                          dateItem.isFull && { color: Theme.colors.primary, fontFamily: Theme.fonts.bold }
                        ]}>{dateItem.day}</Text>
                      )}
                    </TouchableOpacity>

                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderAvailableSlots = () => {
    if (loadingAvailability) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
        </View>
      );
    }

    const dateStr = formatDateLocal(selectedFullDate);
    const isClosed = closedDates.includes(dateStr);
    
    if (isClosed) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={{ backgroundColor: '#FFF2F2', padding: 15, borderRadius: 10, alignItems: 'center' }}>
            <Ionicons name="lock-closed" size={24} color="#D32F2F" style={{ marginBottom: 5 }} />
            <Text style={{ fontFamily: Theme.fonts.bold, color: '#D32F2F', fontSize: 14 }}>Closed on this date</Text>
            <Text style={{ fontFamily: Theme.fonts.regular, color: '#666666', fontSize: 12, textAlign: 'center', marginTop: 2 }}>This lawyer is unavailable on this date. Please select another date.</Text>
          </View>
        </View>
      );
    }

    const activeSlots = getDynamicSlotsForDate(selectedFullDate);

    if (activeSlots.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={{ backgroundColor: '#F9FAFB', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}>
            <Ionicons name="calendar-outline" size={24} color="#9CA3AF" style={{ marginBottom: 5 }} />
            <Text style={{ fontFamily: Theme.fonts.bold, color: '#4B5563', fontSize: 14 }}>No slots available</Text>
            <Text style={{ fontFamily: Theme.fonts.regular, color: '#666666', fontSize: 12, textAlign: 'center', marginTop: 2 }}>All slots are booked or unavailable for this day.</Text>
          </View>
        </View>
      );
    }

    const morning = activeSlots.filter(s => s.includes('AM') && !s.startsWith('12'));
    const afternoon = activeSlots.filter(s => s.includes('PM') || s.startsWith('12'));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Slots</Text>
        
        {morning.length > 0 && (
          <>
            <Text style={styles.slotSubHeader}>Morning</Text>
            <View style={styles.slotsRow}>
              {morning.map((slot) => {
                const isBooked = isSlotBookedClient(slot, selectedFullDate);
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotButton,
                      selectedSlot === slot && styles.slotButtonActive,
                      isBooked && styles.slotButtonBooked
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                    disabled={isBooked}
                  >
                    <Text style={[
                      styles.slotText,
                      selectedSlot === slot && styles.slotTextActive,
                      isBooked && styles.slotTextBooked
                    ]}>{slot}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {afternoon.length > 0 && (
          <>
            <Text style={styles.slotSubHeader}>Afternoon</Text>
            <View style={styles.slotsRow}>
              {afternoon.map((slot) => {
                const isBooked = isSlotBookedClient(slot, selectedFullDate);
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotButton,
                      selectedSlot === slot && styles.slotButtonActive,
                      isBooked && styles.slotButtonBooked
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                    disabled={isBooked}
                  >
                    <Text style={[
                      styles.slotText,
                      selectedSlot === slot && styles.slotTextActive,
                      isBooked && styles.slotTextBooked
                    ]}>{slot}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>
    );
  };


  const renderCaseCategory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Case Category</Text>
      <View style={styles.categoriesRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              selectedCategory === cat && styles.categoryBtnActive
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.categoryBtnText,
              selectedCategory === cat && styles.categoryBtnTextActive
            ]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUploadDocument = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upload Document</Text>
      <View style={styles.uploadCard}>
        <MaterialCommunityIcons name="cloud-upload-outline" size={48} color={Theme.colors.primary} />
        <Text style={styles.uploadMainText}>Drag & Drop file here</Text>
        <Text style={styles.uploadCaptionText}>or browse your local storage</Text>
        <TouchableOpacity 
          style={[styles.selectFileBtn, uploadingDoc && { opacity: 0.7 }]} 
          onPress={handleUpload}
          disabled={uploadingDoc}
        >
          {uploadingDoc ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.selectFileBtnText}>Select File</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.alertCard}>
        <View style={styles.alertRow}>
          <Text style={styles.alertLabel}>Accepted Formats</Text>
          <Text style={styles.alertLabel}>Max Size</Text>
        </View>
        <View style={styles.alertRow}>
          <Text style={styles.alertValue}>PDF, DOCX, JPG, PNG</Text>
          <Text style={styles.alertValue}>20MB per file</Text>
        </View>
      </View>
    </View>
  );

  const renderRecentUploads = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Uploads</Text>
        <Text style={styles.fileCount}>{uploadedFiles.length} Files</Text>
      </View>
      {uploadedFiles.map((file) => (
        <View key={file.id} style={styles.fileCard}>
          <View style={styles.fileIconBox}>
            <MaterialCommunityIcons name="file-pdf-box" size={24} color={Theme.colors.primary} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{file.name}</Text>
            <Text style={styles.fileSize}>{file.size}</Text>
          </View>
          <TouchableOpacity onPress={() => removeFile(file.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderAdditionalNotes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Additional Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Type your notes here..."
        placeholderTextColor={Theme.colors.placeholder}
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
      />
    </View>
  );

  const renderPopup = () => (
    <Modal
      visible={showPopup}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPopup(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.successIconContainer}>
            <View style={styles.successIconBg}>
              <Ionicons name="checkmark-circle" size={80} color={Theme.colors.primary} />
            </View>
          </View>

          <ScrollView 
            style={{ width: '100%', maxHeight: height * 0.6 }} 
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalTitle}>Booking Pending</Text>
              <Text style={styles.modalCaption}>
                Your appointment with <Text style={{ fontFamily: Theme.fonts.bold }}>{lawyer.name}</Text> has been successfully scheduled.
              </Text>
            </View>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconBox}>
                <FontAwesome5 
                  name={consultantTypes.find(t => t.id === consultantType)?.icon || 'video'} 
                  size={16} 
                  color={Theme.colors.primary} 
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Meeting Method</Text>
                <Text style={styles.infoValue}>
                  {consultantType === 'Online' ? 'Secure Video Conference' : 
                   consultantType === 'Office' ? 'Office Visit' : 'Client Location Visit'}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconBox}>
                <FontAwesome5 name="gavel" size={16} color={Theme.colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Case Category</Text>
                <Text style={styles.infoValue}>{selectedCategory}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconBox}>
                <Ionicons name="calendar-outline" size={18} color={Theme.colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {selectedFullDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconBox}>
                <Ionicons name="time-outline" size={18} color={Theme.colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {selectedSlot} - {calculateEndTime(selectedSlot)} (EST)
                </Text>
              </View>
            </View>
          </View>

          {uploadedFiles.length > 0 && (
            <View style={styles.popupDocsSection}>
              <Text style={styles.popupDocsTitle}>Documents</Text>
              <View style={styles.popupDocsCard}>
                {uploadedFiles.map((file, index) => (
                  <View key={file.id} style={[
                    styles.popupDocItem, 
                    index !== uploadedFiles.length - 1 && styles.popupDocDivider
                  ]}>
                    <MaterialCommunityIcons name="file-document-outline" size={20} color={Theme.colors.primary} />
                    <Text style={styles.popupDocName} numberOfLines={1}>{file.name}</Text>
                    <Text style={styles.popupDocSize}>{file.size}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {notes ? (
            <View style={styles.clientNoteCard}>
              <Text style={styles.clientNoteTitle}>Client Note</Text>
              <Text style={styles.clientNoteText} numberOfLines={3}>{notes}</Text>
            </View>
          ) : null}
          </ScrollView>

          <TouchableOpacity 
            style={styles.viewBookingBtn}
            onPress={() => {
              setShowPopup(false);
              navigation.navigate('Home', { user: route.params?.user, activeRole: 'Client' }); // Pass user and role
            }}
          >
            <Text style={styles.viewBookingBtnText}>View to Booking Lawyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderLawyerCard()}
        {renderConsultantType()}
        {renderSelectDate()}
        {renderAvailableSlots()}
        {renderCaseCategory()}
        {renderUploadDocument()}
        {renderRecentUploads()}
        {renderAdditionalNotes()}
        
        <TouchableOpacity 
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]} 
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmBtnText}>
            {loading ? 'Processing...' : 'Confirm Schedule'}
          </Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
      {renderPopup()}
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
    fontFamily: Theme.fonts.regular,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  lawyerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  lawyerPhoto: {
    width: 90,
    height: 90,
    borderRadius: 15,
    marginRight: 15,
  },
  lawyerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lawyerName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    flexShrink: 1,
  },
  lawyerCategory: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
    marginLeft: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 15,
  },
  consultantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  consultantCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 60) / 3,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  consultantCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(29, 80, 131, 0.02)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleActive: {
    backgroundColor: Theme.colors.primary,
  },
  consultantTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  consultantTitleActive: {
    color: Theme.colors.primary,
  },
  consultantCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonth: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dayInitial: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
    opacity: 0.5,
  },
  datesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dateCircleActive: {
    backgroundColor: Theme.colors.primary,
  },
  dateText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  calendarGrid: {
    paddingTop: 5,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dateDisabled: {
    opacity: 0.3,
  },
  dateTextDisabled: {
    color: '#999',
  },
  slotSubHeader: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#888888',
    marginBottom: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  slotButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  slotButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  slotText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
  },
  slotTextActive: {
    color: '#FFFFFF',
  },
  slotButtonBooked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  slotTextBooked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryBtnText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
  },
  categoryBtnTextActive: {
    color: '#FFFFFF',
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
    marginBottom: 15,
  },
  uploadMainText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  uploadCaptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    marginBottom: 20,
  },
  selectFileBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  selectFileBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  alertCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(29, 80, 131, 0.1)',
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#888888',
  },
  alertValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  fileCount: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  fileIconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  fileSize: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    height: 120,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    textAlignVertical: 'top',
  },
  confirmBtn: {
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
  confirmBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: Theme.colors.primary,
    marginBottom: 10,
  },
  modalCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  infoList: {
    width: '100%',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  clientNoteCard: {
    width: '100%',
    backgroundColor: 'rgba(29, 80, 131, 0.08)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },
  clientNoteTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
    marginBottom: 5,
  },
  clientNoteText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
    lineHeight: 18,
  },
  viewBookingBtn: {
    backgroundColor: Theme.colors.primary,
    width: '100%',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewBookingBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  popupDocsSection: {
    width: '100%',
    marginBottom: 20,
  },
  popupDocsTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 10,
  },
  popupDocsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  popupDocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  popupDocDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  popupDocName: {
    flex: 1,
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
    marginLeft: 10,
  },
  popupDocSize: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: '#888888',
  },
});
