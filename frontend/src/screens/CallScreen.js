import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  PermissionsAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { Theme } from '../theme';
import { CALL_API_URL } from '../config';

// Import WebView dynamically based on platform
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export const CallScreen = ({ navigation, route }) => {
  const { role, bookingId, user, otherUser, callId } = route.params;

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callStatus, setCallStatus] = useState('Connecting...'); // Connecting..., Ringing..., Active, Ended
  const [seconds, setSeconds] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(route.params.initialVideoMode || false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  const webViewRef = useRef(null);
  const iframeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const hasSentMessageRef = useRef(false);

  // Build the WebRTC Call HTML Page URL with search params
  const webRtcUrl = `${CALL_API_URL.replace('call_handler.php', 'webrtc_call.html')}?role=${role}&booking_id=${bookingId}&user_id=${user.id}&target_id=${otherUser.id}&call_id=${callId || ''}&call_api_url=${encodeURIComponent(CALL_API_URL)}&ngrok-skip-browser-warning=true&video=${route.params.initialVideoMode ? 'true' : 'false'}`;

  useEffect(() => {
    (async () => {
      try {
        // Try Expo's unified cross-platform permissions API first (ideal for Expo Go on Android + iOS)
        const micCheck = await Camera.getMicrophonePermissionsAsync();
        const camCheck = await Camera.getCameraPermissionsAsync();

        if (micCheck.granted && camCheck.granted) {
          setPermissionsGranted(true);
          return;
        }

        const micStatus = await Camera.requestMicrophonePermissionsAsync();
        const camStatus = await Camera.requestCameraPermissionsAsync();
        
        if (micStatus.granted && camStatus.granted) {
          setPermissionsGranted(true);
          return;
        }
        
        if (micStatus.status === 'granted' && camStatus.status === 'granted') {
          setPermissionsGranted(true);
          return;
        }

        // Fallback for Android using core PermissionsAndroid if Expo API returns non-granted in native build
        if (Platform.OS === 'android') {
          const hasMicPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
          const hasCamPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

          if (hasMicPermission && hasCamPermission) {
            setPermissionsGranted(true);
            return;
          }

          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          ]);
          
          if (
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            setPermissionsGranted(true);
            return;
          }
        }

        Alert.alert(
          'Permissions Required',
          'Microphone and Camera permissions are required to make voice and video calls.'
        );
        navigation.goBack();
      } catch (e) {
        console.warn('Error requesting cross-platform permissions, setting fallback to true:', e);
        // Global fail-safe: if checks throw, enable WebView so it can request inside its own context
        setPermissionsGranted(true);
      }
    })();
  }, []);

  useEffect(() => {
    // Timer starts only when call becomes active (Connected)
    if (callStatus === 'Active') {
      timerIntervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [callStatus]);

  // Format seconds to MM:SS
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to send message to WebView / Iframe
  const postToWeb = (action, value) => {
    const message = JSON.stringify({ action, value });
    if (Platform.OS === 'web') {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(message, '*');
      }
    } else {
      if (webViewRef.current) {
        // Inject JS execution to post a message within the WebView container window
        const jsCode = `window.postMessage(${JSON.stringify(message)}, '*'); true;`;
        webViewRef.current.injectJavaScript(jsCode);
      }
    }
  };

  const sendJoinCallChatMessage = async (cId) => {
    if (hasSentMessageRef.current) return;
    hasSentMessageRef.current = true;

    try {
      const chatApiUrl = CALL_API_URL.replace('call_handler.php', 'chat_handler.php');
      const body = {
        booking_id: bookingId,
        sender_id: user.id,
        receiver_id: otherUser.id,
        message_text: `[JOIN_CALL_CARD]{"call_id": ${cId}}`,
      };

      const response = await fetch(`${chatApiUrl}?action=send_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      console.log('Join Call Chat Card response:', result);
    } catch (e) {
      console.error('Failed to send Join Call Chat Card:', e);
    }
  };

  // Handle Mute Action
  const handleToggleMute = () => {
    const newValue = !isMuted;
    setIsMuted(newValue);
    postToWeb('mute', newValue);
  };

  // Handle Speaker Action
  const handleToggleSpeaker = () => {
    const newValue = !isSpeakerOn;
    setIsSpeakerOn(newValue);
    postToWeb('speaker', newValue);
  };

  // Handle Video Switch Action
  const handleToggleVideo = () => {
    if (isVideoMode) {
      postToWeb('disable_video');
    } else {
      postToWeb('enable_video');
    }
  };

  // Handle End Call Action
  const handleEndCall = () => {
    postToWeb('end');
    setCallStatus('Ended');
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  // Handle messages received from the WebView
  const handleMessage = (eventData) => {
    try {
      let data;
      if (typeof eventData === 'string') {
        try {
          data = JSON.parse(eventData);
        } catch (e) {
          // Not a JSON string, ignore (e.g. webpack messages)
          return;
        }
      } else {
        data = eventData;
      }

      if (!data || !data.type) return;
      
      if (data.type === 'log') {
        console.log('[Call WebRTC Log]:', data.message);
        // Translate WebRTC states into clear user statuses
        if (data.message.includes('Waiting for answer')) {
          setCallStatus('Ringing...');
        } else if (data.message.includes('SDP offer received')) {
          setCallStatus('Connecting...');
        }
      } else if (data.type === 'initiated') {
        sendJoinCallChatMessage(data.callId);
      } else if (data.type === 'active') {
        setCallStatus('Active');
      } else if (data.type === 'ended') {
        setCallStatus('Ended');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } else if (data.type === 'video_mode_changed') {
        setIsVideoMode(data.mode === 'video');
      } else if (data.type === 'error') {
        console.error('Call Screen WebRTC Error:', data.message);
        Alert.alert('Call Error', 'Failed to establish call connection.');
        navigation.goBack();
      }
    } catch (e) {
      console.error('Error parsing message from WebView:', e);
    }
  };

  // Setup postMessage listener for Web Platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMessage = (e) => {
        if (e.data) {
          handleMessage(e.data);
        }
      };
      window.addEventListener('message', handleWebMessage);
      return () => {
        window.removeEventListener('message', handleWebMessage);
      };
    }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0f19' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      {/* Full-Screen WebRTC Call Video Background */}
      {permissionsGranted && (
        Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef}
            src={webRtcUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isVideoMode ? 1.0 : 0.01,
              border: 0,
              zIndex: isVideoMode ? 1 : -9999
            }}
            allow="microphone; camera; autoplay"
          />
        ) : (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: isVideoMode ? 1.0 : 0.01,
            zIndex: isVideoMode ? 1 : -9999,
            backgroundColor: 'transparent'
          }}>
            <WebView
              ref={webViewRef}
              source={{ 
                uri: webRtcUrl,
                headers: {
                  'ngrok-skip-browser-warning': 'true'
                }
              }}
              onMessage={(e) => handleMessage(e.nativeEvent.data)}
              onConsoleMessage={(event) => {
                console.log('[WebView Console Log]:', event.nativeEvent.message);
              }}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              mediaCapturePermissionGrantType="grant"
              onPermissionRequest={(event) => {
                const resources = event.nativeEvent?.resources || event.resources;
                if (event.grant) {
                  event.grant(resources);
                } else if (event.nativeEvent?.grant) {
                  event.nativeEvent.grant(resources);
                }
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
              style={{ backgroundColor: 'transparent', width: '100%', height: '100%' }}
              containerStyle={{ backgroundColor: 'transparent' }}
            />
          </View>
        )
      )}

      {/* Floating UI Overlay (Header & Footer Controls) */}
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} pointerEvents="box-none">
        
        {/* Floating Top Header Controls */}
        <View style={styles.headerContainer} pointerEvents="box-none">
          {/* Layout Balance Spacer */}
          <View style={{ width: 44 }} />
          
          {/* Header Call Information (Video Call Mode only) */}
          {isVideoMode && (
            <View style={styles.headerInfo}>
              <Text style={styles.headerUserName}>{otherUser.name}</Text>
              <Text style={styles.headerTimerText}>
                {callStatus === 'Active' ? formatTimer(seconds) : callStatus}
              </Text>
            </View>
          )}

          {/* Toggle Video Switch Button */}
          <TouchableOpacity
            onPress={handleToggleVideo}
            style={styles.headerActionBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isVideoMode ? "phone-portrait" : "videocam"}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        
        {/* Profile & Identity Center (Voice Call Mode only) */}
        {!isVideoMode && (
          <View style={styles.centerContainer}>
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: otherUser.photo || `https://i.pravatar.cc/150?u=${otherUser.id}` }}
                style={styles.profilePhoto}
              />
              {callStatus !== 'Ended' && (
                <View style={[
                  styles.pulseCircle,
                  callStatus === 'Active' ? styles.pulseActive : styles.pulseRinging
                ]} />
              )}
            </View>
            
            <Text style={styles.userName}>{otherUser.name}</Text>
            
            <Text style={styles.timerText}>
              {callStatus === 'Active' ? formatTimer(seconds) : callStatus}
            </Text>
          </View>
        )}

        {/* Empty Flex Spacer in Video Mode to push footer Container to the bottom */}
        {isVideoMode && <View style={{ flex: 1 }} />}

        {/* Control Buttons Footer */}
        <View style={styles.footerContainer} pointerEvents="box-none">
          {/* Mute Button */}
          <TouchableOpacity
            onPress={handleToggleMute}
            style={[styles.circleBtn, isMuted && styles.circleBtnActive]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={28}
              color={isMuted ? "#0b0f19" : "#ffffff"}
            />
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            onPress={handleEndCall}
            style={styles.endCallBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name="call"
              size={32}
              color="#ffffff"
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            onPress={handleToggleSpeaker}
            style={[styles.circleBtn, isSpeakerOn && styles.circleBtnActive]}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-medium"}
              size={28}
              color={isSpeakerOn ? "#0b0f19" : "#ffffff"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19', // Sleek, modern HSL-tailored premium dark color
    justifyContent: 'space-between',
    paddingVertical: 40,
    zIndex: 5,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 2,
  },
  pulseCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    zIndex: 1,
    opacity: 0.15,
  },
  pulseRinging: {
    backgroundColor: Theme.colors.primary || '#2196F3',
    borderWidth: 2,
    borderColor: Theme.colors.primary || '#2196F3',
  },
  pulseActive: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  circleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  circleBtnActive: {
    backgroundColor: '#ffffff',
  },
  endCallBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#f44336', // Vibrant premium red
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    width: '100%',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerTimerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  headerActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
