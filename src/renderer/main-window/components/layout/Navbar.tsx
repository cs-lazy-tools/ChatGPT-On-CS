import React from 'react';
import { useNavigate } from 'react-router-dom'; // 导入 Link 组件
import {
  Box,
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  SettingsIcon,
  InfoOutlineIcon,
  ChatIcon,
  CalendarIcon,
} from '@chakra-ui/icons';

const Navbar = () => {
  const navigate = useNavigate();
  const handleNavigate = (path: string) => () => {
    navigate(path);
  };

  const handleOpenSettings = () => {
    window.electron.ipcRenderer.sendMessage('open-settings-window', {});
  };

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      position="fixed"
      width="100%"
      top="0"
      bg={'white'}
      zIndex="1000"
      height="60px"
    >
      <Text as="h1" fontSize="2em" letterSpacing="tighter" className="font-zh">
        懒人客服
      </Text>

      <Box display={{ md: 'none' }}>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<HamburgerIcon />}
            variant="outline"
          />
          <MenuList mb={2}>
            {/* 直接在MenuItem上使用onClick进行导航 */}
            <MenuItem icon={<ChatIcon />} onClick={handleNavigate('/')}>
              首页
            </MenuItem>
            <MenuItem icon={<CalendarIcon />} onClick={handleNavigate('/msg')}>
              记录
            </MenuItem>
            <MenuItem
              icon={<SettingsIcon />}
              onClick={() => {
                handleOpenSettings();
              }}
            >
              设置
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
};

export default React.memo(Navbar);
