import React, { useRef, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  VStack,
  Button,
  HStack,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { FiSave } from 'react-icons/fi';
import { RepeatIcon } from '@chakra-ui/icons';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  PluginExampleCode,
  PluginExtraLib,
} from '../../../common/utils/constants';
import { Plugin } from '../../../common/services/platform/platform';

type PluginEditorProps = {
  plugin?: Plugin;
  setPlugin: (plugin: Plugin) => void;
  handleSaveCode: (code?: string) => void;
};

// 子组件：插件编辑页
const PluginEditor = ({
  plugin,
  setPlugin,
  handleSaveCode,
}: PluginEditorProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();
  const handleSaveCodeRef = useRef(handleSaveCode);

  useEffect(() => {
    handleSaveCodeRef.current = handleSaveCode;
  }, [handleSaveCode]);

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

    monaco.editor.addEditorAction({
      id: 'save-code',
      label: '保存代码',
      // eslint-disable-next-line no-bitwise
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        handleSaveCodeRef.current();
      },
    });
  };

  return (
    <Box position="relative" width="100%">
      {plugin && plugin.source !== 'custom' && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="center"
          alignItems="center"
          zIndex="1"
        >
          <Text color="white" fontSize="lg">
            系统插件无法编辑
          </Text>
        </Flex>
      )}

      <VStack spacing="4" align="start" width="100%">
        <HStack>
          <Button
            leftIcon={<FiSave />}
            onClick={() => handleSaveCode()}
            colorScheme="teal"
            size="sm"
          >
            保存代码
          </Button>
          <Button leftIcon={<RepeatIcon />} onClick={onOpen} size="sm">
            重置代码
          </Button>
        </HStack>
        <Box width="100%" height="400px">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={plugin?.code || PluginExampleCode}
            onChange={(value) => {
              setPlugin({ ...plugin, code: value || '' });
            }}
            beforeMount={handleEditorWillMount}
            theme="vs-dark"
          />
        </Box>
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
                    setPlugin({ ...plugin, code: PluginExampleCode });
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
      </VStack>
    </Box>
  );
};

export default PluginEditor;
