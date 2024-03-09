import { tableAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tableAnatomy.keys);

const variantRounded = definePartsStyle((props) => {
  const { colorScheme: c, colorMode } = props;

  return {
    th: {
      '&[data-is-numeric=true]': {
        textAlign: 'end',
      },
    },
    td: {
      '&[data-is-numeric=true]': {
        textAlign: 'end',
      },
    },
    caption: {
      color: colorMode === 'light' ? `${c}.600` : `${c}.100`,
    },
    tbody: {
      tr: {
        '&:nth-of-type(odd)': {
          'th, td': {
            borderColor: colorMode === 'light' ? `${c}.100` : `${c}.700`,
          },
          td: {
            background: colorMode === 'light' ? `${c}.100` : `${c}.700`,
          },
        },
        '&:nth-of-type(even)': {
          'th, td': {
            borderColor: colorMode === 'light' ? `${c}.300` : `${c}.600`,
          },
          td: {
            background: colorMode === 'light' ? `${c}.300` : `${c}.600`,
          },
        },
      },
    },
    tfoot: {
      tr: {
        '&:last-of-type': {
          th: { borderBottomWidth: 0 },
        },
      },
    },
  };
});

export const tableTheme = defineMultiStyleConfig({
  variants: { variantRounded },
});
