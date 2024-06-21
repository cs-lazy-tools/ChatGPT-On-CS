import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalContentProps,
  Box,
  Image,
} from '@chakra-ui/react';

export interface MyModalProps extends ModalContentProps {
  iconSrc?: string;
  title?: any;
  isCentered?: boolean;
  isOpen: boolean;
  onClose?: () => void;
}

const MyModal = ({
  isOpen,
  onClose,
  iconSrc,
  title,
  children,
  isCentered,
  w = 'auto',
  maxW = ['90vw', '600px'],
  style,
  ...props
}: MyModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose && onClose()}
      autoFocus={false}
      isCentered={isCentered}
    >
      <ModalOverlay />
      <ModalContent
        w={w}
        minW={['90vw', '400px']}
        maxW={maxW}
        position={'relative'}
        maxH={'85vh'}
        {...props}
      >
        {!title && onClose && <ModalCloseButton zIndex={1} />}
        {!!title && (
          <ModalHeader
            display={'flex'}
            alignItems={'center'}
            fontWeight={500}
            background={'myBackground.100'}
            color={'myText.500'}
            py={'10px'}
          >
            {iconSrc && (
              <>
                <Image
                  mr={3}
                  objectFit={'contain'}
                  alt=""
                  src={iconSrc}
                  w={'20px'}
                />
              </>
            )}
            {title}
            <Box flex={1} />
            {onClose && (
              <ModalCloseButton position={'relative'} top={0} right={0} />
            )}
          </ModalHeader>
        )}

        <Box
          overflow={props.overflow || 'overlay'}
          h={'100%'}
          display={'flex'}
          flexDirection={'column'}
          bg={'myBackground.100'}
          color={'myText.500'}
        >
          {children}
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default MyModal;
