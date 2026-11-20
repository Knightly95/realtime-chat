import { Box, Paper, Typography } from '@mui/material';
import { memo } from 'react';
import type { Message } from '@/types/chat';
import { formatTime } from '@/utils/message';
import { CHAT_CONSTANTS } from '@/constants/chat';
import { LAYOUT_STYLES, MESSAGE_STYLES } from '@/constants/styles';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  currentUser: string;
  /** People writing a message right now; shown as typing dots. */
  typing?: string[];
}

const NOBODY: string[] = [];

function MessageListComponent({
  messages,
  scrollRef,
  currentUser,
  typing = NOBODY,
}: MessageListProps) {
  const hasMessages = messages.length > 0;

  return (
    <Box sx={LAYOUT_STYLES.messageListContainer}>
      {!hasMessages && <EmptyState />}

      {hasMessages &&
        messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            currentUser={currentUser}
          />
        ))}

      <TypingIndicator names={typing} />

      <div ref={scrollRef} />
    </Box>
  );
}

export const MessageList = memo(MessageListComponent);

const EmptyState = memo(function EmptyState() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Typography variant="h6" color="textSecondary">
        {CHAT_CONSTANTS.EMPTY_STATE_MESSAGE}
      </Typography>
    </Box>
  );
});

interface MessageBubbleProps {
  message: Message;
  currentUser: string;
}

const MessageBubble = memo(function MessageBubble({
  message,
  currentUser,
}: MessageBubbleProps) {
  const isUserMessage = message.author === currentUser;
  const bubbleStyle = isUserMessage
    ? MESSAGE_STYLES.userBubble
    : MESSAGE_STYLES.otherUserBubble;

  return (
    <Paper sx={bubbleStyle}>
      {!isUserMessage && (
        <Typography sx={MESSAGE_STYLES.author}>{message.author}</Typography>
      )}
      <Typography variant="body2">{message.message}</Typography>
      <Typography variant="caption" sx={MESSAGE_STYLES.timestamp}>
        {formatTime(message.createdAt)}
      </Typography>
    </Paper>
  );
});
