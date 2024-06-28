import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Switch,
  useToast,
  Divider,
  HStack,
  Stack,
  Skeleton,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  PluginExtraLib,
  PluginExampleCode,
} from '../../../common/utils/constants';
import {
  getConfig,
  updateConfig,
  checkPluginAvailability,
} from '../../../common/services/platform/controller';
import {
  PluginConfig,
  LogBody,
} from '../../../common/services/platform/platform';
import MessageModal from '../MessageModal';
import { useSystemStore } from '../../stores/useSystemStore';

const PluginSettings = ({
  appId,
  instanceId,
}: {
  appId?: string;
  instanceId?: string;
}) => {
  // TODO: 后面需要把这个参数说明放到文档中

  const [code, setCode] = useState<string | undefined>(PluginExampleCode);
  const [consoleLogs, setConsoleLogs] = useState<LogBody[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isOpenMessageModal, setIsOpenMessageModal] = useState(false);
  const cancelRef = React.useRef<any>();
  const { context, messages } = useSystemStore();
  const toast = useToast();

  const { data, isLoading } = useQuery(
    ['config', 'plugin', appId, instanceId],
    async () => {
      try {
        const resp = await getConfig({
          appId,
          instanceId,
          type: 'plugin',
        });
        return resp;
      } catch (error) {
        const errormsg =
          error instanceof Error ? error.message : JSON.stringify(error);
        toast({
          title: '获取配置失败',
          description: errormsg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });

        return null;
      }
    },
  );

  const [config, setConfig] = useState<PluginConfig | null>(null);

  useEffect(() => {
    if (data) {
      const obj = data.data as PluginConfig;
      setConfig(obj);
      if (obj.pluginCode) setCode(obj.pluginCode);
      else setCode(PluginExampleCode);
    }
  }, [data]);

  const handleUpdateConfig = async (newConfig: Partial<PluginConfig>) => {
    if (!config) return;
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    try {
      await updateConfig({
        appId,
        instanceId,
        type: 'plugin',
        cfg: updatedConfig,
      });
    } catch (error) {
      const errormsg =
        error instanceof Error ? error.message : JSON.stringify(error);
      toast({
        title: '更新配置失败',
        position: 'top',
        description: errormsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSaveCode = useCallback(
    async (inCode?: string) => {
      console.log('handleSaveCode', inCode);
      console.log('handleSaveCode - code', code);

      if (!config) return;
      try {
        await updateConfig({
          appId,
          instanceId,
          type: 'plugin',
          cfg: {
            ...config,
            pluginCode: inCode || code || PluginExampleCode,
          },
        });
        toast({
          title: '更新代码成功',
          position: 'top',
          description: '配置已更新',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        const errormsg =
          error instanceof Error ? error.message : JSON.stringify(error);
        toast({
          title: '更新配置失败',
          position: 'top',
          description: errormsg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [code, config, appId, instanceId, toast], // 更新依赖项
  );

  const handleDefaultCode = () => {
    onOpen();
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider('javascript', {
      // @ts-ignore
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'require',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'require()',
            documentation: '引入模块',
          },
          {
            label: 'console',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log()',
            documentation: '打印日志',
          },
        ];
        return { suggestions };
      },
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      PluginExtraLib,
      'ts:filename/types.d.ts',
    );

    // FIXME: 这里似乎有引用问题，暂时注释掉
    // monaco.editor.addEditorAction({
    //   id: 'save-code',
    //   label: '保存代码',
    //   keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    //   run: () => {
    //     handleSaveCode();
    //   },
    // });
  };

  const handleCheckPlugin = async () => {
    try {
      const resp = await checkPluginAvailability({
        code: code || '',
        ctx: context,
        messages,
      });

      setConsoleLogs(resp.consoleOutput || []);

      if (resp.status) {
        toast({
          title: '插件测试通过',
          position: 'top',
          description: resp.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: '插件测试失败',
          position: 'top',
          description: resp.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: '检查插件失败',
        description: error instanceof Error ? error.message : '未知错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExportCode = () => {
    const blob = new Blob([code || ''], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'code.js';
    link.click();
    toast({
      title: '代码已导出',
      position: 'top',
      description: '代码文件已下载',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (isLoading || !data || !config) {
    return (
      <Stack>
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <VStack spacing="4" align="start" width="100%">
      <Text fontSize="1xl" fontWeight="bold">
        {appId || instanceId ? '' : '全局'}插件配置
      </Text>
      <Divider />
      <Text>
        通过 JavaScript
        代码来实现自定义的回复逻辑，当使用了自定义插件后，系统将不再使用默认的回复逻辑。全部的回复逻辑将由您的代码来实现。
      </Text>

      <HStack>
        <Switch
          isChecked={config.usePlugin}
          onChange={() => {
            handleUpdateConfig({ usePlugin: !config.usePlugin });
          }}
        >
          启用自定义代码
        </Switch>
      </HStack>
      {config.usePlugin && (
        <>
          <HStack>
            <Button onClick={handleDefaultCode} colorScheme="red" size="sm">
              重置代码
            </Button>
            <Button
              onClick={() => {
                handleSaveCode();
              }}
              colorScheme="teal"
              size="sm"
            >
              保存代码
            </Button>
            <Button
              onClick={() => {
                setIsOpenMessageModal(true);
              }}
              size="sm"
              colorScheme="teal"
            >
              配置测试用例
            </Button>
            <Button onClick={handleCheckPlugin} colorScheme="green" size="sm">
              测试插件
            </Button>
            <Button onClick={handleExportCode} colorScheme="blue" size="sm">
              导出代码
            </Button>
          </HStack>

          <Box width="100%" height="400px">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => {
                setCode(value);
              }}
              beforeMount={handleEditorWillMount}
              theme="vs-dark"
            />
          </Box>

          <Divider />

          {/* 展示日志 */}
          {consoleLogs && consoleLogs.length > 0 && (
            <>
              <Text fontSize="1xl" fontWeight="bold">
                插件执行日志：
              </Text>
              <Box height="200px" overflowY="auto">
                {consoleLogs.map((log, index) => (
                  <Text key={index}>
                    {log.level} {log.time} {log.message}
                  </Text>
                ))}
              </Box>
            </>
          )}

          <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  重置代码
                </AlertDialogHeader>

                <AlertDialogBody>
                  你确定要重置代码吗？这将会清空当前的代码。
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onClose}>
                    取消
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      setCode(PluginExampleCode);
                      handleSaveCode(PluginExampleCode);
                      onClose();
                    }}
                    ml={3}
                  >
                    重置
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </>
      )}

      <MessageModal
        isOpen={isOpenMessageModal}
        onClose={() => setIsOpenMessageModal(false)}
      />
    </VStack>
  );
};

export default PluginSettings;
