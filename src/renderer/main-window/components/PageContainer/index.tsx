import React, { ReactNode } from 'react';
import { Box, Flex, Spinner, BoxProps } from '@chakra-ui/react';

interface PageContainerProps extends BoxProps {
  children?: ReactNode;
  isLoading?: boolean;
  text?: string;
  insertProps?: BoxProps;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  isLoading = false,
  text = '',
  insertProps = {},
  ...props
}) => {
  return (
    <Box h={'100%'} p={[0, 5]} px={[0, 6]} position={'relative'} {...props}>
      <Box h={'100%'} overflow={'overlay'} {...insertProps}>
        {children}
      </Box>
      {isLoading && (
        <Flex
          position={'absolute'}
          zIndex={1000}
          top={0}
          left={0}
          right={0}
          bottom={0}
          alignItems={'center'}
          justifyContent={'center'}
          flexDirection={'column'}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            color="myPrimary.200"
            size="xl"
          />
          {text && (
            <Box mt={2} fontWeight={'bold'}>
              {text}
            </Box>
          )}
        </Flex>
      )}
    </Box>
  );
};

export default PageContainer;
