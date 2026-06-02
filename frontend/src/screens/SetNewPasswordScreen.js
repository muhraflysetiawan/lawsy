import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Theme } from '../theme';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { HeaderSection } from '../components/HeaderSection';

const { height } = Dimensions.get('window');

export const SetNewPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    Alert.alert('Success', 'Password has been reset!', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background-login.webp')}
        style={styles.backgroundImage}
      >
        <HeaderSection
          title="Set New Password"
          caption="Kindly enter your new password below to continue the account recovery process."
        />

        <View style={styles.card}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.cardScrollContent}
            bounces={false}
          >
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Inputs with Labels */}
            <CustomInput
              label="New Password"
              placeholder="Enter new password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <CustomInput
              label="Confirm Password"
              placeholder="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Reset Password Button */}
            <CustomButton
              title="Reset Password"
              onPress={handleResetPassword}
              style={{ marginTop: Theme.spacing.near }}
            />
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: Theme.colors.secondary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 20,
    paddingHorizontal: Theme.spacing.medium,
    paddingTop: Theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  cardScrollContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  errorText: {
    color: '#FF0000',
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: Theme.spacing.near,
  },
});
