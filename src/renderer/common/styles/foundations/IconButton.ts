import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const borderless = defineStyle({
  borderRadius: 'full',
  background: 'gray.100',
  height: '40px',
  width: '40px',
  color: 'yellow.400',

  _dark: {
    background: 'gray.600',
    color: 'whiteAlpha.900',
  },
});

const outline = defineStyle({
  color: 'white',
  background: 'blue.400',
  borderColor: 'blue.400',
  borderRadius: 'full',

  _hover: {
    background: 'blue.500',
    borderColor: 'blue.500',
  },

  _active: {
    background: 'blue.500',
    borderColor: 'blue.500',
  },
});

const solid = defineStyle({
  background: 'gray.200',

  // Let's add values for dark mode
  _dark: {
    color: 'white',
    background: 'gray.600',
  },
});

const ghost = defineStyle({
  fontSize: '30px',
  border: '1px dashed',
  borderColor: 'green.200',
});

const link = defineStyle({
  fontSize: '30px',

  _hover: {
    transform: 'scale(1.1)',
    color: 'blue.600',
  },

  _active: {
    color: 'blue.800',
  },
});

const xl = defineStyle({
  fontSize: 'xl',
  px: '6',
  h: '16',
  borderRadius: 'md',
});

export const iconButtonTheme = defineStyleConfig({
  variants: { outline, solid, ghost, link, borderless },
  sizes: { xl },
});
