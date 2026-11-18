import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert, Box } from '@mui/material';
import type { CreateMessageRequest } from '@/types/chat';
import { MessageList } from '@/components/MessageList';
import { MessageInput } from '@/components/MessageInput';
import { WebSocketToggle } from '@/components/WebSocketToggle';
import {
  KEYBOARD_KEYS,
  WEBSOCKET_CONFIG,
  UI_CONSTANTS,
} from '@/constants/chat';
import { LAYOUT_STYLES } from '@/constants/styles';
import { useMessageStore } from '@/stores/messageStore';
import { getCurrentUser } from '@/utils/message';

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  // On by default: replies should appear without a reload.
  const [liveUpdates, setLiveUpdates] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();
  const messages = useMessageStore((state) => state.messages);
  const fetchMessages = useMessageStore((state) => state.fetchMessages);
  const fetchNewMessages = useMessageStore((state) => state.fetchNewMessages);
  const resetLiveState = useMessageStore((state) => state.resetLiveState);
  const typing = useMessageStore((state) => state.typing);
  const connectionLost = useMessageStore((state) => state.connectionLost);
  const sendMessage = useMessageStore((state) => state.sendMessage);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Live updates: the API has no push channel, so check for new messages
  // every few seconds. Skip the check while the tab is hidden, and catch up
  // as soon as it is shown again.
  const checkNow = useCallback(() => {
    if (document.visibilityState === 'visible') fetchNewMessages();
  }, [fetchNewMessages]);

  useEffect(() => {
    if (!liveUpdates) return;

    const interval = setInterval(
      checkNow,
      WEBSOCKET_CONFIG.POLLING_INTERVAL_MS
    );
    document.addEventListener('visibilitychange', checkNow);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', checkNow);
      // Paused: don't leave typing dots or a connection warning behind.
      resetLiveState();
    };
  }, [liveUpdates, checkNow, resetLiveState]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: UI_CONSTANTS.SCROLL_BEHAVIOR,
    });
  }, []);

  // Keep the newest message, or the typing dots, in view.
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) {
      return;
    }

    const messageData: CreateMessageRequest = {
      message: inputValue,
      author: currentUser,
    };

    await sendMessage(messageData);
    setInputValue('');
    // Check straight away, so a teammate's typing dots show without waiting
    // for the next scheduled check.
    if (liveUpdates) checkNow();
  }, [inputValue, currentUser, sendMessage, liveUpdates, checkNow]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === KEYBOARD_KEYS.ENTER && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <Box sx={LAYOUT_STYLES.container}>
      <WebSocketToggle
        enabled={liveUpdates}
        onToggle={() => setLiveUpdates(!liveUpdates)}
      />
      <MessageList
        messages={messages}
        scrollRef={messagesEndRef}
        currentUser={currentUser}
        typing={typing}
      />
      {connectionLost && (
        <Alert severity="warning" sx={{ borderRadius: 0 }}>
          Can't reach the chat right now. Retrying…
        </Alert>
      )}
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSendMessage={handleSendMessage}
        onKeyDown={handleKeyDown}
      />
    </Box>
  );
}
