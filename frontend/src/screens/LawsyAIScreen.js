import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Image,
  Alert,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Theme } from '../theme';
import { OPENROUTER_API_KEY, AI_CHAT_API_URL, LAWYERS_AI_CONTEXT_API_URL } from '../config';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;
const BACKEND_URL = AI_CHAT_API_URL;

export const LawsyAIScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('LawsyAI');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [lawyersContext, setLawyersContext] = useState('');
  const [lawyersData, setLawyersData] = useState([]);
  
  const flatListRef = useRef(null);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    if (user?.id) {
      loadHistory();
      fetchLawyersContext();
    }
  }, [user?.id]);

  const fetchLawyersContext = async () => {
    try {
      const response = await fetch(LAWYERS_AI_CONTEXT_API_URL);
      const data = await response.json();
      if (data.status === 'success') {
        setLawyersContext(data.context);
        setLawyersData(data.raw_data || []);
      }
    } catch (error) {
      console.error('Error fetching lawyers context:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}?action=get_sessions&user_id=${user.id}`);
      const data = await response.json();
      if (data.status === 'success') {
        setChatHistory(data.sessions);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadSession = async (sId, sTitle) => {
    setSidebarVisible(false);
    setLoading(true);
    setSessionId(sId);
    setSessionTitle(sTitle || 'LawsyAI');
    
    try {
      const response = await fetch(`${BACKEND_URL}?action=get_messages&session_id=${sId}`);
      const data = await response.json();
      if (data.status === 'success') {
        const formattedMessages = data.messages.map(m => ({
          id: m.id.toString(),
          role: m.role,
          content: m.content,
          created_at: m.created_at,
          attachment: m.attachment_uri ? {
            uri: m.attachment_uri,
            type: m.attachment_type,
            name: m.attachment_name
          } : null
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setSessionTitle('LawsyAI');
    setSidebarVisible(false);
  };

  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(sidebarAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      loadHistory();
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const saveMessageToDB = async (sId, role, content, attachment) => {
    try {
      const response = await fetch(`${BACKEND_URL}?action=save_message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          session_id: sId,
          role,
          content,
          attachment_uri: attachment?.uri,
          attachment_type: attachment?.type,
          attachment_name: attachment?.name,
        }),
      });
      const data = await response.json();
      return data.session_id;
    } catch (error) {
      console.error('Error saving message:', error);
      return sId;
    }
  };

  const updateSessionTitle = async (sId, title) => {
    try {
      await fetch(`${BACKEND_URL}?action=update_title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sId, title }),
      });
    } catch (error) {
      console.error('Error updating title:', error);
    }
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedAttachment({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        type: 'image',
        name: result.assets[0].fileName || 'image.jpg',
      });
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
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedAttachment({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        type: 'image',
        name: `camera_${Date.now()}.jpg`,
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain'],
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedAttachment({
        uri: asset.uri,
        type: 'document',
        name: asset.name,
        size: asset.size,
      });
      Alert.alert("Document Selected", "Tell me what you would like me to do with it.");
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '' && !selectedAttachment) return;

    const userMsgContent = inputText.trim() || (selectedAttachment ? `Attached ${selectedAttachment.type}: ${selectedAttachment.name}` : '');
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsgContent,
      attachment: selectedAttachment,
      created_at: new Date().toISOString(),
      replied_to: replyingTo ? { content: replyingTo.content, role: replyingTo.role } : null
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    const currentAttachment = selectedAttachment;
    
    setInputText('');
    setSelectedAttachment(null);
    setReplyingTo(null);
    setLoading(true);

    // Save user message and get/confirm session ID
    const activeSessionId = await saveMessageToDB(sessionId, 'user', userMsgContent, currentAttachment);
    if (!sessionId) {
      setSessionId(activeSessionId);
      // Generate title for new chat
      const promptTitle = userMsgContent.length > 30 ? userMsgContent.substring(0, 30) + '...' : userMsgContent;
      setSessionTitle(promptTitle);
      updateSessionTitle(activeSessionId, promptTitle);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      // Construct messages for OpenRouter with Multimodal support
      const apiMessages = [
        { 
          role: 'system', 
          content: `You are Lawsy AI, a professional legal assistant. You ONLY answer questions related to Law (Hukum), Lawyers (Pengacara), Regulations (Undang-Undang/Peraturan), and other legal topics.
          
          ${lawyersContext ? `Below is a list of real lawyers available on the Lawsy platform. If a user asks for a recommendation or a lawyer for a specific case, please suggest appropriate ones from this list:
          ${lawyersContext}` : 'If a user asks for a lawyer recommendation, tell them you can help find one but currently the lawyer directory is loading.'}
          
          Be helpful, professional, and concise.`
        },
        ...messages.map(m => {
          if (m.attachment && m.attachment.type === 'image' && m.attachment.base64) {
            return {
              role: m.role,
              content: [
                { type: 'text', text: m.content },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${m.attachment.base64}` } }
              ]
            };
          }
          return { role: m.role, content: m.content };
        })
      ];

      // Add current user message
      if (currentAttachment && currentAttachment.type === 'image' && currentAttachment.base64) {
        apiMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: userMsgContent || "Analyze this image." },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${currentAttachment.base64}` } }
          ]
        });
      } else {
        apiMessages.push({ role: 'user', content: userMsgContent });
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lawsy.ai", 
          "X-Title": "Lawsy AI", 
        },
        body: JSON.stringify({
          "model": "openrouter/free", 
          "messages": apiMessages,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const aiResponse = data.choices[0].message.content;
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        
        // Save assistant message
        if (activeSessionId) {
          saveMessageToDB(activeSessionId, 'assistant', aiResponse, null);
        }
      } else {
        throw new Error('No content in AI response');
      }
    } catch (error) {
      console.error('Lawsy AI Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || "Failed to get response. Please try again."}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const groupHistory = (history) => {
    const groups = {
      'Today': [],
      'Yesterday': [],
      'This Month': [],
      'This Year': [],
      'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    history.forEach(item => {
      const itemDate = new Date(item.created_at);
      if (itemDate >= today) groups['Today'].push(item);
      else if (itemDate >= yesterday) groups['Yesterday'].push(item);
      else if (itemDate >= thisMonth) groups['This Month'].push(item);
      else if (itemDate >= thisYear) groups['This Year'].push(item);
      else groups['Older'].push(item);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.role === 'user';
    const time = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Parse for lawyer cards
    const lawyerCardRegex = /\[LAWYER_CARD:(\d+)\]/g;
    const matches = [...item.content.matchAll(lawyerCardRegex)];
    const cleanContent = item.content.replace(lawyerCardRegex, '').trim();

    return (
      <SwipeableMessage onSwipeRight={() => setReplyingTo(item)}>
        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
            {item.replied_to && (
              <View style={[styles.replyInBubble, isMe ? styles.myReplyInBubble : styles.otherReplyInBubble]}>
                <Text style={styles.replyName}>{item.replied_to.role === 'user' ? 'You' : 'Lawsy AI'}</Text>
                <Text style={[styles.replyText, isMe && { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>
                  {item.replied_to.content}
                </Text>
              </View>
            )}
            {item.attachment && (
              <View style={styles.messageAttachmentPreview}>
                {item.attachment.type === 'image' ? (
                  <Image source={{ uri: item.attachment.uri }} style={styles.messageImage} />
                ) : (
                  <View style={styles.messageDocCard}>
                    <Ionicons name="document-text" size={24} color={isMe ? "#FFF" : Theme.colors.primary} />
                    <Text style={[styles.messageDocName, isMe && { color: '#FFF' }]} numberOfLines={1}>
                      {item.attachment.name}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {cleanContent ? (
              <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                {cleanContent}
              </Text>
            ) : null}
            
            <View style={styles.messageMeta}>
              <Text style={[styles.metaTime, isMe ? styles.myMetaTime : styles.otherMetaTime]}>{time}</Text>
            </View>
          </View>
        </View>

        {/* Render Lawyer Cards outside the bubble if any */}
        {!isMe && matches.length > 0 && (
          <View style={styles.lawyerCardsContainer}>
            {matches.map((match, index) => {
              const lId = match[1];
              const lawyer = lawyersData.find(l => l.user_id.toString() === lId);
              if (!lawyer) return null;
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.aiLawyerCard}
                  onPress={() => navigation.navigate('AboutLawyer', { lawyerId: lawyer.user_id, user })}
                >
                  <Image 
                    source={{ uri: `https://i.pravatar.cc/150?u=${lawyer.user_id}` }} 
                    style={styles.aiLawyerPic} 
                  />
                  <View style={styles.aiLawyerInfo}>
                    <Text style={styles.aiLawyerName}>{lawyer.name}</Text>
                    <Text style={styles.aiLawyerSpecialty}>{lawyer.specialization}</Text>
                    <View style={styles.aiLawyerMeta}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.aiLawyerRating}>{parseFloat(lawyer.rating || 0).toFixed(1)}</Text>
                      <Text style={styles.aiLawyerExp}>{lawyer.years_experience} Yrs Exp</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Theme.colors.primary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </SwipeableMessage>
    );
  };

  const renderWelcome = () => (
    <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <MaterialCommunityIcons name="gavel" size={50} color={Theme.colors.primary} />
        </View>
      </View>
      <Text style={styles.welcomeTitle}>Lawsy AI Assistant</Text>
      <Text style={styles.welcomeCaption}>
        Secure, professional, and instant legal guidance at your fingertips.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{sessionTitle}</Text>
        <TouchableOpacity onPress={toggleSidebar} style={styles.headerBtn}>
          <Ionicons name="menu" size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Chat Content */}
      <View style={styles.content}>
        {messages.length === 0 ? (
          renderWelcome()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={Theme.colors.primary} />
          <Text style={styles.typingText}>Lawsy AI is thinking...</Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputArea}>
          {replyingTo && (
            <View style={styles.replyPreview}>
              <View style={styles.replyPreviewLine} />
              <View style={styles.replyPreviewContent}>
                <Text style={styles.replyPreviewName}>Replying to {replyingTo.role === 'user' ? 'yourself' : 'Lawsy AI'}</Text>
                <Text style={styles.replyPreviewText} numberOfLines={1}>{replyingTo.content}</Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          )}
          {selectedAttachment && (
            <View style={styles.attachmentPreviewArea}>
              <View style={styles.attachmentPreviewCard}>
                {selectedAttachment.type === 'image' ? (
                  <Image source={{ uri: selectedAttachment.uri }} style={styles.previewThumbnail} />
                ) : (
                  <View style={styles.previewDocIcon}>
                    <Ionicons name="document-text" size={24} color={Theme.colors.primary} />
                  </View>
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName} numberOfLines={1}>{selectedAttachment.name}</Text>
                  <Text style={styles.previewType}>{selectedAttachment.type.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedAttachment(null)} style={styles.removePreview}>
                  <Ionicons name="close-circle" size={24} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachBtn} onPress={() => setAttachmentModalVisible(true)}>
              <Ionicons name="add-circle" size={32} color={Theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ask me anything about law..."
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>
            <TouchableOpacity 
              style={[styles.sendBtn, (!inputText.trim() && !selectedAttachment) && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedAttachment) || loading}
            >
              <Ionicons name="send" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Modal */}
      <Modal
        visible={attachmentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAttachmentModalVisible(false)}>
          <View style={styles.attachmentSheetWrapper}>
            <View style={styles.attachmentSheet}>
              <View style={styles.sheetOptions}>
                <TouchableOpacity style={styles.sheetOption} onPress={() => { setAttachmentModalVisible(false); takePhoto(); }}>
                  <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}><Ionicons name="camera" size={26} color={Theme.colors.primary} /></View>
                  <Text style={styles.optionLabel}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetOption} onPress={() => { setAttachmentModalVisible(false); pickImage(); }}>
                  <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}><Ionicons name="images" size={26} color={Theme.colors.primary} /></View>
                  <Text style={styles.optionLabel}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetOption} onPress={() => { setAttachmentModalVisible(false); pickDocument(); }}>
                  <View style={[styles.optionIconCircle, { backgroundColor: '#E3F2FD' }]}><Ionicons name="document-text" size={26} color={Theme.colors.primary} /></View>
                  <Text style={styles.optionLabel}>Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sidebar Drawer */}
      <Modal
        visible={sidebarVisible}
        transparent={true}
        animationType="none"
        onRequestClose={toggleSidebar}
      >
        <View style={styles.drawerContainer}>
          <TouchableOpacity 
            style={styles.drawerOverlay} 
            activeOpacity={1} 
            onPress={toggleSidebar}
          />
          <Animated.View style={[styles.drawerContent, { transform: [{ translateX: sidebarAnim }] }]}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerBrand}>
                <View style={styles.drawerLogo}>
                  <MaterialCommunityIcons name="gavel" size={24} color={Theme.colors.primary} />
                </View>
                <Text style={styles.drawerTitle}>Lawsy AI</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.newChatBtn} onPress={startNewChat}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>

            <FlatList
              data={groupHistory(chatHistory)}
              keyExtractor={(item) => item[0]}
              renderItem={({ item }) => (
                <View style={styles.historyGroup}>
                  <Text style={styles.historyGroupTitle}>{item[0]}</Text>
                  {item[1].map(session => (
                    <TouchableOpacity 
                      key={session.id} 
                      style={[styles.historyItem, sessionId === session.id && styles.activeHistoryItem]}
                      onPress={() => loadSession(session.id, session.title)}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color={Theme.colors.primary} />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyTitle} numberOfLines={1}>{session.title}</Text>
                        <Text style={styles.historyTime}>{getRelativeTime(session.created_at)}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.historyList}
            />
          </Animated.View>
        </View>
      </Modal>
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
    backgroundColor: '#FFFFFF',
  },
  headerBtn: { padding: 5 },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerSpacer: { width: 38 },
  content: { flex: 1 },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: { marginBottom: 20 },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: Theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeCaption: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },
  chatList: { paddingHorizontal: 15, paddingVertical: 20 },
  messageRow: { flexDirection: 'row', marginBottom: 15, maxWidth: '85%' },
  myMessageRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  otherMessageRow: { alignSelf: 'flex-start', justifyContent: 'flex-start' },
  bubble: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
  myBubble: { backgroundColor: Theme.colors.primary, borderBottomRightRadius: 2 },
  otherBubble: {
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageAttachmentPreview: { marginBottom: 8 },
  messageImage: { width: 200, height: 150, borderRadius: 12 },
  messageDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 10,
    width: 180,
  },
  messageDocName: {
    fontFamily: Theme.fonts.medium,
    fontSize: 13,
    color: Theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  messageText: { fontFamily: Theme.fonts.regular, fontSize: 15, lineHeight: 22 },
  myMessageText: { color: '#FFFFFF' },
  otherMessageText: { color: Theme.colors.text },
  messageMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  metaTime: { fontFamily: Theme.fonts.regular, fontSize: 10, opacity: 0.7 },
  myMetaTime: { color: '#FFFFFF' },
  otherMetaTime: { color: '#888888' },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 85,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    marginLeft: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    zIndex: 10,
  },
  typingText: { fontFamily: Theme.fonts.regular, fontSize: 12, color: '#888888', marginLeft: 8 },
  inputArea: { backgroundColor: '#FFFFFF' },
  attachmentPreviewArea: { padding: 10, backgroundColor: '#F8F9FA' },
  attachmentPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewThumbnail: { width: 40, height: 40, borderRadius: 6 },
  previewDocIcon: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: { flex: 1, marginLeft: 12 },
  previewName: { fontFamily: Theme.fonts.bold, fontSize: 14, color: Theme.colors.text },
  previewType: { fontFamily: Theme.fonts.regular, fontSize: 10, color: '#888888' },
  removePreview: { padding: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  attachBtn: { padding: 5 },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    maxHeight: 100,
  },
  input: { fontFamily: Theme.fonts.regular, fontSize: 14, color: Theme.colors.text, paddingVertical: 8 },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  attachmentSheetWrapper: { position: 'absolute', bottom: 80, left: 20, right: 20 },
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
  sheetOptions: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 },
  sheetOption: { alignItems: 'center', width: 75, marginHorizontal: 5 },
  optionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: { fontFamily: Theme.fonts.medium, fontSize: 12, color: Theme.colors.text },
  // Sidebar Styles
  drawerContainer: { flex: 1, flexDirection: 'row' },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerContent: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 100,
  },
  drawerHeader: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  drawerBrand: { flexDirection: 'row', alignItems: 'center' },
  drawerLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(29, 80, 131, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerTitle: { fontFamily: Theme.fonts.bold, fontSize: 18, color: Theme.colors.primary },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    margin: 20,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  newChatText: { fontFamily: Theme.fonts.bold, fontSize: 14, color: '#FFF' },
  historyList: { paddingHorizontal: 20 },
  historyGroup: { marginBottom: 25 },
  historyGroupTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  activeHistoryItem: { backgroundColor: '#F0F7FF' },
  historyInfo: { marginLeft: 15, flex: 1 },
  historyTitle: { fontFamily: Theme.fonts.bold, fontSize: 14, color: Theme.colors.primary, marginBottom: 2 },
  historyTime: { fontFamily: Theme.fonts.regular, fontSize: 11, color: '#999' },
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
    backgroundColor: '#EEEEEE',
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
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  replyPreviewLine: {
    width: 0, // Not needed with borderLeft
  },
  replyPreviewContent: {
    flex: 1,
    marginLeft: 10,
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
  lawyerCardsContainer: {
    marginTop: 5,
    marginBottom: 15,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  aiLawyerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18, // Matches bubble radius
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  aiLawyerPic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },
  aiLawyerInfo: {
    flex: 1,
  },
  aiLawyerName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  aiLawyerSpecialty: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: '#888888',
  },
  aiLawyerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  aiLawyerRating: {
    fontFamily: Theme.fonts.bold,
    fontSize: 11,
    color: Theme.colors.text,
    marginLeft: 3,
  },
  aiLawyerExp: {
    fontFamily: Theme.fonts.regular,
    fontSize: 10,
    color: '#888888',
    marginLeft: 8,
  },
});
