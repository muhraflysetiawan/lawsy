import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { SetNewPasswordScreen } from './src/screens/SetNewPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ManageProfileScreen } from './src/screens/ManageProfileScreen';
import { PasswordSecurityScreen } from './src/screens/PasswordSecurityScreen';
import { ChangePasswordScreen } from './src/screens/ChangePasswordScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './src/screens/TermsOfServiceScreen';
import { HelpCenterScreen } from './src/screens/HelpCenterScreen';
import { AboutUsScreen } from './src/screens/AboutUsScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { LawyerRegistrationStep1 } from './src/screens/LawyerRegistrationStep1';
import { LawyerRegistrationStep2 } from './src/screens/LawyerRegistrationStep2';
import { LawyerRegistrationStep3 } from './src/screens/LawyerRegistrationStep3';
import { LawyerRegistrationSummary } from './src/screens/LawyerRegistrationSummary';
import { VerificationPendingScreen } from './src/screens/VerificationPendingScreen';
import { AdminRegistrationRequests } from './src/screens/AdminRegistrationRequests';
import { LawyerInformationScreen } from './src/screens/LawyerInformationScreen';
import { AboutLawyerScreen } from './src/screens/AboutLawyerScreen';
import { FindLawyerScreen } from './src/screens/FindLawyerScreen';
import { BookingLawyerScreen } from './src/screens/BookingLawyerScreen';
import { DetailBookingScreen } from './src/screens/DetailBookingScreen';
import { HistoryBookingScreen } from './src/screens/HistoryBookingScreen';
import { ManageAvailabilityScreen } from './src/screens/ManageAvailabilityScreen';
import { CreateCaseScreen } from './src/screens/CreateCaseScreen';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatRoomScreen } from './src/screens/ChatRoomScreen';
import { LawsyAIScreen } from './src/screens/LawsyAIScreen';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { CallScreen } from './src/screens/CallScreen';
import { DocumentGeneratorScreen } from './src/screens/DocumentGeneratorScreen';
import { LegalDictionaryScreen } from './src/screens/LegalDictionaryScreen';
import { LawInsightScreen } from './src/screens/LawInsightScreen';
import { DetailInsightScreen } from './src/screens/DetailInsightScreen';
import { LawyerScreen } from './src/screens/LawyerScreen';






import { ActivityIndicator, View, StatusBar, Platform } from 'react-native';

import { Theme } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="SetNewPassword" component={SetNewPasswordScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ManageProfile" component={ManageProfileScreen} />
          <Stack.Screen name="PasswordSecurity" component={PasswordSecurityScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="LawyerRegistrationStep1" component={LawyerRegistrationStep1} />
          <Stack.Screen name="LawyerRegistrationStep2" component={LawyerRegistrationStep2} />
          <Stack.Screen name="LawyerRegistrationStep3" component={LawyerRegistrationStep3} />
          <Stack.Screen name="LawyerRegistrationSummary" component={LawyerRegistrationSummary} />
          <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
          <Stack.Screen name="AdminRequests" component={AdminRegistrationRequests} />
          <Stack.Screen name="LawyerInformation" component={LawyerInformationScreen} />
          <Stack.Screen name="AboutLawyer" component={AboutLawyerScreen} />
          <Stack.Screen name="FindLawyer" component={FindLawyerScreen} />
          <Stack.Screen name="BookingLawyer" component={BookingLawyerScreen} />
          <Stack.Screen name="DetailBooking" component={DetailBookingScreen} />
          <Stack.Screen name="HistoryBooking" component={HistoryBookingScreen} />
          <Stack.Screen name="ManageAvailability" component={ManageAvailabilityScreen} />
          <Stack.Screen name="CreateCase" component={CreateCaseScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          <Stack.Screen name="LawsyAI" component={LawsyAIScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Call" component={CallScreen} />
          <Stack.Screen name="DocumentGenerator" component={DocumentGeneratorScreen} />
          <Stack.Screen name="LegalDictionary" component={LegalDictionaryScreen} />
          <Stack.Screen name="LawInsight" component={LawInsightScreen} />
          <Stack.Screen name="DetailInsight" component={DetailInsightScreen} />
          <Stack.Screen name="Lawyer" component={LawyerScreen} />
        </Stack.Navigator>






      </NavigationContainer>
    </View>
  );
}
