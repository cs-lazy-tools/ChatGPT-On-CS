import React, { useRef } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Divider,
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

type PluginEditorProps = {
  code?: string;
  setCode: (code?: string) => void;
  handleSaveCode: (code?: string) => void;
};

// 子组件：插件编辑页
const PluginEditor = ({ code, setCode, handleSaveCode }: PluginEditorProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();

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
  };

  return (
    <VStack spacing="4" align="start" width="100%">
      <Text fontSize="1xl" fontWeight="bold">
        插件编辑页
      </Text>
      <Divider />
      <HStack>
        <Button
          leftIcon={<FiSave />}
          onClick={() => handleSaveCode()}
          colorScheme="teal"
          size="sm"
        >
          保存代码
        </Button>
        <Button
          leftIcon={<RepeatIcon />}
          onClick={onOpen}
          colorScheme="red"
          size="sm"
        >
          重置代码
        </Button>
      </HStack>
      <Box width="100%" height="400px">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => setCode(value)}
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
    </VStack>
  );
};

export default PluginEditor;
