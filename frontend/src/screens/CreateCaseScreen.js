import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { CREATE_CASE_API_URL, MANAGE_BOOKING_API_URL } from '../config';

export const CreateCaseScreen = ({ navigation, route }) => {
  const { booking } = route.params;
  const [caseName, setCaseName] = useState('');
  const [category, setCategory] = useState('Small');
  const [estimatedCosts, setEstimatedCosts] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    const base = parseFloat(estimatedCosts) || 0;
    const serviceFee = 2000;
    const subtotal = base + serviceFee;
    const tax = subtotal * 0.11;
    return subtotal + tax;
  };

  const handleSend = async () => {
    if (!caseName || !estimatedCosts) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(CREATE_CASE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          client_id: booking.user_id,
          lawyer_id: booking.lawyer_id,
          case_name: caseName,
          category: category,
          estimated_costs: parseFloat(estimatedCosts),
          notes_for_client: notes,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert("Success", "Case created and payment request sent to client.", [
          { text: "OK", onPress: () => navigation.navigate('HistoryBooking', { activeRole: 'Lawyer' }) }
        ]);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(MANAGE_BOOKING_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: booking.id,
                  status: 'canceled',
                }),
              });
              const result = await response.json();
              if (result.status === 'success') {
                navigation.navigate('HistoryBooking', { activeRole: 'Lawyer' });
              } else {
                Alert.alert("Error", result.message);
              }
            } catch (error) {
              console.error(error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Case</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="help-circle-outline" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.alertCard}>
          <Text style={styles.alertText}>
            Complete your case details to begin the professional legal assistance process.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: '#F8F9FA' }]}>
            <TextInput
              style={styles.input}
              value={booking.client_name}
              editable={false}
              placeholderTextColor={Theme.colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Case Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={caseName}
              onChangeText={setCaseName}
              placeholder="Enter case name"
              placeholderTextColor={Theme.colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryPickerContainer}>
            {['Small', 'Medium', 'High'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.categoryOptionActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryOptionText,
                  category === cat && styles.categoryOptionTextActive
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Estimated Costs</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencyPrefix}>Rp</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={estimatedCosts}
              onChangeText={setEstimatedCosts}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={Theme.colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Notes for Client (optional)</Text>
          <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start' }]}>
            <TextInput
              style={[styles.input, { height: '100%', textAlignVertical: 'top', paddingTop: 12 }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter notes for client"
              multiline
              placeholderTextColor={Theme.colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Costs Proposed</Text>
          <Text style={styles.totalValue}>
            Rp{Math.round(calculateTotal()).toLocaleString('id-ID')}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.sendBtn} 
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendBtnText}>Send</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  alertCard: {
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  alertText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.primary,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  currencyPrefix: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    marginRight: 5,
  },
  categoryPickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  categoryOptionActive: {
    backgroundColor: Theme.colors.primary,
  },
  categoryOptionText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  categoryOptionTextActive: {
    color: '#FFFFFF',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  totalValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  sendBtn: {
    backgroundColor: Theme.colors.primary,
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelBtnText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: '#888888',
  },
});
