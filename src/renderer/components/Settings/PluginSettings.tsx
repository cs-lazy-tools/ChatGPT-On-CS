import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Switch,
  useToast,
  Divider,
} from '@chakra-ui/react';
import Editor, { Monaco } from '@monaco-editor/react';
import { PluginExtraLib, PluginExampleCode } from '../../utils/constants';

const PluginSettings = () => {
  // TODO: 后面需要把这个参数说明放到文档中

  const [code, setCode] = useState<string | undefined>(PluginExampleCode);
  const [isEditorEnabled, setIsEditorEnabled] = useState<boolean>(true);
  const toast = useToast();

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

  const handleEditorChange = (value: string | undefined) => {
    setCode(value);
  };

  const handleToggleEditor = () => {
    setIsEditorEnabled(!isEditorEnabled);
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
      <Switch isChecked={isEditorEnabled} onChange={handleToggleEditor}>
        启用自定义代码
      </Switch>
      {isEditorEnabled && (
        <>
          <Box width="100%" height="400px">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              defaultValue={code}
              onChange={handleEditorChange}
              beforeMount={handleEditorWillMount}
              theme="vs-dark"
            />
          </Box>

          <Button onClick={handleExportCode} colorScheme="blue">
            导出代码
          </Button>
        </>
      )}
    </VStack>
  );
};

export default PluginSettings;
