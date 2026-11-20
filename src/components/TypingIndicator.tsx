import { Box, Paper, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { memo } from 'react';
import { MESSAGE_STYLES } from '@/constants/styles';
import { typingLabel } from '@/utils/message';

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
  30% { transform: translateY(-4px); opacity: 1; }
`;

interface TypingIndicatorProps {
  names: string[];
}

/**
 * Three bouncing dots in a teammate's bubble while someone writes a reply.
 *
 * The status line is always in the page, so screen readers announce the
 * change when someone starts typing; the bubble itself is decorative.
 */
function TypingIndicatorComponent({ names }: TypingIndicatorProps) {
  const label = typingLabel(names);

  return (
    <>
      <Box role="status" sx={MESSAGE_STYLES.visuallyHidden}>
        {label}
      </Box>
      {names.length > 0 && (
        <Paper
          aria-hidden
          data-testid="typing-indicator"
          sx={MESSAGE_STYLES.typingBubble}
        >
          <Typography sx={MESSAGE_STYLES.author}>
            {names.length === 1 ? names[0] : label}
          </Typography>
          <Box sx={MESSAGE_STYLES.typingDots}>
            {[0, 1, 2].map((dot) => (
              <Box
                key={dot}
                component="span"
                sx={{
                  animation: `${bounce} 1.2s ease-in-out ${dot * 0.15}s infinite`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    opacity: 0.45 + dot * 0.25,
                  },
                }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </>
  );
}

export const TypingIndicator = memo(TypingIndicatorComponent);
