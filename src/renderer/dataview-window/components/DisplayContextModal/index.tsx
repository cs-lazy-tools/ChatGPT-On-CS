import React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
} from '@chakra-ui/react';

interface DisplayContextModalProps {
  data: string;
  isOpen: boolean;
  onClose: () => void;
}

type ParsedData = [string, string | boolean][];

const DisplayContextModal: React.FC<DisplayContextModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const parseData = (
    // eslint-disable-next-line @typescript-eslint/no-shadow
    data: string | [string, string | boolean][] | null,
  ): ParsedData | null => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data;
    }
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        return parsedData;
      }
    } catch (error) {
      console.error('Error parsing data:', error);
    }
    return null;
  };

  const renderContent = (parsedData: ParsedData | null, rawData: string) => {
    if (parsedData) {
      return (
        <VStack align="start">
          {parsedData.map(([key, value], index) => (
            <Text key={index}>
              <strong>{key}:</strong> {value}
            </Text>
          ))}
        </VStack>
      );
    }
    return <Text>{rawData}</Text>;
  };

  const parsedData = parseData(data);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>详情</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {data ? (
              renderContent(parsedData, data)
            ) : (
              <Text>
                <strong>No data</strong>
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DisplayContextModal;
