import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Theme } from '../theme';
import { MANAGE_AVAILABILITY_API_URL } from '../config';

const { width, height } = Dimensions.get('window');

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const minutesList = ['00', '15', '30', '45'];
const formatDateLocal = (date) => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};


export const ManageAvailabilityScreen = ({ navigation, route }) => {
  const [userData, setUserData] = useState(route?.params?.user || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Availability State
  const [workingHours, setWorkingHours] = useState([]);
  const [closedDates, setClosedDates] = useState([]);
  const [slotAvailabilities, setSlotAvailabilities] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);

  // Calendar State
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedFullDate, setSelectedFullDate] = useState(today);

  // Modals Visibility
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
  const [targetCloseDate, setTargetCloseDate] = useState(null);
  const [showAddHoursModal, setShowAddHoursModal] = useState(false);

  // Form State for Add Working Hours
  const [selectedDays, setSelectedDays] = useState([]);
  const [activeTimeField, setActiveTimeField] = useState('start'); // 'start' or 'end'
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endHour, setEndHour] = useState('05');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState('PM');


  // Swipe Gesture Handling for Calendar
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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        handlePrevMonth();
      } else if (gestureState.dx < -50) {
        handleNextMonth();
      }
    },
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        let user = userData;
        if (!user) {
          const userStr = await AsyncStorage.getItem('user');
          if (userStr) {
            user = JSON.parse(userStr);
            setUserData(user);
          }
        }
        if (user) {
          await fetchAvailability(user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const fetchAvailability = async (lawyerId) => {
    setLoading(true);
    try {
      const response = await fetch(`${MANAGE_AVAILABILITY_API_URL}?action=get_availability&lawyer_id=${lawyerId}`);
      const json = await response.json();
      if (json.status === 'success') {
        setWorkingHours(json.data.working_hours || []);
        setClosedDates(json.data.closed_dates || []);
        setSlotAvailabilities(json.data.slot_availabilities || []);
        setConfirmedBookings(json.data.confirmed_bookings || []);
      } else {
        Alert.alert('Error', json.message || 'Failed to fetch availability data.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Could not fetch availability from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllChanges = async () => {
    if (!userData) return;
    setSaving(true);
    try {
      const payload = {
        user_id: userData.id,
        working_hours: workingHours,
        closed_dates: closedDates,
        slot_availabilities: slotAvailabilities
      };

      const response = await fetch(`${MANAGE_AVAILABILITY_API_URL}?action=save_availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (json.status === 'success') {
        Alert.alert('Success', 'All changes have been successfully saved to the database!');
      } else {
        Alert.alert('Save Failed', json.message || 'An error occurred.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Failed to connect to the server.');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for matching working hours
  const dayMatchesRange = (dayRange, date) => {
    const dayIndex = date.getDay();
    const dayName = dayNames[dayIndex];
    const shortDayName = shortDayNames[dayIndex];
    const cleanRange = dayRange.trim().toLowerCase();

    if (cleanRange === 'mon - fri') {
      return dayIndex >= 1 && dayIndex <= 5;
    }
    if (cleanRange === 'sat - sun') {
      return dayIndex === 0 || dayIndex === 6;
    }
    if (cleanRange === 'mon - sat') {
      return dayIndex >= 1 && dayIndex <= 6;
    }

    if (cleanRange.includes(dayName.toLowerCase()) || cleanRange.includes(shortDayName.toLowerCase())) {
      return true;
    }

    if (cleanRange.includes('-')) {
      const parts = cleanRange.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const getDayIndex = (str) => {
          const s = str.toLowerCase();
          for (let i = 0; i < 7; i++) {
            if (dayNames[i].toLowerCase().startsWith(s) || shortDayNames[i].toLowerCase().startsWith(s)) {
              return i;
            }
          }
          return -1;
        };

        const startIndex = getDayIndex(parts[0]);
        const endIndex = getDayIndex(parts[1]);

        if (startIndex !== -1 && endIndex !== -1) {
          if (startIndex <= endIndex) {
            return dayIndex >= startIndex && dayIndex <= endIndex;
          } else {
            return dayIndex >= startIndex || dayIndex <= endIndex;
          }
        }
      }
    }

    return false;
  };

  const parseTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes) => {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    
    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }
    
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

  // Scroll wheel references
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  const itemHeight = 40;

  const handleHourScrollEnd = (e) => {
    const yOffset = e.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / itemHeight);
    const clampedIndex = Math.max(0, Math.min(hoursList.length - 1, index));
    const selected = hoursList[clampedIndex];
    handleHourChange(selected);
  };

  const handleMinuteScrollEnd = (e) => {
    const yOffset = e.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / itemHeight);
    const clampedIndex = Math.max(0, Math.min(minutesList.length - 1, index));
    const selected = minutesList[clampedIndex];
    handleMinuteChange(selected);
  };

  useEffect(() => {
    if (showAddHoursModal) {
      const hIdx = hoursList.indexOf(activeHour);
      const mIdx = minutesList.indexOf(activeMinute);
      setTimeout(() => {
        hourScrollRef.current?.scrollTo({ y: hIdx * itemHeight, animated: true });
        minuteScrollRef.current?.scrollTo({ y: mIdx * itemHeight, animated: true });
      }, 120);
    }
  }, [activeTimeField, activeHour, activeMinute, showAddHoursModal]);

  const activeHour = activeTimeField === 'start' ? startHour : endHour;
  const activeMinute = activeTimeField === 'start' ? startMinute : endMinute;
  const activePeriod = activeTimeField === 'start' ? startPeriod : endPeriod;

  const handleHourChange = (newHour) => {
    if (activeTimeField === 'start') setStartHour(newHour);
    else setEndHour(newHour);
  };

  const handleMinuteChange = (newMinute) => {
    if (activeTimeField === 'start') setStartMinute(newMinute);
    else setEndMinute(newMinute);
  };

  const handlePeriodChange = (newPeriod) => {
    if (activeTimeField === 'start') setStartPeriod(newPeriod);
    else setEndPeriod(newPeriod);
  };

  const rotateHourUp = () => {
    const idx = hoursList.indexOf(activeHour);
    const newIdx = (idx - 1 + 12) % 12;
    handleHourChange(hoursList[newIdx]);
  };

  const rotateHourDown = () => {
    const idx = hoursList.indexOf(activeHour);
    const newIdx = (idx + 1) % 12;
    handleHourChange(hoursList[newIdx]);
  };

  const rotateMinuteUp = () => {
    const idx = minutesList.indexOf(activeMinute);
    const newIdx = (idx - 1 + 4) % 4;
    handleMinuteChange(minutesList[newIdx]);
  };

  const rotateMinuteDown = () => {
    const idx = minutesList.indexOf(activeMinute);
    const newIdx = (idx + 1) % 4;
    handleMinuteChange(minutesList[newIdx]);
  };

  const handleDayTap = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleDayLongPress = (day) => {
    const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (selectedDays.length > 0) {
      const firstSelected = selectedDays[0];
      const idx1 = daysList.indexOf(firstSelected);
      const idx2 = daysList.indexOf(day);
      if (idx1 !== -1 && idx2 !== -1) {
        const start = Math.min(idx1, idx2);
        const end = Math.max(idx1, idx2);
        setSelectedDays(daysList.slice(start, end + 1));
        return;
      }
    }
    setSelectedDays([day]);
  };


  // Generate Available Slots for Selected Date based on Working Hours
  const getGeneratedSlotsForDate = (date) => {
    const dateStr = formatDateLocal(date);
    if (closedDates.includes(dateStr)) {
      return [];
    }

    let allSlots = [];
    workingHours.forEach(wh => {
      if (dayMatchesRange(wh.day_range, date)) {
        const slots = generateSlotsForHours(wh.start_time, wh.end_time);
        allSlots = [...allSlots, ...slots];
      }
    });

    // Remove duplicates
    return [...new Set(allSlots)];
  };

  const activeSlots = getGeneratedSlotsForDate(selectedFullDate);

  const isSlotCheckedForDate = (slotTime, date) => {
    if (!date) return false;
    const dateStr = formatDateLocal(date);
    const override = slotAvailabilities.find(sa => sa.slot_date === dateStr && sa.slot_time === slotTime);
    if (override) {
      return override.is_available === 1;
    }
    return true; // default available
  };

  // Handle checking/unchecking a slot
  const isSlotChecked = (slotTime) => {
    return isSlotCheckedForDate(slotTime, selectedFullDate);
  };

  const isSlotBookedConfirmed = (slotTime) => {
    const dateStr = formatDateLocal(selectedFullDate);
    return confirmedBookings.some(b => b.booking_date === dateStr && b.booking_time?.trim() === slotTime?.trim());
  };

  const isDateFullyBooked = (date) => {
    if (!date) return false;
    const dateStr = formatDateLocal(date);
    const slots = getGeneratedSlotsForDate(date);
    if (slots.length === 0) return false;

    return slots.every(slot => {
      const isUnchecked = !isSlotCheckedForDate(slot, date);
      const isBooked = confirmedBookings.some(b => b.booking_date === dateStr && b.booking_time?.trim() === slot?.trim());
      return isUnchecked || isBooked;
    });
  };

  const toggleSlotCheckbox = (slotTime) => {
    const dateStr = formatDateLocal(selectedFullDate);
    const existingIndex = slotAvailabilities.findIndex(sa => sa.slot_date === dateStr && sa.slot_time === slotTime);
    
    if (existingIndex !== -1) {
      const updated = [...slotAvailabilities];
      updated[existingIndex].is_available = updated[existingIndex].is_available === 1 ? 0 : 1;
      setSlotAvailabilities(updated);
    } else {
      setSlotAvailabilities([
        ...slotAvailabilities,
        { slot_date: dateStr, slot_time: slotTime, is_available: 0 } // toggle to false (since default was true)
      ]);
    }
  };

  // Calendar rendering helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateDates = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const dates = [];
    for (let i = 0; i < firstDay; i++) {
      dates.push({ day: null, id: `empty-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      dates.push({
        day: i,
        isPast: dateObj < today,
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

  // Calendar actions
  const handleDatePress = (dateObj) => {
    setSelectedFullDate(dateObj);
  };

  const handleDateLongPress = (dateObj) => {
    setTargetCloseDate(dateObj);
    setShowCloseConfirmModal(true);
  };

  const confirmCloseDate = () => {
    if (!targetCloseDate) return;
    const dateStr = formatDateLocal(targetCloseDate);
    
    if (closedDates.includes(dateStr)) {
      // Reopen
      setClosedDates(closedDates.filter(d => d !== dateStr));
    } else {
      // Set to Close
      setClosedDates([...closedDates, dateStr]);
    }
    setShowCloseConfirmModal(false);
    setTargetCloseDate(null);
  };

  // Working Hours action
  const handleDeleteWorkingHours = (idToDelete) => {
    setWorkingHours(workingHours.filter(wh => wh.id !== idToDelete));
  };

  const formatSelectedDays = (days) => {
    if (days.length === 0) return '';
    const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sorted = [...days].sort((a, b) => daysList.indexOf(a) - daysList.indexOf(b));
    
    let consecutive = true;
    for (let i = 0; i < sorted.length - 1; i++) {
      const idx1 = daysList.indexOf(sorted[i]);
      const idx2 = daysList.indexOf(sorted[i + 1]);
      if (idx2 - idx1 !== 1) {
        consecutive = false;
        break;
      }
    }
    
    if (consecutive && sorted.length > 1) {
      return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
    } else {
      return sorted.join(', ');
    }
  };

  const handleAddWorkingHoursSubmit = () => {
    if (selectedDays.length === 0) {
      Alert.alert('Selection Error', 'Please select at least one day.');
      return;
    }

    const start_time = `${startHour}:${startMinute} ${startPeriod}`;
    const end_time = `${endHour}:${endMinute} ${endPeriod}`;
    
    // Quick validation
    const startMinutes = parseTimeToMinutes(start_time);
    const endMinutes = parseTimeToMinutes(end_time);

    if (startMinutes >= endMinutes) {
      Alert.alert('Invalid Time Range', 'End time must be after start time.');
      return;
    }

    const day_range = formatSelectedDays(selectedDays);

    const newWh = {
      id: `new-${Date.now()}`,
      day_range: day_range,
      start_time: start_time,
      end_time: end_time
    };

    setWorkingHours([...workingHours, newWh]);
    setShowAddHoursModal(false);
    
    // Reset state defaults
    setSelectedDays([]);
    setStartHour('09');
    setStartMinute('00');
    setStartPeriod('AM');
    setEndHour('05');
    setEndMinute('00');
    setEndPeriod('PM');
    setActiveTimeField('start');
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading availability details...</Text>
      </View>
    );
  }

  // Generate calendar rows
  const dates = generateDates();
  const rows = [];
  for (let i = 0; i < dates.length; i += 7) {
    const row = dates.slice(i, i + 7);
    while (row.length < 7) {
      row.push({ day: null, id: `pad-${row.length}-${i}` });
    }
    rows.push(row);
  }

  const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Availability</Text>
        <TouchableOpacity onPress={() => setShowHelpModal(true)} style={styles.headerIcon}>
          <Ionicons name="help-circle-outline" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SECTION 1: SELECT DATE */}
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
                  {row.map((dateItem, i) => {
                    const isSelected = dateItem.day && selectedFullDate.toDateString() === dateItem.fullDate?.toDateString();
                    const dateStr = formatDateLocal(dateItem.fullDate);
                    const isClosed = dateItem.day && closedDates.includes(dateStr);
                    const isFull = dateItem.day && isDateFullyBooked(dateItem.fullDate);
                    
                    return (
                      <View key={dateItem.id} style={styles.dateContainer}>
                        <TouchableOpacity
                          disabled={!dateItem.day || dateItem.isPast}
                          style={[
                            styles.dateCircle,
                            isSelected && styles.dateCircleActive,
                            dateItem.isPast && styles.dateDisabled,
                            isClosed && styles.dateCircleClosed,
                            isFull && styles.dateCircleFull,
                            !dateItem.day && { borderColor: 'transparent', backgroundColor: 'transparent' }
                          ]}
                          onPress={() => handleDatePress(dateItem.fullDate)}
                          onLongPress={() => handleDateLongPress(dateItem.fullDate)}
                          delayLongPress={1000}
                        >
                          {dateItem.day && (
                            <View style={{ alignItems: 'center' }}>
                              <Text style={[
                                styles.dateText,
                                isSelected && styles.dateTextActive,
                                isClosed && styles.dateTextClosed,
                                isFull && styles.dateTextFull,
                                dateItem.isPast && styles.dateTextDisabled
                              ]}>{dateItem.day}</Text>
                              {isClosed && <View style={styles.closedIndicatorDot} />}
                              {isFull && <View style={styles.fullIndicatorDot} />}
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* SECTION 2: WORKING HOURS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          
          {workingHours.length === 0 ? (
            <View style={styles.emptyHoursCard}>
              <MaterialCommunityIcons name="calendar-clock" size={40} color="#CCCCCC" />
              <Text style={styles.emptyHoursText}>No working hours configured yet.</Text>
            </View>
          ) : (
            workingHours.map((wh) => (
              <View key={wh.id} style={styles.whCard}>
                <Text style={styles.whDayText}>{wh.day_range}</Text>
                <Text style={styles.whTimeText}>{wh.start_time} - {wh.end_time}</Text>
                 <TouchableOpacity onPress={() => handleDeleteWorkingHours(wh.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color={Theme.colors.primary} />
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addWhButton} onPress={() => setShowAddHoursModal(true)}>
            <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.addWhButtonText}>Add Working Hours</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 3: AVAILABLE SLOTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          
          {closedDates.includes(formatDateLocal(selectedFullDate)) ? (
            <View style={styles.closedDayCard}>
              <Ionicons name="lock-closed" size={32} color={Theme.colors.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.closedDayText}>This date is set to CLOSED.</Text>
              <Text style={styles.closedDaySub}>Clients cannot book appointments on closed dates.</Text>
            </View>
          ) : activeSlots.length === 0 ? (
            <View style={styles.emptySlotsCard}>
              <FontAwesome5 name="clock" size={32} color="#CCCCCC" style={{ marginBottom: 8 }} />
              <Text style={styles.emptySlotsText}>No slots generated for this day.</Text>
              <Text style={styles.emptySlotsSub}>Ensure you have configured Working Hours that apply to this day of the week.</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {activeSlots.map((slot) => {
                const checked = isSlotChecked(slot);
                const isBooked = isSlotBookedConfirmed(slot);
                return (
                  <TouchableOpacity 
                    key={slot} 
                    style={[
                      styles.slotCard, 
                      !checked && styles.slotCardUnchecked,
                      isBooked && styles.slotCardBooked
                    ]}
                    onPress={() => toggleSlotCheckbox(slot)}
                    disabled={isBooked}
                  >
                    <View style={styles.slotTextCol}>
                      <Text style={[
                        styles.slotValText, 
                        !checked && styles.slotValTextUnchecked,
                        isBooked && styles.slotValTextBooked
                      ]}>{slot}</Text>
                    </View>
                    {isBooked ? (
                      <View style={styles.bookedBadge}>
                        <Ionicons name="lock-closed" size={12} color="#888888" style={{ marginRight: 2 }} />
                        <Text style={styles.bookedBadgeText}>Booked</Text>
                      </View>
                    ) : (
                      <View style={[styles.circleCheckbox, checked && styles.circleCheckboxChecked]}>
                        {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

        </View>

        {/* SAVE CHANGES BUTTON */}
        <TouchableOpacity 
          style={[styles.saveAllButton, saving && { opacity: 0.8 }]} 
          onPress={handleSaveAllChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveAllButtonText}>Save All Change</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* MODAL: HELP CENTER */}
      <Modal visible={showHelpModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.helpModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Guidance Center</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} color={Theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}><Text style={styles.guideStepNumText}>1</Text></View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Select Date & Long Press to Close</Text>
                  <Text style={styles.guideStepDesc}>Tap a date to view and manage its available booking slots. To close off a date entirely (such as holidays or leaves), hold down your finger on that date for 2 seconds. Tap "Yes" in the popup to set it as Closed.</Text>
                </View>
              </View>
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}><Text style={styles.guideStepNumText}>2</Text></View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Configure Working Hours</Text>
                  <Text style={styles.guideStepDesc}>Add your dynamic business hours by clicking "Add Working Hours". You can specify day ranges like "Mon - Fri" or set custom single-day schedules. Delete obsolete configs using the red trash icon.</Text>
                </View>
              </View>
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}><Text style={styles.guideStepNumText}>3</Text></View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Customize Hourly Slots</Text>
                  <Text style={styles.guideStepDesc}>Hourly booking slots are auto-generated from your working hours for the selected date. Uncheck specific hours (using the circular buttons) if you are busy or want to block them for clients.</Text>
                </View>
              </View>
              <View style={styles.guideStep}>
                <View style={styles.guideStepNumber}><Text style={styles.guideStepNumText}>4</Text></View>
                <View style={styles.guideStepContent}>
                  <Text style={styles.guideStepTitle}>Commit Changes</Text>
                  <Text style={styles.guideStepDesc}>Do not forget to click the "Save All Change" button at the bottom to write all schedules, toggles, and closed dates into the database.</Text>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.guideCloseBtn} onPress={() => setShowHelpModal(false)}>
              <Text style={styles.guideCloseBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: SET TO CLOSE CONFIRMATION */}
      <Modal visible={showCloseConfirmModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.warningIconBg}>
              <Ionicons name="warning-outline" size={40} color="#FF9800" />
            </View>
            <Text style={styles.confirmTitle}>
              {targetCloseDate && closedDates.includes(formatDateLocal(targetCloseDate)) 
                ? 'Set to Open?' 
                : 'Set to Close?'
              }
            </Text>
            <Text style={styles.confirmDesc}>
              {targetCloseDate && closedDates.includes(formatDateLocal(targetCloseDate))
                ? `Are you sure you want to REOPEN and activate bookings on ${targetCloseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}?`
                : `Are you sure you want to CLOSE off ${targetCloseDate ? targetCloseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}? Clients will not be able to book any appointments on this date.`
              }
            </Text>
            <View style={styles.confirmRowBtn}>
              <TouchableOpacity style={styles.confirmBtnNo} onPress={() => { setShowCloseConfirmModal(false); setTargetCloseDate(null); }}>
                <Text style={styles.confirmBtnNoText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtnYes} onPress={confirmCloseDate}>
                <Text style={styles.confirmBtnYesText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD WORKING HOURS */}
      <Modal visible={showAddHoursModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addHoursContent}>
            <Text style={styles.addHoursTitle}>Add Working Hours</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Day Selection */}
              <Text style={styles.formLabel}>Select Day</Text>
              <View style={styles.dayGrid}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <TouchableOpacity 
                      key={day} 
                      style={[styles.dayGridBadge, isSelected && styles.dayGridBadgeActive]}
                      onPress={() => handleDayTap(day)}
                      onLongPress={() => handleDayLongPress(day)}
                      delayLongPress={1000}
                    >
                      <Text style={[styles.dayGridBadgeText, isSelected && styles.dayGridBadgeTextActive]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Time Configuration Section */}
              <Text style={styles.formLabel}>Time Selector</Text>
              
              {/* Active Field Banner Display */}
              <View style={styles.timeBannerRow}>
                <TouchableOpacity 
                  style={[styles.timeBannerCard, activeTimeField === 'start' && styles.timeBannerCardActive]}
                  onPress={() => setActiveTimeField('start')}
                >
                  <Text style={styles.timeBannerCardLabel}>START TIME</Text>
                  <Text style={[styles.timeBannerCardVal, activeTimeField === 'start' && styles.timeBannerCardValActive]}>
                    {startHour}:{startMinute} {startPeriod}
                  </Text>
                </TouchableOpacity>

                <View style={{ width: 20 }} />

                <TouchableOpacity 
                  style={[styles.timeBannerCard, activeTimeField === 'end' && styles.timeBannerCardActive]}
                  onPress={() => setActiveTimeField('end')}
                >
                  <Text style={styles.timeBannerCardLabel}>END TIME</Text>
                  <Text style={[styles.timeBannerCardVal, activeTimeField === 'end' && styles.timeBannerCardValActive]}>
                    {endHour}:{endMinute} {endPeriod}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Infinite Spinning Wheel Picker */}
              <View style={styles.spinningClockContainer}>
                {/* Hour wheel column */}
                <View style={styles.dialColumn}>
                  <TouchableOpacity onPress={rotateHourUp} style={styles.dialArrow}>
                    <Ionicons name="chevron-up" size={24} color={Theme.colors.primary} />
                  </TouchableOpacity>
                  
                  <View style={styles.dialDisplayWindow}>
                    <ScrollView
                      ref={hourScrollRef}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={itemHeight}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handleHourScrollEnd}
                      nestedScrollEnabled={true}
                      contentContainerStyle={{
                        paddingVertical: 40,
                      }}
                    >
                      {hoursList.map((h) => {
                        const isSelected = h === activeHour;
                        return (
                          <TouchableOpacity 
                            key={h} 
                            style={[styles.scrollDialItem, isSelected && styles.scrollDialItemActive]} 
                            onPress={() => handleHourChange(h)}
                          >
                            <Text style={[styles.scrollDialText, isSelected && styles.scrollDialTextActive]}>
                              {h}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <TouchableOpacity onPress={rotateHourDown} style={styles.dialArrow}>
                    <Ionicons name="chevron-down" size={24} color={Theme.colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Colon separator */}
                <Text style={styles.dialColon}>:</Text>

                {/* Minute wheel column */}
                <View style={styles.dialColumn}>
                  <TouchableOpacity onPress={rotateMinuteUp} style={styles.dialArrow}>
                    <Ionicons name="chevron-up" size={24} color={Theme.colors.primary} />
                  </TouchableOpacity>
                  
                  <View style={styles.dialDisplayWindow}>
                    <ScrollView
                      ref={minuteScrollRef}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={itemHeight}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handleMinuteScrollEnd}
                      nestedScrollEnabled={true}
                      contentContainerStyle={{
                        paddingVertical: 40,
                      }}
                    >
                      {minutesList.map((m) => {
                        const isSelected = m === activeMinute;
                        return (
                          <TouchableOpacity 
                            key={m} 
                            style={[styles.scrollDialItem, isSelected && styles.scrollDialItemActive]} 
                            onPress={() => handleMinuteChange(m)}
                          >
                            <Text style={[styles.scrollDialText, isSelected && styles.scrollDialTextActive]}>
                              {m}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <TouchableOpacity onPress={rotateMinuteDown} style={styles.dialArrow}>
                    <Ionicons name="chevron-down" size={24} color={Theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* AM/PM Button Toggles Below Clock */}
              <View style={styles.ampmBelowClockRow}>
                <TouchableOpacity 
                  style={[styles.ampmBelowBtn, activePeriod === 'AM' && styles.ampmBelowBtnActive]} 
                  onPress={() => handlePeriodChange('AM')}
                >
                  <Text style={[styles.ampmBelowBtnText, activePeriod === 'AM' && styles.ampmBelowBtnTextActive]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.ampmBelowBtn, activePeriod === 'PM' && styles.ampmBelowBtnActive]} 
                  onPress={() => handlePeriodChange('PM')}
                >
                  <Text style={[styles.ampmBelowBtnText, activePeriod === 'PM' && styles.ampmBelowBtnTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.formRowButtons}>
              <TouchableOpacity style={styles.formCancelBtn} onPress={() => setShowAddHoursModal(false)}>
                <Text style={styles.formCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.formSubmitBtn} onPress={handleAddWorkingHoursSubmit}>
                <Text style={styles.formSubmitBtnText}>Add Hours</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: '#888888',
    marginTop: 12,
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
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 15,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarMonth: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayInitial: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#888888',
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    marginTop: 5,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dateContainer: {
    width: (width - 70) / 7,
    alignItems: 'center',
  },
  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateCircleActive: {
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  dateCircleClosed: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    borderWidth: 1,
  },
  dateCircleFull: {
    backgroundColor: 'rgba(29, 80, 131, 0.12)',
    borderColor: 'rgba(29, 80, 131, 0.3)',
    borderWidth: 1,
  },
  dateDisabled: {
    opacity: 0.3,
  },
  dateText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  dateTextActive: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
  },
  dateTextClosed: {
    color: '#D32F2F',
    fontFamily: Theme.fonts.bold,
  },
  dateTextFull: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.bold,
  },
  dateTextDisabled: {
    color: '#CCCCCC',
  },
  closedIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D32F2F',
    marginTop: 1,
  },
  fullIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
    marginTop: 1,
  },

  // Working Hours styling
  whCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  whDayText: {
    flex: 1.2,
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#000000',
  },
  whTimeText: {
    flex: 2,
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyHoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  emptyHoursText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 10,
  },
  addWhButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    borderRadius: 15,
    height: 50,
    marginTop: 5,
  },
  addWhButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  // Available Slots styling
  closedDayCard: {
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(29, 80, 131, 0.2)',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedDayText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  closedDaySub: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
  },
  emptySlotsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  emptySlotsText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  emptySlotsSub: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 15,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 50) / 2,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  slotCardUnchecked: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  slotCardBooked: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.8,
  },
  slotValTextBooked: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bookedBadgeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 10,
    color: '#6B7280',
  },
  slotTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  slotValText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  slotValTextUnchecked: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  circleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCheckboxChecked: {
    backgroundColor: Theme.colors.primary,
  },

  // Save All Changes Button
  saveAllButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 15,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveAllButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helpModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 15,
    marginBottom: 15,
  },
  modalHeaderTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
  },
  modalScrollBody: {
    marginBottom: 15,
  },
  guideStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  guideStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  guideStepNumText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  guideStepContent: {
    flex: 1,
  },
  guideStepTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  guideStepDesc: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  guideCloseBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 15,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideCloseBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },

  // Confirm Modal styling
  confirmModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '85%',
    padding: 24,
    alignItems: 'center',
  },
  warningIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  confirmTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  confirmDesc: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmRowBtn: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  confirmBtnNo: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  confirmBtnNoText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#4B5563',
  },
  confirmBtnYes: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  confirmBtnYesText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Add Hours Modal styling
  addHoursContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '96%',
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 20,
  },
  addHoursTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  formLabel: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 10,
    marginTop: 10,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 5,
    marginBottom: 5,
  },
  dayGridBadge: {
    width: (width - 100) / 4,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  dayGridBadgeActive: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    borderColor: Theme.colors.primary,
  },
  dayGridBadgeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: '#4B5563',
  },
  dayGridBadgeTextActive: {
    color: Theme.colors.primary,
  },
  timeBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeBannerCard: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  timeBannerCardActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(29, 80, 131, 0.05)',
  },
  timeBannerCardLabel: {
    fontFamily: Theme.fonts.bold,
    fontSize: 10,
    color: '#888888',
    marginBottom: 4,
  },
  timeBannerCardVal: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  timeBannerCardValActive: {
    color: Theme.colors.primary,
  },
  spinningClockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 15,
    alignSelf: 'center',
    width: '80%',
  },
  dialColumn: {
    alignItems: 'center',
    width: 60,
  },
  dialArrow: {
    padding: 4,
  },
  dialDisplayWindow: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollDialItem: {
    height: 40,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.35,
    marginVertical: 4,
  },
  scrollDialItemActive: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 10,
    opacity: 1,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollDialText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    color: Theme.colors.text,
  },
  scrollDialTextActive: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  dialColon: {
    fontFamily: Theme.fonts.bold,
    fontSize: 28,
    color: Theme.colors.primary,
    marginHorizontal: 15,
    alignSelf: 'center',
    paddingBottom: 4,
  },
  ampmBelowClockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  ampmBelowBtn: {
    width: 60,
    height: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  ampmBelowBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  ampmBelowBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: '#4B5563',
  },
  ampmBelowBtnTextActive: {
    color: '#FFFFFF',
  },
  toggleFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 80, 131, 0.08)',
    marginBottom: 15,
  },
  toggleFieldBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  formRowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  formCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  formCancelBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#4B5563',
  },
  formSubmitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  formSubmitBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
