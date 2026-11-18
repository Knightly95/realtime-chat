import { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
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
  const sendMessage = useMessageStore((state) => state.sendMessage);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Live updates: the API has no push channel, so check for new messages
  // every few seconds. Skip the check while the tab is hidden, and catch up
  // as soon as it is shown again.
  useEffect(() => {
    if (!liveUpdates) return;

    const check = () => {
      if (document.visibilityState === 'visible') fetchNewMessages();
    };
    const interval = setInterval(check, WEBSOCKET_CONFIG.POLLING_INTERVAL_MS);
    document.addEventListener('visibilitychange', check);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
    };
  }, [liveUpdates, fetchNewMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: UI_CONSTANTS.SCROLL_BEHAVIOR,
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
  }, [inputValue, currentUser, sendMessage]);

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
      />
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSendMessage={handleSendMessage}
        onKeyDown={handleKeyDown}
      />
    </Box>
  );
}
