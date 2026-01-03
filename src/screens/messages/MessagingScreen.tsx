import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';

/**
 * A Good Fit App - Messaging System
 * 
 * Screen: 1:1 Chat Interface
 * Theme: Calm, Supportive, Inclusive
 */

// --- Types ---

type MessageType = 'text' | 'system' | 'nudge';

interface Message {
  id: string;
  type: MessageType;
  text: string;
  sender: 'me' | 'them' | 'system';
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

// --- Constants & Theme ---

const COLORS = {
  background: '#F7F9F8', // Soft off-white
  primary: '#4A7C59',    // Sage Green (Wellness tone)
  primaryDark: '#3A6346',
  secondary: '#FFFFFF',
  textMain: '#1F2937',   // Dark Grey
  textMuted: '#6B7280',  // Medium Grey
  border: '#E5E7EB',
  inputBg: '#FFFFFF',
  nudgeBg: '#EFF6FF',    // Light Blue for AI prompts
  nudgeText: '#3B82F6',  // Blue text
  error: '#EF4444',
  success: '#10B981',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
};

// --- Mock Data ---

const CURRENT_USER_ID = 'user_123';
const MATCH_USER: User = {
  id: 'user_456',
  name: 'Sarah',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  isOnline: true,
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    type: 'system',
    text: 'You matched! Say hi.',
    sender: 'system',
    timestamp: '10:00 AM',
  },
  {
    id: 'm2',
    type: 'nudge',
    text: 'Icebreaker suggestion: ask about her hiking photo',
    sender: 'system',
    timestamp: '10:01 AM',
  },
  {
    id: 'm3',
    type: 'text',
    text: 'Hey! I saw you\'re training for a marathon?',
    sender: 'them',
    timestamp: '10:05 AM',
  },
  {
    id: 'm4',
    type: 'text',
    text: 'Yes! My first one. Are you a runner?',
    sender: 'me',
    timestamp: '10:07 AM',
  },
];

// --- Components ---

const ChatHeader = ({ 
  user, 
  onBack, 
  onSafetyPress 
}: { 
  user: User; 
  onBack: () => void; 
  onSafetyPress: () => void; 
}) => (
  <View style={styles.headerContainer}>
    <View style={styles.headerLeft}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        {/* Simulating Back Icon */}
        <Text style={styles.iconText}>←</Text>
      </TouchableOpacity>
      
      <View style={styles.userInfo}>
        <View>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {user.isOnline && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userStatus}>{user.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>
    </View>

    <TouchableOpacity onPress={onSafetyPress} style={styles.safetyButton}>
      {/* Simulating Shield Icon */}
      <Text style={styles.shieldIcon}>🛡️</Text>
    </TouchableOpacity>
  </View>
);

const DateSeparator = ({ date }: { date: string }) => (
  <View style={styles.dateSeparator}>
    <Text style={styles.dateText}>{date}</Text>
  </View>
);

const SystemMessage = ({ text }: { text: string }) => (
  <View style={styles.systemMessageContainer}>
    <Text style={styles.systemMessageText}>{text}</Text>
  </View>
);

const AiNudge = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.nudgeContainer}>
    <Text style={styles.nudgeIcon}>✨</Text>
    <Text style={styles.nudgeText}>{text}</Text>
  </TouchableOpacity>
);

const MessageBubble = ({ message }: { message: Message }) => {
  const isMe = message.sender === 'me';
  
  return (
    <View style={[
      styles.bubbleContainer, 
      isMe ? styles.bubbleContainerRight : styles.bubbleContainerLeft
    ]}>
      {!isMe && (
        <Image source={{ uri: MATCH_USER.avatar }} style={styles.smallAvatar} />
      )}
      <View style={[
        styles.bubble,
        isMe ? styles.bubbleRight : styles.bubbleLeft
      ]}>
        <Text style={[
          styles.messageText,
          isMe ? styles.messageTextRight : styles.messageTextLeft
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.timestamp,
          isMe ? styles.timestampRight : styles.timestampLeft
        ]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
};

const ChatInput = ({ 
  onSend, 
  text, 
  setText 
}: { 
  onSend: () => void; 
  text: string; 
  setText: (t: string) => void; 
}) => (
  <View style={styles.inputWrapper}>
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.iconButton}>
        {/* Simulating Smiley Icon */}
        <Text style={styles.emojiIcon}>😊</Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.textInput}
        placeholder="Type a message..."
        placeholderTextColor={COLORS.textMuted}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
      />
      
      <TouchableOpacity 
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]} 
        onPress={onSend}
        disabled={!text.trim()}
      >
        {/* Simulating Send Icon */}
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SafetyModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Safety Tools</Text>
        <Text style={styles.modalSubtitle}>Keep your experience safe and comfortable.</Text>
        
        <TouchableOpacity style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Report User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Block {MATCH_USER.name}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// --- Main Screen Component ---

const MessagingSystem = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSafetyVisible, setSafetyVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      text: inputText.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleNudgePress = () => {
    setInputText("So, tell me about that hiking photo!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ChatHeader 
        user={MATCH_USER} 
        onBack={() => console.log('Back pressed')} 
        onSafetyPress={() => setSafetyVisible(true)} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <DateSeparator date="Today" />

          {messages.map((msg) => {
            if (msg.type === 'system') {
              return <SystemMessage key={msg.id} text={msg.text} />;
            }
            if (msg.type === 'nudge') {
              return <AiNudge key={msg.id} text={msg.text} onPress={handleNudgePress} />;
            }
            return <MessageBubble key={msg.id} message={msg} />;
          })}
        </ScrollView>

        <ChatInput 
          text={inputText} 
          setText={setInputText} 
          onSend={handleSend} 
        />
      </KeyboardAvoidingView>

      <SafetyModal visible={isSafetyVisible} onClose={() => setSafetyVisible(false)} />
    </SafeAreaView>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: COLORS.textMain,
    marginRight: SPACING.md,
    fontWeight: '300',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  nameContainer: {
    marginLeft: SPACING.sm,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  userStatus: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  safetyButton: {
    padding: SPACING.xs,
  },
  shieldIcon: {
    fontSize: 20,
  },

  // Components
  dateSeparator: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  systemMessageText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  nudgeContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nudgeBg,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    maxWidth: '85%',
  },
  nudgeIcon: {
    fontSize: FONT_SIZE.xs,
    marginRight: SPACING.xs,
  },
  nudgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.nudgeText,
    fontWeight: '500',
  },

  // Message Bubbles
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  bubbleContainerLeft: {
    justifyContent: 'flex-start',
  },
  bubbleContainerRight: {
    justifyContent: 'flex-end',
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: SPACING.xs,
    marginBottom: 2, // Align with bottom of bubble
  },
  bubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 0, // Design spec
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 0, // Design spec
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
  },
  messageTextLeft: {
    color: COLORS.textMain,
  },
  messageTextRight: {
    color: COLORS.secondary,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampLeft: {
    color: COLORS.textMuted,
  },
  timestampRight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Input Area
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 0 : SPACING.md, // iOS handles safe area via KeyboardAvoidingView
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.inputBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.textMain,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
  },
  iconButton: {
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIcon: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
  sendButton: {
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMain,
    fontWeight: '500',
  },
  modalCloseButton: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  modalCloseText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
});

export default MessagingSystem;