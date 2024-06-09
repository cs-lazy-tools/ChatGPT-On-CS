import React, { useState, useEffect } from 'react';
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
import { PluginExtraLib, PluginExampleCode } from '../../utils/constants';
import { getConfig, updateConfig } from '../../services/platform/controller';
import { PluginConfig } from '../../services/platform/platform.d';

const PluginSettings = ({
  appId,
  instanceId,
}: {
  appId?: string;
  instanceId?: string;
}) => {
  // TODO: 后面需要把这个参数说明放到文档中

  const [code, setCode] = useState<string | undefined>(PluginExampleCode);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<any>();
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

  const handleSaveCode = async (icode?: string) => {
    if (!config) return;
    try {
      await updateConfig({
        appId,
        instanceId,
        type: 'plugin',
        cfg: {
          ...config,
          pluginCode: icode || code || PluginExampleCode,
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
  };

  const handleDefaultCode = () => {
    onOpen();
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider('javascript', {
      // @ts-ignore
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'cc.get',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'cc.get(ctx)',
            documentation: '从上下文中取得当前使用的配置',
          },
        ];
        return { suggestions };
      },
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      PluginExtraLib,
      'ts:filename/types.d.ts',
    );
  };

  const handleExportCode = () => {
    const blob = new Blob([code || ''], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'code.js';
    link.click();
    toast({
      title: '代码已导出',
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
        全局插件配置
      </Text>
      <Divider />
      <Text>
        通过 JavaScript
        代码来实现自定义的回复逻辑，当使用了自定义插件后，系统将不再使用默认的回复逻辑。全部的回复逻辑将由您的代码来实现。
      </Text>
      <Switch
        isChecked={config.usePlugin}
        onChange={() => {
          handleUpdateConfig({ usePlugin: !config.usePlugin });
        }}
      >
        启用自定义代码
      </Switch>
      {config.usePlugin && (
        <>
          <Box width="100%" height="400px">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={setCode}
              beforeMount={handleEditorWillMount}
              theme="vs-dark"
            />
          </Box>

          <HStack>
            <Button
              onClick={() => {
                handleSaveCode();
              }}
              colorScheme="orange"
            >
              保存代码
            </Button>

            <Button onClick={handleDefaultCode} colorScheme="red">
              重置代码
            </Button>

            <Button onClick={handleExportCode} colorScheme="teal">
              校验代码
            </Button>

            <Button onClick={handleExportCode} colorScheme="blue">
              导出代码
            </Button>
          </HStack>

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
    </VStack>
  );
};

export default PluginSettings;
