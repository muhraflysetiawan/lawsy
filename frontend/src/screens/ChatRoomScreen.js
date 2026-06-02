import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Theme } from '../theme';
import { CHAT_API_URL, NGROK_URL, CASE_STATUS_API_URL, PAY_BILL_API_URL, CALL_API_URL } from '../config';

export const ChatRoomScreen = ({ navigation, route }) => {
  const { bookingId, otherUser, user } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatuses, setCallStatuses] = useState({});
  
  const flatListRef = useRef(null);
  const incomingCallRef = useRef(null);

  const checkSingleCallStatus = async (callId) => {
    try {
      const response = await fetch(`${CALL_API_URL}?action=get_call_status&call_id=${callId}`);
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        setCallStatuses(prev => ({
          ...prev,
          [callId]: result.data.status
        }));
      }
    } catch (e) {
      console.error("Error checking call status for call ID " + callId, e);
    }
  };

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    fetchMessages();
    fetchCaseStatus();
    checkIncomingCall();
    const interval = setInterval(() => {
      fetchMessages();
      fetchCaseStatus();
      checkIncomingCall();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkIncomingCall = async () => {
    try {
      const response = await fetch(`${CALL_API_URL}?action=get_call_status&booking_id=${bookingId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        const activeCall = result.data;
        if (activeCall.status === 'ringing' && activeCall.receiver_id.toString() === user.id.toString()) {
          // Re-enable incoming call modal popup for real-time responsiveness
          if (!incomingCallRef.current || incomingCallRef.current.id !== activeCall.id) {
            setIncomingCall(activeCall);
          }
        } else if (activeCall.status === 'ended' || activeCall.status === 'declined') {
          if (incomingCallRef.current && incomingCallRef.current.id === activeCall.id) {
            setIncomingCall(null);
          }
        }
      } else {
        if (incomingCallRef.current) {
          setIncomingCall(null);
        }
      }
    } catch (error) {
      console.error('Error checking incoming call:', error);
    }
  };

  const handleCall = async () => {
    try {
      // 1. Create a call session immediately in MySQL in the background (empty SDP offer)
      const res = await fetch(`${CALL_API_URL}?action=start_call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          caller_id: user.id,
          receiver_id: otherUser.id
        })
      });
      const result = await res.json();
      
      if (result.status === 'success' && result.data) {
        const callId = result.data.id;
        console.log("Pre-created call session successfully! Call ID:", callId);
        
        // 2. Send the JOIN_CALL_CARD directly from ChatRoomScreen!
        await fetch(`${CHAT_API_URL}?action=send_message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId,
            sender_id: user.id,
            receiver_id: otherUser.id,
            message_text: `[JOIN_CALL_CARD]{"call_id": ${callId}}`
          })
        });
        
        // 3. Instantly refresh messages in the room so the card displays immediately!
        fetchMessages();
        
        // 4. Navigate the caller to CallScreen, passing the pre-created callId!
        navigation.navigate('Call', {
          role: 'caller',
          bookingId: bookingId,
          user: user,
          otherUser: otherUser,
          callId: callId
        });
      } else {
        Alert.alert("Call Error", "Failed to start call: " + (result.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Failed to initiate pre-created call session:", e);
      Alert.alert("Call Error", "Unable to establish network connection for call.");
    }
  };

  const handleVideoCall = async () => {
    try {
      // 1. Create a call session immediately in MySQL in the background (empty SDP offer)
      const res = await fetch(`${CALL_API_URL}?action=start_call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          caller_id: user.id,
          receiver_id: otherUser.id
        })
      });
      const result = await res.json();
      
      if (result.status === 'success' && result.data) {
        const callId = result.data.id;
        console.log("Pre-created video call session successfully! Call ID:", callId);
        
        // 2. Send the JOIN_CALL_CARD directly from ChatRoomScreen!
        await fetch(`${CHAT_API_URL}?action=send_message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId,
            sender_id: user.id,
            receiver_id: otherUser.id,
            message_text: `[JOIN_CALL_CARD]{"call_id": ${callId}, "is_video": true}`
          })
        });
        
        // 3. Instantly refresh messages in the room so the card displays immediately!
        fetchMessages();
        
        // 4. Navigate the caller to CallScreen, passing the pre-created callId!
        navigation.navigate('Call', {
          role: 'caller',
          bookingId: bookingId,
          user: user,
          otherUser: otherUser,
          callId: callId,
          initialVideoMode: true
        });
      } else {
        Alert.alert("Call Error", "Failed to start video call: " + (result.message || "Unknown error"));
      }
    } catch (e) {
      console.error("Failed to initiate pre-created video call session:", e);
      Alert.alert("Call Error", "Unable to establish network connection for video call.");
    }
  };

  const handleAcceptCall = () => {
    const callData = incomingCall;
    setIncomingCall(null);
    navigation.navigate('Call', {
      role: 'receiver',
      bookingId: bookingId,
      user: user,
      otherUser: otherUser,
      callId: callData.id
    });
  };

  const handleDeclineCall = async () => {
    const callData = incomingCall;
    setIncomingCall(null);
    try {
      await fetch(`${CALL_API_URL}?action=end_call&call_id=${callData.id}`);
    } catch (error) {
      console.error('Error declining call:', error);
    }
  };

  const fetchCaseStatus = async () => {
    try {
      const response = await fetch(`${CASE_STATUS_API_URL}?booking_id=${bookingId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        setCaseData(result.data);
        // If user is client and payment is pending, lock the chat
        if (user.role !== 'Lawyer' && result.data.payment_status === 'Pending') {
          // Check if expired (1 hour)
          const created = new Date(result.data.created_at).getTime();
          const now = Date.now();
          if (now - created < 3600000) {
            setIsPaymentPending(true);
          } else {
            setIsPaymentPending(false); // Expired but maybe still blocked? User said "until successful"
            // But if it's expired, it's canceled for lawyer and expired for client.
          }
        } else {
          setIsPaymentPending(false);
        }
      }
    } catch (error) {
      console.error('Error fetching case status:', error);
    }
  };

  const handlePay = () => {
    if (!caseData) return;
    navigation.navigate('Payment', { caseId: caseData.id });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${CHAT_API_URL}?action=get_messages&booking_id=${bookingId}&user_id=${user.id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const result = await response.json();
      if (result.status === 'success') {
        if (JSON.stringify(result.data) !== JSON.stringify(messages)) {
          setMessages(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMessages = () => {
    const processed = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at).toDateString();
      if (msgDate !== lastDate) {
        processed.push({ id: `date-${msgDate}`, isDate: true, date: msgDate });
        lastDate = msgDate;
      }
      processed.push(msg);
    });

    return processed;
  };

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUpload(result.assets[0].uri, result.assets[0].fileName || 'image.jpg');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUpload(result.assets[0].uri, `camera_${Date.now()}.jpg`);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });

    if (!result.canceled) {
      handleUpload(result.assets[0].uri, result.assets[0].name);
    }
  };

  const handleUpload = async (uri, fileName) => {
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: fileName,
        type: 'application/octet-stream', // Let backend handle extension check
      });

      const response = await fetch(`${CHAT_API_URL}?action=upload_attachment`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (result.status === 'success') {
        // Send actual message with attachment path
        await fetch(`${CHAT_API_URL}?action=send_message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId,
            sender_id: user.id,
            receiver_id: otherUser.id,
            message_text: '',
            attachment_path: result.file_path,
          }),
        });
        fetchMessages();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setSending(false);
    }
  };

  const downloadFile = async (url, fileName) => {
    try {
      const fileUri = FileSystem.documentDirectory + fileName;
      const downloadRes = await FileSystem.downloadAsync(url, fileUri);
      
      if (downloadRes.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          Alert.alert('Success', 'File downloaded to: ' + downloadRes.uri);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    const tempText = inputText;
    setInputText('');
    setSending(true);

    try {
      let endpoint = `${CHAT_API_URL}?action=send_message`;
      let body = {
        booking_id: bookingId,
        sender_id: user.id,
        receiver_id: otherUser.id,
        message_text: tempText,
        replied_to_id: replyingTo ? replyingTo.id : null,
      };

      if (editingMessage) {
        endpoint = `${CHAT_API_URL}?action=edit_message`;
        body = {
          message_id: editingMessage.id,
          message_text: tempText,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setReplyingTo(null);
        setEditingMessage(null);
        fetchMessages();
      } else {
        Alert.alert('Error', result.message);
        setInputText(tempText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(tempText);
    } finally {
      setSending(false);
    }
  };

  const handleMessageAction = (msg) => {
    setSelectedMessage(msg);
    setActionModalVisible(true);
  };

  const handleDeleteMessage = async (type) => {
    setActionModalVisible(false);
    try {
      const response = await fetch(`${CHAT_API_URL}?action=delete_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: selectedMessage.id,
          user_id: user.id,
          delete_type: type,
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        fetchMessages();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const startEditMessage = () => {
    setActionModalVisible(false);
    setEditingMessage(selectedMessage);
    setInputText(selectedMessage.message_text);
  };

  const startReplyMessage = (msg) => {
    setActionModalVisible(false);
    setReplyingTo(msg);
    setEditingMessage(null);
  };

  const renderAttachment = (item, isMe) => {
    if (!item.attachment_path) return null;

    const fullUrl = `${NGROK_URL}/lawsy/backend/${item.attachment_path}`;
    const fileName = item.attachment_path.split('_').pop();
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(item.attachment_path);

    if (isImage) {
      return (
        <TouchableOpacity 
          onPress={() => {
            setPreviewImage(fullUrl);
            setPreviewVisible(true);
          }}
          activeOpacity={0.9}
        >
          <Image source={{ uri: fullUrl }} style={styles.attachedImage} resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    return (
      <View 
        style={[styles.documentCard, isMe && { backgroundColor: 'rgba(255,255,255,0.1)' }]} 
      >
        <TouchableOpacity 
          style={styles.documentMain} 
          onPress={() => WebBrowser.openBrowserAsync(fullUrl)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={item.attachment_path.endsWith('.pdf') ? "document-text" : "document"} 
            size={32} 
            color={isMe ? "#FFFFFF" : Theme.colors.primary} 
          />
          <View style={styles.documentInfo}>
            <Text style={[styles.documentName, isMe && { color: '#FFFFFF' }]} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={[styles.documentSize, isMe && { color: 'rgba(255,255,255,0.7)' }]}>
              {item.attachment_path.split('.').pop().toUpperCase()} File (Click to Preview)
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.downloadIconBtn} 
          onPress={() => downloadFile(fullUrl, fileName)}
        >
          <Ionicons name="download-outline" size={24} color={isMe ? "#FFFFFF" : "#888"} />
        </TouchableOpacity>
      </View>
    );
  };

  const SwipeableMessage = ({ children, onSwipeRight }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
        },
        onPanResponderMove: (evt, gestureState) => {
          if (gestureState.dx > 0) {
            pan.setValue({ x: gestureState.dx, y: 0 });
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (gestureState.dx > 50) {
            onSwipeRight();
          }
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      })
    ).current;

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <Animated.View
          style={{
            transform: [{ translateX: pan.x }],
            flex: 1,
          }}
          {...panResponder.panHandlers}
        >
          {children}
        </Animated.View>
        <Animated.View style={{ 
          position: 'absolute', 
          left: -40, 
          opacity: pan.x.interpolate({ inputRange: [0, 50], outputRange: [0, 1], extrapolate: 'clamp' }) 
        }}>
          <Ionicons name="arrow-undo" size={20} color={Theme.colors.primary} />
        </Animated.View>
      </View>
    );
  };

  const renderMessageItem = ({ item }) => {
    if (item.isDate) {
      return (
        <View style={styles.dateContainer}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>{formatDateLabel(item.date)}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    const isMe = item.sender_id.toString() === user.id.toString();
    const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Handle Bill Card
    if (item.message_text && item.message_text.startsWith('[BILL_CARD]')) {
      const billData = JSON.parse(item.message_text.replace('[BILL_CARD]', ''));
      return renderBillCard(billData, isMe, time, item);
    }

    // Handle Call Card
    if (item.message_text && item.message_text.startsWith('[JOIN_CALL_CARD]')) {
      const callData = JSON.parse(item.message_text.replace('[JOIN_CALL_CARD]', ''));
      return renderJoinCallCard(callData, isMe, time, item);
    }

    return (
      <SwipeableMessage onSwipeRight={() => startReplyMessage(item)}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onLongPress={() => handleMessageAction(item)}
          delayLongPress={500}
          style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}
        >
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
            {item.replied_to_id && (
              <View style={[styles.replyInBubble, isMe ? styles.myReplyInBubble : styles.otherReplyInBubble]}>
                <Text style={styles.replyName}>{isMe ? 'You' : otherUser.name}</Text>
                <Text style={[styles.replyText, isMe && { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
                  {item.replied_text || (item.replied_attachment ? 'Attachment' : 'Message deleted')}
                </Text>
              </View>
            )}
            {renderAttachment(item, isMe)}
            {item.message_text ? (
              <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                {item.message_text}
              </Text>
            ) : null}
            <View style={styles.messageMeta}>
              {item.is_edited === 1 && (
                <Text style={[styles.editedLabel, isMe ? styles.myEditedLabel : styles.otherEditedLabel]}>edited</Text>
              )}
              <Text style={[styles.metaTime, isMe ? styles.myMetaTime : styles.otherMetaTime]}>{time}</Text>
              {isMe && (
                <Ionicons 
                  name={item.is_read === 1 ? "checkmark-done" : "checkmark"} 
                  size={16} 
                  color={item.is_read === 1 ? "#A5D6A7" : "#FFFFFF"} 
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </SwipeableMessage>
    );
  };

  const renderJoinCallCard = (callData, isMe, time, item) => {
    const callId = callData.call_id;
    const isVideo = callData.is_video === true;
    const currentStatus = callStatuses[callId] || 'ringing';

    // Trigger status check if not loaded yet
    if (!callStatuses[callId]) {
      checkSingleCallStatus(callId);
    }

    const isCallActive = currentStatus === 'ringing' || currentStatus === 'active';

    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.callCard}>
          <View style={styles.callCardContent}>
            <View style={styles.callCardHeader}>
              <View style={[styles.callCardIconCircle, { backgroundColor: isCallActive ? (isVideo ? '#E3F2FD' : '#E8F5E9') : '#ECEFF1' }]}>
                <Ionicons 
                  name={isCallActive ? (isVideo ? "videocam" : "call") : (isVideo ? "videocam-outline" : "call-outline")} 
                  size={24} 
                  color={isCallActive ? (isVideo ? Theme.colors.primary : "#4CAF50") : "#78909C"} 
                />
              </View>
              <View style={styles.callCardInfo}>
                <Text style={styles.callCardTitle}>
                  {isVideo
                    ? (isMe ? 'Video Call Started' : `${otherUser.name} Started a Video Call`)
                    : (isMe ? 'Voice Call Started' : `${otherUser.name} Started a Voice Call`)
                  }
                </Text>
                <Text style={styles.callCardSub}>
                  {isCallActive 
                    ? (isVideo ? 'Real-time Video Call is active' : 'Real-time Audio Call is active') 
                    : 'Call ended'
                  }
                </Text>
              </View>
            </View>

            {isCallActive ? (
              <TouchableOpacity 
                style={styles.joinCallBtn} 
                onPress={() => {
                  navigation.navigate('Call', {
                    role: isMe ? 'caller' : 'receiver',
                    bookingId: bookingId,
                    user: user,
                    otherUser: otherUser,
                    callId: callId,
                    initialVideoMode: isVideo
                  });
                }}
              >
                <Ionicons name="enter-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.joinCallBtnText}>Join Call</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.endedCallBadge}>
                <Text style={styles.endedCallText}>Call Ended</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.billTimeText}>{time}</Text>
      </View>
    );
  };

  const renderBillCard = (bill, isMe, time, item) => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Calculate status
    const createdTime = new Date(item.created_at).getTime();
    const now = Date.now();
    const isExpired = now - createdTime > 3600000; // 1 hour
    
    let statusText = "";
    let statusColor = Theme.colors.primary;
    let showPayButton = false;

    if (caseData?.payment_status === 'Success') {
      statusText = "Success";
      statusColor = "#4CAF50";
    } else if (isExpired) {
      statusText = user.role === 'Lawyer' ? "Canceled" : "Expired";
      statusColor = "#F44336";
    } else {
      statusText = "Pending";
      statusColor = "#FF9800";
      if (user.role !== 'Lawyer') showPayButton = true;
    }

    // Calculate Countdown
    const getTimeRemaining = () => {
      const remaining = 3600000 - (now - createdTime);
      if (remaining <= 0) return "00:00";
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.billCard}>
          <Image source={{ uri: `${NGROK_URL}/lawsy/backend/${bill.header_image}` }} style={styles.billHeaderImage} />
          
          <View style={styles.billContent}>
            <Text style={styles.billTitle}>Strategic Consultation Service</Text>
            <Text style={styles.billCaption}>Get in-depth and measurable legal solutions from our expert partners.</Text>
            
            <View style={styles.billAlertCard}>
              <View style={styles.billSummaryItem}>
                <Text style={styles.billSummaryLabel}>Client Name</Text>
                <Text style={styles.billSummaryValue}>{bill.client_name}</Text>
              </View>
              <View style={styles.billSummaryItem}>
                <Text style={styles.billSummaryLabel}>Case Name</Text>
                <Text style={styles.billSummaryValue}>{bill.case_name}</Text>
              </View>
              <View style={styles.billSummaryItem}>
                <Text style={styles.billSummaryLabel}>Category</Text>
                <Text style={styles.billSummaryValue}>{bill.category}</Text>
              </View>
              <View style={styles.billSummaryItem}>
                <Text style={styles.billSummaryLabel}>Estimated Cost</Text>
                <Text style={styles.billSummaryValue}>{formatCurrency(bill.estimated_costs)}</Text>
              </View>
              <View style={styles.billSummaryItem}>
                <Text style={styles.billSummaryLabel}>Tax ({bill.tax_percentage || 0}%)</Text>
                <Text style={styles.billSummaryValue}>{formatCurrency((bill.estimated_costs + (bill.service_fee || 0)) * ((bill.tax_percentage || 0) / 100))}</Text>
              </View>
              
              <View style={styles.billNotesBox}>
                <Text style={styles.billSummaryLabel}>Notes</Text>
                <Text style={styles.billNotesText}>{bill.notes || '-'}</Text>
              </View>
            </View>

            <View style={styles.totalCostStandaloneCard}>
              <Text style={styles.totalCostLabel}>Total Costs Proposed</Text>
              <Text style={styles.totalCostValue}>{formatCurrency(bill.total_cost)}</Text>
            </View>

            <View style={styles.billActions}>
              {showPayButton ? (
                <>
                  <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
                    <Text style={styles.payBtnText}>Pay</Text>
                  </TouchableOpacity>
                  <Text style={styles.countdownText}>Expires in {getTimeRemaining()}</Text>
                </>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <Text style={styles.billTimeText}>{time}</Text>
      </View>
    );
  };

  const handlePlus = () => {
    setAttachmentModalVisible(true);
  };

  const renderAttachmentModal = () => (
    <Modal
      visible={attachmentModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setAttachmentModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setAttachmentModalVisible(false)}
      >
        <View style={styles.attachmentSheetWrapper}>
          <View style={styles.attachmentSheet}>
            <View style={styles.sheetOptions}>
              <TouchableOpacity 
                style={styles.sheetOption} 
                onPress={() => {
                  setAttachmentModalVisible(false);
                  takePhoto();
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="camera" size={26} color={Theme.colors.primary} />
                </View>
                <Text style={styles.optionLabel}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sheetOption} 
                onPress={() => {
                  setAttachmentModalVisible(false);
                  pickImage();
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="images" size={26} color={Theme.colors.primary} />
                </View>
                <Text style={styles.optionLabel}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sheetOption} 
                onPress={() => {
                  setAttachmentModalVisible(false);
                  pickDocument();
                }}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="document-text" size={26} color={Theme.colors.primary} />
                </View>
                <Text style={styles.optionLabel}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderActionModal = () => (
    <Modal
      visible={actionModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setActionModalVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setActionModalVisible(false)}
      >
        <View style={styles.attachmentSheetWrapper}>
          <View style={styles.attachmentSheet}>
            <View style={styles.sheetOptions}>
              <TouchableOpacity 
                style={styles.sheetOption} 
                onPress={() => startReplyMessage(selectedMessage)}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="arrow-undo" size={26} color={Theme.colors.primary} />
                </View>
                <Text style={styles.optionLabel}>Reply</Text>
              </TouchableOpacity>
              
              {selectedMessage?.sender_id.toString() === user.id.toString() && selectedMessage?.message_text && (
                <TouchableOpacity 
                  style={styles.sheetOption} 
                  onPress={startEditMessage}
                >
                  <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="create" size={26} color={Theme.colors.primary} />
                  </View>
                  <Text style={styles.optionLabel}>Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.sheetOption} 
                onPress={() => handleDeleteMessage('me')}
              >
                <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="trash" size={26} color={Theme.colors.primary} />
                </View>
                <Text style={styles.optionLabel}>Hapus</Text>
              </TouchableOpacity>

              {selectedMessage?.sender_id.toString() === user.id.toString() && (
                <TouchableOpacity 
                  style={styles.sheetOption} 
                  onPress={() => handleDeleteMessage('everyone')}
                >
                  <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="trash" size={26} color={Theme.colors.primary} />
                  </View>
                  <Text style={styles.optionLabel}>Semua</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderIncomingCallModal = () => (
    <Modal
      visible={incomingCall !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={handleDeclineCall}
    >
      <View style={styles.callModalOverlay}>
        <View style={styles.callModalContent}>
          <Text style={styles.incomingCallLabel}>INCOMING VOICE CALL</Text>
          
          <Image
            source={{ uri: otherUser.photo || `https://i.pravatar.cc/150?u=${otherUser.id}` }}
            style={styles.incomingCallPhoto}
          />
          
          <Text style={styles.incomingCallName}>{otherUser.name}</Text>
          <Text style={styles.incomingCallSub}>{user.role === 'Lawyer' ? 'Client' : (otherUser.category || 'Lawyer')}</Text>
          
          <View style={styles.incomingCallActions}>
            <View style={styles.actionBtnContainer}>
              <TouchableOpacity 
                style={[styles.callActionCircle, { backgroundColor: '#f44336' }]} 
                onPress={handleDeclineCall}
              >
                <Ionicons name="call" size={28} color="#ffffff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <Text style={styles.callActionText}>Decline</Text>
            </View>

            <View style={styles.actionBtnContainer}>
              <TouchableOpacity 
                style={[styles.callActionCircle, { backgroundColor: '#4CAF50' }]} 
                onPress={handleAcceptCall}
              >
                <Ionicons name="call" size={28} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.callActionText}>Accept</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Image
          source={{ uri: otherUser.photo || `https://i.pravatar.cc/150?u=${otherUser.id}` }}
          style={styles.headerPhoto}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser.name}</Text>
          <Text style={styles.headerStatus}>
            {user.role === 'Lawyer' ? 'Client' : (otherUser.category || 'Lawyer')}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {!isPaymentPending && (
            <>
              <TouchableOpacity style={styles.actionIcon} onPress={handleCall}>
                <Ionicons name="call" size={22} color={Theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={handleVideoCall}>
                <Ionicons name="videocam" size={22} color={Theme.colors.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={processMessages()}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.inputArea, isPaymentPending && styles.lockedInputArea]}>
          {isPaymentPending ? (
            <View style={styles.lockedOverlay}>
              {/* Empty space as requested */}
            </View>
          ) : (
            <>
              {replyingTo && (
                <View style={styles.replyPreview}>
                  <View style={styles.replyPreviewLine} />
                  <View style={styles.replyPreviewContent}>
                    <Text style={styles.replyPreviewName}>Replying to {replyingTo.sender_id.toString() === user.id.toString() ? 'yourself' : otherUser.name}</Text>
                    <Text style={styles.replyPreviewText} numberOfLines={1}>{replyingTo.message_text || 'Attachment'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close-circle" size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              )}
              {editingMessage && (
                <View style={styles.replyPreview}>
                  <View style={[styles.replyPreviewLine, { backgroundColor: Theme.colors.primary }]} />
                  <View style={styles.replyPreviewContent}>
                    <Text style={[styles.replyPreviewName, { color: Theme.colors.primary }]}>Editing message</Text>
                    <Text style={styles.replyPreviewText} numberOfLines={1}>{editingMessage.message_text}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setEditingMessage(null); setInputText(''); }}>
                    <Ionicons name="close-circle" size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachBtn} onPress={handlePlus}>
                  <Ionicons name="add-circle" size={32} color={Theme.colors.primary} />
                </TouchableOpacity>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                  />
                  <TouchableOpacity style={styles.micBtn}>
                    <MaterialCommunityIcons name="microphone" size={24} color="#888888" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
                  onPress={handleSend}
                  disabled={!inputText.trim() || sending}
                >
                  <Ionicons name="send" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal visible={previewVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalClose} 
            onPress={() => setPreviewVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image 
              source={{ uri: previewImage }} 
              style={styles.fullImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>

      {renderAttachmentModal()}
      {renderActionModal()}
      {renderIncomingCallModal()}
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    padding: 5,
  },
  headerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#F0F0F0',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  headerStatus: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginLeft: 15,
    padding: 5,
  },
  chatList: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  miniProfilePhoto: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginTop: 'auto',
    backgroundColor: '#F0F0F0',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    maxWidth: '85%',
  },
  myBubble: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: Theme.colors.text,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  metaTime: {
    fontFamily: Theme.fonts.regular,
    fontSize: 10,
  },
  myMetaTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMetaTime: {
    color: '#888888',
  },
  attachedImage: {
    width: 250,
    height: 180,
    borderRadius: 12,
    marginBottom: 5,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    marginBottom: 5,
    width: 240,
  },
  documentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadIconBtn: {
    padding: 8,
    marginLeft: 5,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  documentName: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  documentSize: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#888888',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  attachBtn: {
    padding: 5,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    paddingVertical: 8,
  },
  micBtn: {
    padding: 5,
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentSheetWrapper: {
    position: 'absolute',
    bottom: 80, // Position right above input text
    left: 20,
    right: 20,
    alignItems: 'flex-start',
  },
  attachmentSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  sheetTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  sheetOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  sheetOption: {
    alignItems: 'center',
    width: 75,
    marginVertical: 5,
  },
  optionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionLabel: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: Theme.colors.text,
  },
  cancelSheetBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    width: '100%',
  },
  cancelSheetText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#888888',
  },
  // Date Headers
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 15,
  },
  dateText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#999999',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  // Reply in Bubble
  replyInBubble: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  myReplyInBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: '#FFFFFF',
  },
  otherReplyInBubble: {
    backgroundColor: '#F5F5F5',
    borderLeftColor: Theme.colors.primary,
  },
  replyName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: Theme.colors.primary,
    marginBottom: 2,
  },
  replyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#666666',
  },
  // Edited Label
  editedLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 10,
    marginRight: 4,
    fontStyle: 'italic',
  },
  myEditedLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  otherEditedLabel: {
    color: '#999999',
  },
  // Action Sheet
  cancelActionBtn: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
  },
  cancelActionText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 15,
    color: Theme.colors.primary,
  },
  // Reply/Edit Preview Area
  inputArea: {
    backgroundColor: '#FFFFFF',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9F9F9',
  },
  replyPreviewLine: {
    width: 3,
    height: '80%',
    backgroundColor: Theme.colors.primary,
    marginRight: 10,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  replyPreviewText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#666666',
  },
  // Bill Card Styles
  systemMessageContainer: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    width: '95%',
  },
  billHeaderImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  billContent: {
    padding: 24,
  },
  billTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  billCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  billAlertCard: {
    backgroundColor: Theme.colors.primary + '15', // 10-15% opacity
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.primary + '30', // Subtle border
  },
  billSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billSummaryLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.primary,
    opacity: 0.7,
  },
  billSummaryValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: Theme.colors.primary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 15,
  },
  billNotesBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.primary + '20',
  },
  billNotesText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.primary,
    marginTop: 4,
    lineHeight: 18,
  },
  totalCostStandaloneCard: {
    backgroundColor: Theme.colors.primary + '08',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary + '20',
  },
  totalCostLabel: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  totalCostValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 32,
    color: Theme.colors.primary,
  },
  billActions: {
    marginTop: 8,
  },
  payBtn: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  countdownText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 12,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 10,
  },
  statusBadge: {
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  statusBadgeText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  billTimeText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 10,
    color: '#AAAAAA',
    marginTop: 8,
  },
  // Locked Input Styles
  lockedInputArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    padding: 15,
  },
  lockedOverlay: {
    height: 45, // Match input height to maintain layout stability
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  // Incoming Call Styles
  callModalOverlay: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 80,
    alignItems: 'center',
  },
  incomingCallLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 20,
  },
  incomingCallPhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  incomingCallName: {
    fontSize: 28,
    fontFamily: Theme.fonts.bold,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  incomingCallSub: {
    fontSize: 16,
    fontFamily: Theme.fonts.regular,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  incomingCallActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 50,
  },
  actionBtnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  callActionCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  callActionText: {
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  // Chat Call Card Styles
  callCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    padding: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginVertical: 4,
  },
  callCardContent: {
    flexDirection: 'column',
  },
  callCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  callCardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callCardInfo: {
    flex: 1,
  },
  callCardTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  callCardSub: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  joinCallBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  joinCallBtnText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  endedCallBadge: {
    backgroundColor: '#ECEFF1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  endedCallText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: '#78909C',
  },
});
