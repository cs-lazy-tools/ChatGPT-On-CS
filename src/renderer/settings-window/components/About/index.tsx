import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Stack,
  useToast,
} from '@chakra-ui/react';
import PageContainer from '../../../common/components/PageContainer';
import Markdown from '../../../common/components/Markdown';
import { getVersionInfo } from '../../../common/services/system/controller';
import { trackPageView } from '../../../common/services/analytics';

const AboutPage: React.FC = () => {
  const toast = useToast();
  const currentVersion = window.electron.ipcRenderer.get('get-version');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updates, setUpdates] = useState<
    {
      version: string;
      url: string;
      description: string;
    }[]
  >([]);

  const checkUpdate = async () => {
    const cv = window.electron.ipcRenderer.get('get-version');
    const versionUpdates = await getVersionInfo(cv);
    if (versionUpdates.length > 0) {
      setUpdates(versionUpdates);
      setIsUpdateModalOpen(true);
    } else {
      toast({
        title: '已经是最新版本',
        position: 'top',
        status: 'success',
        duration: 1000,
        isClosable: true,
      });
    }
  };

  // 确认更新则跳转到最新版本的下载链接
  const confirmUpdate = () => {
    const latestVersion = updates[0]; // 假设第一个总是最新版本
    if (latestVersion) {
      window.electron.ipcRenderer.sendMessage('open-url', latestVersion.url);
    }
  };

  useEffect(() => {
    trackPageView('AboutPage');
  }, []);

  return (
    <PageContainer>
      <VStack>
        <Markdown
          content={`
本项目是基于大模型的智能对话客服工具，支持哔哩哔哩、抖音企业号、抖音、抖店、微博聊天、小红书专业号运营、小红书、知乎等平台接入，可选择 GPT3.5/GPT4.0，能处理文本、语音和图片，通过插件访问操作系统和互联网等外部资源，支持基于自有知识库定制企业 AI 应用。

## 使用说明
项目文档: [懒人百宝箱使用说明](https://doc.lazaytools.top/)

## 演示视频
[哔哩哔哩](https://www.bilibili.com/video/BV1qz421Q73S)

## 项目地址

* [GitHub](https://github.com/lrhh123/ChatGPT-On-CS)
* [Gitee](https://gitee.com/alsritter/ChatGPT-On-CS) (国内用户推荐)

## 联系方式
扫码添加微信小助手，备注 “懒人客服” 即可。

![](https://image.quicktoolset.top/img202406172039969.png)
      `}
        />
      </VStack>

      <br />

      <Box p={5}>
        <Stack spacing={3}>
          <Text fontWeight="bold">版本信息</Text>
          <Text>懒人客服 {currentVersion}</Text>

          {/* 检查更新 */}
          <Button size="sm" onClick={checkUpdate}>
            检查更新
          </Button>
        </Stack>
      </Box>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>版本更新</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>当前版本是 {currentVersion}. 检查到以下更新：</Text>
            <VStack spacing={4} mt="20px">
              {updates.map((update, index) => (
                <Box key={index}>
                  <Markdown content={update.description} />
                </Box>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={confirmUpdate}>
              立即更新到最新版本
            </Button>
            <Button variant="ghost" onClick={() => setIsUpdateModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
};

export default AboutPage;
