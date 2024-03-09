import React, { useRef, useState, useEffect } from 'react';
import { Box, Textarea, TextareaProps, Text } from '@chakra-ui/react';

type Props = TextareaProps & {
  title?: string;
};

const Editor = React.memo(function Editor({
  textareaRef,
  maxLength,
  onChange,
  value,
  ...props
}: Props & {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onOpenModal?: () => void;
}) {
  // @ts-ignore
  const [currentLength, setCurrentLength] = useState(value?.length || 0);

  // 处理文本变化的函数
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentLength(e.target.value.length); // 更新当前文本长度
    if (onChange) {
      onChange(e); // 如果有外部传入的onChange事件处理器，也调用它
    }
  };

  // 处理初始值的情况
  useEffect(() => {
    if (value) {
      // @ts-ignore
      setCurrentLength(value.length);
    }
  }, [value]);

  return (
    <Box h={'100%'} w={'100%'} position={'relative'}>
      <Textarea
        ref={textareaRef}
        maxW={'100%'}
        maxLength={maxLength}
        onChange={handleChange} // 使用自定义的handleChange来更新文本长度
        value={value} // 确保Textarea显示的是传入的value
        {...props}
      />
      {maxLength && ( // 当设置了maxLength时，展示当前字符数和最大允许字符数
        <Text fontSize="sm" position="absolute" right="4" bottom="4">
          {`${currentLength}/${maxLength}`}
        </Text>
      )}
    </Box>
  );
});

const MyTextarea = React.forwardRef<HTMLTextAreaElement, Props>(
  function MyTextarea(props, ref) {
    const TextareaRef = useRef<HTMLTextAreaElement>(null);

    // 将外部传入的ref绑定到Textarea上，确保外部能通过ref控制Textarea
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(TextareaRef.current);
      } else if (ref) {
        ref.current = TextareaRef.current;
      }
    }, [ref]);

    return (
      <>
        <Editor textareaRef={TextareaRef} {...props} />
      </>
    );
  },
);

export default React.memo(MyTextarea);
