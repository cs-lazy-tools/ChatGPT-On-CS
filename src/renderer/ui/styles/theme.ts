import { extendTheme } from '@chakra-ui/react';
import colors from './colors';
import { tableTheme } from './foundations/Table';
import { iconButtonTheme } from './foundations/IconButton';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        bg: 'myBackground.100',
        fontSize: 'md',
        fontWeight: 400,
        height: '100%',
      },
      a: {
        color: 'myPrimary.100',
        padding: '0',
      },
    },
  },
  borders: {
    base: '1px solid #E3E3E3',
  },
  colors: {
    // myText: {
    //   50: '#E6E6E7 ',
    //   100: '#313132',
    //   200: '#626263',
    //   300: '#929495',
    //   400: '#C3C5C6',
    //   500: '#F4F6F8',
    //   600: '#FEFEFE',
    //   700: '#FFFFFF',
    //   800: '#FFFFFF',
    //   900: '#FFFFFF',
    // },
    // myBackground: {
    //   // 从黑色到白色的灰色调色阶
    //   50: '#23252D',
    //   100: '#2b2e39',
    //   200: '#323540',
    //   300: '#3a3f4a',
    //   400: '#424950',
    //   500: '#4A535B',
    //   600: '#53606B',
    //   700: '#5D6D7E',
    //   800: '#687A90',
    //   900: '#7488A1',
    // },
    myPrimary: {
      50: '#E6C4A8',
      100: '#ec7210',
      200: '#f09259',
      300: '#f4b2a1',
      400: '#F7CFC9',
      500: '#F9EDE2',
      600: '#FCFBF5',
      700: '#FEFDFB',
      800: '#FFFFFF',
      900: '#FFFFFF',
    },
    // // 定义边框和分隔线的颜色
    // myBorder: {
    //   50: '#353A43',
    //   100: '#4A5568',
    //   200: '#3f454e',
    //   300: '#282c32',
    //   400: '#1D2026',
    //   500: '#131519',
    //   600: '#0B0D0F',
    //   700: '#050608',
    //   800: '#020304',
    //   900: '#000000',
    // },
  },
  components: {
    Table: tableTheme,
    IconButton: iconButtonTheme,
  },
});

theme.colors = {
  ...theme.colors,
  ...colors,
};

export default theme;
